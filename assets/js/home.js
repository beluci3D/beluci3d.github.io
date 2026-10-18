/* beluci — homepage: live MakerWorld models, YouTube videos, electronics projects */
(function () {
  "use strict";
  const { t, fmt, ago, esc, countUp, observe, openModal, toast } = window.B;
  const $ = (s, r = document) => r.querySelector(s);
  const bust = "?v=" + Math.floor(Date.now() / 6e5); // 10-min cache buster
  const getJSON = (u) => fetch(u + bust).then((r) => (r.ok ? r.json() : null)).catch(() => null);

  let MW = null, YT = null, EL = [];
  let sort = "new";
  const svg = (id) => `<svg><use href="#${id}"/></svg>`;
  const isNew = (d) => d && Date.now() - new Date(d) < 21 * 864e5;

  // ═════════════ rails: arrows ═════════════
  function syncArrows(rail) {
    const box = document.querySelector(`.arrows[data-for="${rail.id}"]`); if (!box) return;
    const [l, r] = box.querySelectorAll(".ar");
    l.disabled = rail.scrollLeft < 8;
    r.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
  }
  document.querySelectorAll(".arrows").forEach((box) => {
    const rail = document.getElementById(box.dataset.for);
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".ar"); if (!b) return;
      rail.scrollBy({ left: +b.dataset.dir * rail.clientWidth * 0.8, behavior: "smooth" });
    });
    rail.addEventListener("scroll", () => syncArrows(rail), { passive: true });
    addEventListener("resize", () => syncArrows(rail));
  });

  // ═════════════ MakerWorld ═════════════
  function sorted() {
    const m = [...(MW?.models || [])];
    if (sort === "popular") m.sort((a, b) => b.likes + b.collects - (a.likes + a.collects));
    else if (sort === "downloads") m.sort((a, b) => b.downloads + b.prints - (a.downloads + a.prints));
    else m.sort((a, b) => String(b.created).localeCompare(String(a.created)));
    return m;
  }
  function modelCard(m, i) {
    const img = m.image || m.cover;
    const hot = sort === "downloads" ? "dl" : sort === "popular" ? "like" : "";
    return `<a class="mc" href="${esc(m.url)}" target="_blank" rel="noopener" title="${esc(m.title)}">
      <div class="mc-img">
        ${img ? `<img src="${esc(img)}" alt="${esc(m.title)}" loading="${i < 5 ? "eager" : "lazy"}" onload="this.classList.add('ld')" onerror="this.parentNode.classList.add('skeleton');this.remove()">` : ""}
        ${isNew(m.created) ? `<span class="new">${t("newest")}</span>` : ""}
        <span class="go">${svg("i-up")}</span>
      </div>
      <h3>${esc(m.title)}</h3>
      <div class="st">
        <span class="${hot === "like" ? "hot" : ""}">${svg("i-heart")}${fmt(m.likes)}</span>
        <span class="${hot === "dl" ? "hot" : ""}">${svg("i-dl")}${fmt(m.downloads)}</span>
        ${m.prints ? `<span>${svg("i-print")}${fmt(m.prints)}</span>` : ""}
      </div>
    </a>`;
  }
  function renderModels() {
    const rail = $("#models-grid");
    const list = sorted();
    $("#mw-count").textContent = list.length ? `${list.length} ${t("models")}` : "";
    rail.innerHTML = list.length
      ? list.map(modelCard).join("")
      : `<div class="empty-mini"><span>${t("noModels")} …</span><a class="btn btn-ghost btn-sm" href="https://makerworld.com/@beluci" target="_blank" rel="noopener">${t("toMW")}${svg("i-up")}</a></div>`;
    rail.scrollLeft = 0; syncArrows(rail);
  }
  $("#mw-tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    sort = b.dataset.sort;
    $("#mw-tabs").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    renderModels();
  });

  // ═════════════ YouTube ═════════════
  function vcard(v, i) {
    const meta = [v.published ? ago(v.published) : "", v.views ? `${fmt(v.views)} ${t("views")}` : ""].filter(Boolean).join(" · ");
    const tag = i === 0 && isNew(v.published) ? `<span class="tag new">${t("newest")}</span>` : v.isShort ? `<span class="tag">${t("short")}</span>` : "";
    return `<button class="vc" data-vid="${esc(v.id)}" aria-label="${esc(v.title)}">
      <div class="vc-img"><img src="https://i.ytimg.com/vi/${esc(v.id)}/${i < 3 ? "maxresdefault" : "hqdefault"}.jpg" alt="" loading="${i < 4 ? "eager" : "lazy"}" onerror="if(!this.dataset.f){this.dataset.f=1;this.src='https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg'}">${tag}<span class="pl">${svg("i-play")}</span></div>
      <h3>${esc(v.title)}</h3>${meta ? `<div class="meta">${meta}</div>` : ""}
    </button>`;
  }
  function renderVideos() {
    const rail = $("#yt-wrap");
    const vids = YT?.videos || [];
    rail.innerHTML = vids.length
      ? vids.map(vcard).join("")
      : `<div class="empty-mini"><span>${t("noVideos")} …</span><a class="btn btn-ghost btn-sm" href="https://www.youtube.com/@Belutschy" target="_blank" rel="noopener">${t("toYT")}${svg("i-up")}</a></div>`;
    const ch = YT?.channel || {};
    if (ch.subscribers) $("#yt-meta").textContent = `YouTube · @Belutschy · ${ch.subscribers} ${t("subs")}`;
    rail.scrollLeft = 0; syncArrows(rail);
  }
  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-vid]"); if (!v) return;
    $("#video-slot").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.dataset.vid)}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" title="YouTube"></iframe>`;
    openModal("video-modal");
  });
  $("#video-modal").addEventListener("closed", () => ($("#video-slot").innerHTML = ""));

  // ═════════════ Electronics ═════════════
  function hl(code) {
    const KW = "void|int|float|char|const|byte|bool|if|else|while|for|return|String|true|false|HIGH|LOW|OUTPUT|INPUT|INPUT_PULLUP|PROGMEM|unsigned|long|static";
    const re = new RegExp(`(\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*")|(#\\w+)|\\b(${KW})\\b|\\b(\\d+(?:\\.\\d+)?)\\b`, "g");
    let out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "p" : m[4] ? "k" : "n";
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }
  const L = (o) => (typeof o === "string" ? o : o?.[window.B.lang] || o?.de || "");
  function renderElectronics() {
    const g = $("#el-grid");
    g.innerHTML = EL.map((p, i) => `<button class="ecard rv" style="--d:${i * 0.08}s" data-proj="${i}">
      <div class="sch"><img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy"></div>
      <div class="eb"><span class="board">${esc(p.board)}</span><h3>${esc(p.title)}</h3><p>${esc(L(p.desc))}</p>
      <span class="open">${t("open")} ${svg("i-arrow")}</span></div></button>`).join("");
    observe(g);
  }
  function openProject(i, tab = "s") {
    const p = EL[i];
    $("#proj-slot").innerHTML = `
      <div class="pm-head"><div class="eyebrow"><span class="dot"></span>${esc(p.board)}</div><h3>${esc(p.title)}</h3><p>${esc(L(p.desc))}</p>
        <div class="parts">${p.parts.map((x) => `<span>${esc(x)}</span>`).join("")}</div></div>
      <div class="pm-tabs"><div class="tabs" id="pm-tabs"><button data-t="s" class="${tab === "s" ? "on" : ""}">${t("schematic")}</button><button data-t="c" class="${tab === "c" ? "on" : ""}">${t("code")}</button></div></div>
      <div class="pm-body">${tab === "s"
        ? `<div class="pm-sch"><img src="${esc(p.img)}" alt="${t("schematic")} ${esc(p.title)}"></div><div class="wiring"><b>${t("wiring")}:</b> ${esc(L(p.wiring))}</div>`
        : `<div class="code"><div class="code-top"><span>${esc(p.lang)} · ${p.code.split("\n").length} lines</span><button class="copy" id="copy">${t("copy")}</button></div><pre><code>${hl(p.code)}</code></pre></div>`}
      </div>`;
    $("#pm-tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) openProject(i, b.dataset.t); });
    $("#copy")?.addEventListener("click", async (e) => {
      try { await navigator.clipboard.writeText(p.code); } catch { const ta = Object.assign(document.createElement("textarea"), { value: p.code }); document.body.append(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
      e.target.textContent = t("copied"); e.target.classList.add("ok"); toast(t("copied"));
      setTimeout(() => { e.target.textContent = t("copy"); e.target.classList.remove("ok"); }, 1800);
    });
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-proj]"); if (!c) return;
    openProject(+c.dataset.proj); openModal("proj-modal");
  });

  // ═════════════ Stats + timestamps ═════════════
  function renderStats() {
    const s = { models: MW?.models?.length || 0, downloads: MW?.totals?.downloads || 0, videos: Number(String(YT?.channel?.videoCount || "").replace(/\D/g, "")) || YT?.videos?.length || 0 };
    document.querySelectorAll("[data-count]").forEach((el) => {
      const v = s[el.dataset.count];
      if (v) countUp(el, v); else el.closest(".stat").style.display = "none";
    });
    if (!s.models && !s.downloads && !s.videos) $(".hero-stats").style.display = "none";
    const u = MW?.updatedAt || YT?.updatedAt;
    if (u) $("#mw-updated").textContent = `${t("updated")} ${ago(MW?.updatedAt || u)}`;
  }

  function renderAll() { renderModels(); renderVideos(); renderElectronics(); }
  document.addEventListener("langchange", () => { if (MW || YT || EL.length) { renderAll(); const u = MW?.updatedAt; if (u) $("#mw-updated").textContent = `${t("updated")} ${ago(u)}`; } });

  Promise.all([getJSON("data/makerworld.json"), getJSON("data/youtube.json"), getJSON("data/electronics.json")]).then(([mw, yt, el]) => {
    MW = mw; YT = yt; EL = el || [];
    renderAll(); renderStats();
  });
})();
