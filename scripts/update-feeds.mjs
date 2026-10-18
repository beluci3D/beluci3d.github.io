// ─────────────────────────────────────────────────────────────
//  beluci — Auto-Update für MakerWorld-Modelle & YouTube-Videos
//  Läuft automatisch per GitHub Action (alle 3 Stunden + bei jedem Push).
//  Schreibt:  data/makerworld.json   data/youtube.json   assets/mw/*.webp
//  Schlägt eine Quelle fehl, bleiben die zuletzt gespeicherten Daten erhalten.
// ─────────────────────────────────────────────────────────────
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(await fs.readFile(path.join(ROOT, "site.config.json"), "utf8"));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const LOG = [];
const log = (...a) => { const m = a.map(String).join(" "); LOG.push(m); console.log("[feeds]", m); };

async function readJson(rel, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(ROOT, rel), "utf8")); } catch { return fallback; }
}
async function writeJson(rel, obj) {
  const p = path.join(ROOT, rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 1) + "\n");
}
async function get(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9", ...(opts.headers || {}) },
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
  return res;
}
const decode = (s = "") =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
   .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n));

// ═════════════════════════════ YOUTUBE ═════════════════════════════
export function parseYouTubeRss(xml) {
  const channelTitle = decode((xml.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const e = m[1];
    const pick = (re) => decode((e.match(re) || [])[1] || "").trim();
    const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || `https://www.youtube.com/watch?v=${id}`;
    return {
      id,
      title: pick(/<title>([\s\S]*?)<\/title>/),
      published: pick(/<published>([^<]+)<\/published>/),
      description: pick(/<media:description>([\s\S]*?)<\/media:description>/).slice(0, 400),
      views: Number((e.match(/<media:statistics[^>]*views="(\d+)"/) || [])[1] || 0),
      likes: Number((e.match(/<media:starRating[^>]*count="(\d+)"/) || [])[1] || 0),
      isShort: /\/shorts\//.test(link),
      url: link,
    };
  });
  return { channelTitle, videos: entries.filter((v) => v.id) };
}

async function resolveChannel(handle) {
  const res = await get(`https://www.youtube.com/@${handle}`, {
    headers: { cookie: "CONSENT=YES+cb; SOCS=CAI" },
  });
  const html = await res.text();
  const id =
    (html.match(/"externalId":"(UC[\w-]{22})"/) ||
     html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/) ||
     html.match(/"channelId":"(UC[\w-]{22})"/) || [])[1];
  const subs = (html.match(/"(\d[\d.,]*\s?[KMkm]?) subscribers"/) || [])[1] || "";
  const avatar = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] || "";
  const videoCount = (html.match(/"(\d[\d.,]*) videos"/) || [])[1] || "";
  return { id, subs, avatar, videoCount };
}

async function updateYouTube() {
  const prev = await readJson("data/youtube.json", null);
  let channelId = cfg.youtubeChannelId || prev?.channel?.id || "";
  let extra = {};
  try {
    extra = await resolveChannel(cfg.youtubeHandle);
    channelId = channelId || extra.id;
  } catch (e) { log("YouTube Kanalseite nicht lesbar:", e.message); }
  if (!channelId) throw new Error("YouTube channelId unbekannt – bitte in site.config.json eintragen");

  const xml = await (await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`)).text();
  const { channelTitle, videos } = parseYouTubeRss(xml);
  const out = {
    updatedAt: new Date().toISOString(),
    channel: {
      id: channelId,
      handle: cfg.youtubeHandle,
      title: channelTitle || prev?.channel?.title || cfg.youtubeHandle,
      url: `https://www.youtube.com/@${cfg.youtubeHandle}`,
      subscribers: extra.subs || prev?.channel?.subscribers || "",
      videoCount: extra.videoCount || prev?.channel?.videoCount || "",
      avatar: extra.avatar || prev?.channel?.avatar || "",
    },
    videos: videos.slice(0, cfg.maxVideos || 12),
  };
  await writeJson("data/youtube.json", out);
  log(`YouTube ✓ ${out.videos.length} Videos (${channelId})`);
}

// ═════════════════════════════ MAKERWORLD ═════════════════════════════
const MW_API = "https://api.bambulab.com/v1/design-service";

/** Holt aus beliebigem JSON alle Objekte, die wie ein MakerWorld-Design aussehen. */
export function collectDesigns(node, out = new Map()) {
  if (Array.isArray(node)) { node.forEach((n) => collectDesigns(n, out)); return out; }
  if (!node || typeof node !== "object") return out;
  const looksLikeDesign =
    (typeof node.id === "number" || /^\d+$/.test(String(node.id || ""))) &&
    typeof node.title === "string" &&
    ("cover" in node || "coverUrl" in node || "likeCount" in node || "downloadCount" in node);
  if (looksLikeDesign && !out.has(String(node.id))) out.set(String(node.id), node);
  for (const v of Object.values(node)) if (v && typeof v === "object") collectDesigns(v, out);
  return out;
}

const num = (...v) => { for (const x of v) if (x != null && !isNaN(Number(x))) return Number(x); return 0; };

export function normalizeDesign(d) {
  const cover =
    d.cover || d.coverUrl || d.coverImage ||
    (Array.isArray(d.images) && (d.images[0]?.url || d.images[0])) ||
    (Array.isArray(d.designExtension?.design_pictures) && d.designExtension.design_pictures[0]?.url) || "";
  const created = d.publishTime || d.createTime || d.createdAt || d.publishedAt || "";
  const tags = (d.tags || d.tagsOriginal || []).map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean);
  return {
    id: String(d.id),
    title: String(d.title || "").trim(),
    url: `https://makerworld.com/en/models/${d.id}${d.slug ? "-" + d.slug : ""}`,
    cover: typeof cover === "string" ? cover : "",
    likes: num(d.likeCount, d.likes),
    downloads: num(d.downloadCount, d.downloads),
    prints: num(d.printCount, d.prints),
    collects: num(d.collectionCount, d.collectCount),
    comments: num(d.commentCount),
    boosts: num(d.boostCnt, d.boostCount),
    created: typeof created === "number" ? new Date(created * (created < 1e12 ? 1000 : 1)).toISOString() : created,
    tags: tags.slice(0, 6),
    category: d.categoryName || d.category?.name || "",
    creatorUid: String(d.designCreator?.uid ?? d.creatorUid ?? d.uid ?? ""),
    creatorHandle: String(d.designCreator?.handle ?? "").replace(/^@/, ""),
  };
}

async function uidFromModelUrl(u) {
  const id = (String(u).match(/models\/(\d+)/) || String(u).match(/^(\d+)$/) || [])[1];
  if (!id) return "";
  const d = await (await get(`${MW_API}/design/${id}`)).json();
  return String(d?.designCreator?.uid || d?.creatorUid || "");
}

/** Profilseite als normales HTML laden und eingebettete Daten auslesen. */
async function viaHtml(handle) {
  const out = { uid: "", designs: [], ids: [] };
  for (const u of [`https://makerworld.com/en/@${handle}/upload`, `https://makerworld.com/en/@${handle}`]) {
    try {
      const html = await (await get(u, { headers: { accept: "text/html,application/xhtml+xml" } })).text();
      const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nd) { try { out.designs.push(...collectDesigns(JSON.parse(nd[1])).values()); } catch {} }
      out.ids.push(...[...html.matchAll(/\/models\/(\d{4,})/g)].map((m) => m[1]));
      out.uid = out.uid || (html.match(/\/user\/[^"']*?\/(\d{6,})\//) || [])[1] || "";
      log(`HTML ${u}: ${out.designs.length} Designs, ${new Set(out.ids).size} Modell-Links, uid=${out.uid || "?"}`);
      if (out.designs.length || out.ids.length) break;
    } catch (e) { log("HTML-Abruf fehlgeschlagen:", u, e.message); }
  }
  out.ids = [...new Set(out.ids)];
  return out;
}

/** Fallback mit echtem Browser (Playwright) – löst Cloudflare-Checks meist. */
async function viaBrowser(handle, uid) {
  let chromium;
  try { ({ chromium } = await import("playwright")); } catch { log("Playwright nicht installiert – Browser-Fallback übersprungen"); return {}; }
  const browser = await chromium.launch({ args: ["--disable-blink-features=AutomationControlled"] });
  const captured = [];
  try {
    const ctx = await browser.newContext({ userAgent: UA, locale: "en-US", viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    page.on("response", async (r) => {
      if (!/\/api\//.test(r.url())) return;
      if (!(r.headers()["content-type"] || "").includes("json")) return;
      try { captured.push(await r.json()); } catch {}
    });
    await page.goto(`https://makerworld.com/en/@${handle}/upload`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000);
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 2500); await page.waitForTimeout(1200); }
    const next = await page.evaluate(() => document.getElementById("__NEXT_DATA__")?.textContent || "");
    if (next) { try { captured.push(JSON.parse(next)); } catch {} }
    // uid aus der Seite ermitteln
    if (!uid) {
      const blob = JSON.stringify(captured);
      const re = new RegExp(`"handle":"@?${handle}"[^{}]{0,400}?"uid":(\\d+)|"uid":(\\d+)[^{}]{0,400}?"handle":"@?${handle}"`, "i");
      const m = blob.match(re);
      uid = m ? m[1] || m[2] : "";
    }
    // direkt im Seitenkontext die API abfragen (Cookies bestehen Cloudflare)
    if (uid) {
      const data = await page.evaluate(async ([u, h]) => {
        try {
          const r = await fetch(`/api/v1/design-service/published/${u}/design?handle=@${h}&limit=100&offset=0`);
          return await r.json();
        } catch { return null; }
      }, [uid, handle]);
      if (data) captured.push(data);
    }
  } catch (e) { log("Browser-Fallback Fehler:", e.message); }
  finally { await browser.close(); }
  return { uid, designs: [...collectDesigns(captured).values()] };
}

async function saveCover(d) {
  if (!d.cover || !/^https?:/.test(d.cover)) return d.cover;
  const rel = `assets/mw/${d.id}.webp`;
  const abs = path.join(ROOT, rel);
  try { await fs.access(abs); return rel; } catch {}
  try {
    const buf = Buffer.from(await (await get(d.cover)).arrayBuffer());
    let out = buf;
    try {
      const sharp = (await import("sharp")).default;
      out = await sharp(buf).resize({ width: 900, height: 900, fit: "cover", position: "attention" }).webp({ quality: 80 }).toBuffer();
    } catch { /* ohne sharp: Original speichern */ }
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, out);
    return rel;
  } catch (e) { log("Cover-Download fehlgeschlagen:", d.id, e.message); return d.cover; }
}

async function updateMakerWorld() {
  const handle = cfg.makerworldHandle;
  const prev = await readJson("data/makerworld.json", null);
  let uid = String(cfg.makerworldUid || prev?.profile?.uid || "");
  if (cfg.makerworldAnyModelUrl) {
    try { const u = await uidFromModelUrl(cfg.makerworldAnyModelUrl); if (u) uid = u; log("uid über Modell-Link:", u || "?"); }
    catch (e) { log("uid über Modell-Link fehlgeschlagen:", e.message); }
  }

  let raw = [];
  const fromApi = async (u) => {
    const list = [];
    for (let offset = 0; offset < 400; offset += 100) {
      const j = await (await get(`${MW_API}/published/${u}/design?offset=${offset}&limit=100`)).json();
      const hits = j.hits || j.data || j.list || [];
      list.push(...hits);
      if (hits.length < 100) break;
    }
    return list;
  };
  // 1) Offizielle Bambu-API (kein Cloudflare)
  if (uid) {
    try { raw = await fromApi(uid); log(`MakerWorld API ✓ ${raw.length} Designs (uid ${uid})`); }
    catch (e) { log("MakerWorld API fehlgeschlagen:", e.message); }
  }
  // 2) Profilseite als HTML
  let html = { ids: [] };
  if (!raw.length) {
    html = await viaHtml(handle);
    if (!uid && html.uid) { uid = html.uid; try { raw = await fromApi(uid); log(`API mit HTML-uid ✓ ${raw.length}`); } catch (e) { log("API mit HTML-uid ✗", e.message); } }
    if (!raw.length && html.designs.length) raw = html.designs;
  }
  // 3) Echter Browser
  if (!raw.length) {
    const r = await viaBrowser(handle, uid);
    uid = uid || r.uid || "";
    raw = r.designs || [];
    log(`MakerWorld Browser ${raw.length ? "✓" : "✗"} ${raw.length} Designs, uid=${uid || "?"}`);
  }
  // 4) Einzelne Modelle über ihre IDs nachladen
  const ids = [...new Set([...(html.ids || []), ...(cfg.makerworldModelIds || []).map(String)])];
  if (!raw.length && ids.length) {
    for (const id of ids.slice(0, cfg.maxModels || 48)) {
      try { raw.push(await (await get(`${MW_API}/design/${id}`)).json()); }
      catch (e) { log("Modell", id, "✗", e.message); }
    }
    log(`Einzelabruf: ${raw.length}/${ids.length} Modelle`);
  }
  if (!raw.length) throw new Error("Keine MakerWorld-Designs gefunden – alte Daten bleiben bestehen");

  let models = raw.map(normalizeDesign).filter((m) => m.title);
  // nur eigene Modelle behalten (falls Ersteller-Infos vorhanden)
  models = models.filter((m) =>
    (!m.creatorUid || !uid || m.creatorUid === String(uid)) &&
    (!m.creatorHandle || m.creatorHandle.toLowerCase() === handle.toLowerCase()));
  models.sort((a, b) => String(b.created).localeCompare(String(a.created)));
  models = models.slice(0, cfg.maxModels || 48);
  for (const m of models) { m.image = await saveCover(m); }

  // Profil-Statistik (öffentlich)
  let profile = { uid, handle, url: `https://makerworld.com/en/@${handle}` };
  if (uid) {
    try {
      const p = await (await get(`https://api.bambulab.com/v1/user-service/user/profile/${uid}`)).json();
      profile = { ...profile, name: p.name || p.nickname || "", avatar: p.avatar || "",
        followers: num(p.fanCount, p.followerCount, p.MWCount?.fanCount), };
    } catch {}
  }
  const totals = models.reduce((t, m) => ({
    downloads: t.downloads + m.downloads, likes: t.likes + m.likes, prints: t.prints + m.prints,
  }), { downloads: 0, likes: 0, prints: 0 });

  await writeJson("data/makerworld.json", {
    updatedAt: new Date().toISOString(), profile, totals: { models: models.length, ...totals }, models,
  });
  log(`MakerWorld ✓ ${models.length} Modelle gespeichert`);
}

// ═════════════════════════════ RUN ═════════════════════════════
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const results = await Promise.allSettled([updateYouTube(), updateMakerWorld()]);
  results.forEach((r, i) => r.status === "rejected" && log(["YouTube", "MakerWorld"][i], "✗", r.reason?.message));
  await writeJson("data/feeds-log.json", { at: new Date().toISOString(), log: LOG });
  // Exit 0, damit die Website trotzdem mit den letzten Daten deployed wird.
}
