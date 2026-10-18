/* beluci — shared: i18n, nav, reveal, modals */
(function () {
  "use strict";

  // ─────────── i18n (Deutsch steht direkt im HTML, hier die englischen Texte) ───────────
  const EN = {
    "nav.models": "Models", "nav.videos": "Videos", "nav.electronics": "Electronics", "nav.about": "About", "nav.services": "Services", "nav.cta": "Start a project", "nav.home": "Home",
    "hero.eyebrow": "3D Printing · CAD Design · Electronics",
    "hero.title": 'Ideas you can <span class="serif">hold</span> in your hand.',
    "hero.lead": "I design, engineer and print functional parts – from the first sketch through precise CAD to the finished object in your hand. Plus electronics projects that actually work.",
    "hero.cta1": "Start a project", "hero.cta2": "Browse models",
    "stat.models": "Models", "stat.downloads": "Downloads", "stat.videos": "Videos",
    "hud.live": "PRINTING",
    "models.title": 'Latest <span class="serif">models.</span>', "models.more": "Load more", "models.all": "All on MakerWorld",
    "live.synced": "Live synced",
    "feed.eyebrow": "Live from the workshop", "feed.title": 'Freshly <span class="serif">printed</span> &amp; filmed.', "feed.models": "3D models", "feed.videos": "Videos", "feed.all": "All", "feed.sub": "Subscribe",
    "sort.new": "Latest", "sort.popular": "Popular", "sort.downloads": "Downloads",
    "yt.title": 'From sketch to <span class="serif">finished build.</span>', "yt.sub": "Subscribe to channel →",
    "el.eyebrow": "Code & schematics", "el.title": 'Electronics <span class="serif">projects.</span>',
    "el.lead": "Schematic and full source code for my YouTube builds – to rebuild, learn from and improve.",
    "about.eyebrow": "About me", "about.title": 'Where filament meets <span class="serif">firmware.</span>',
    "about.p1": "Hi, I'm <strong>Beluci</strong> – a maker at heart. I don't just dream up ideas, I build them. In my workshop a CAD sketch becomes a real part you can hold in your hands.",
    "about.p2": "On <strong>MakerWorld</strong> I publish well-engineered, print-optimised designs – modelled in Inventor, Fusion 360 and Creo. On <strong>YouTube</strong> I document my electronics projects: Arduino, ESP32, soldering and everything in between. Honest, unpolished, real.",
    "about.tools": "Toolset",
    "tool.inv": "Mechanical assemblies & technical drawings", "tool.fus": "CAD/CAM for product design & organic shapes", "tool.creo": "High-end parametric CAD from aerospace & automotive", "tool.mcu": "Microcontrollers, sensors & WiFi projects",
    "svc.title": 'Your problem. <span class="serif">My printer.</span>', "svc.all": "All services",
    "svc.1t": "3D Printing", "svc.1d": "You have a file – I print it. Clean, dimensionally accurate, in PLA, PETG or TPU.",
    "svc.2t": "CAD Engineering", "svc.2d": "Your sketch, photo or idea becomes a parametric, print-ready model.",
    "svc.3t": "Design + Print", "svc.3d": "The full package: design, test print, refinement – the part fits the first time.",
    "cta.eyebrow": "Reply within 24 h", "cta.title": 'A part that <span class="serif accent">doesn\'t exist yet?</span>',
    "cta.lead": "Describe your problem – I'll turn it into a printed part. No technical knowledge needed.",
    "cta.btn": "Free quote", "cta.btn2": "Services & process",
    "foot.tag": "3D printing, CAD design & electronics. From idea to finished part.", "foot.nav": "Navigation", "foot.made": "Designed & built in-house",
    // services page
    "s.eyebrow": "Custom 3D printing & CAD services",
    "s.title": 'Your idea. <span class="serif">Real</span> parts.',
    "s.lead": "From concept to finished part – I design, model and print custom solutions for your exact problem. No templates, no guesswork. Just parts that work.",
    "s.cta1": "Get a quote", "s.cta2": "How it works",
    "s.offer": 'Services & <span class="serif">pricing.</span>', "s.navproc": "Process", "s.navmat": "Materials", "s.offer.eye": "Services", "s.cases.eye": "Examples",
    "s.offer.lead": "Every project is different. Send me your idea and you'll get an exact, binding quote within 24 hours.",
    "s.1t": "3D Printing", "s.1d": "You have a file, I print it. Or describe what you need and I'll find or create the model.",
    "s.1a": "PLA, PETG, TPU & PLA+", "s.1b": "Layer height 0.1 – 0.3 mm", "s.1c": "Many colours available", "s.1d2": "Post-processing on request",
    "s.2t": "CAD Design", "s.2d": "Custom 3D modelling in Inventor, Fusion 360 or Creo – from your sketch, photo or description.",
    "s.2a": "Parametric & print-optimised", "s.2b": "STL + native CAD files", "s.2c": "1 revision round included", "s.2d2": "Technical drawings on request",
    "s.3t": "Design + Print", "s.3d": "The complete package – I design your part from scratch and print it. Ideal for enclosures, brackets & prototypes.",
    "s.3a": "Full CAD design included", "s.3b": "Test print + refinement", "s.3c": "Speciality: electronics enclosures", "s.3d2": "Source files included",
    "s.popular": "Popular", "s.price": "Price on request", "s.ask": "Request",
    "s.proc": 'From idea to <span class="serif">object.</span>',
    "s.p1t": "You describe it", "s.p1d": "Sketch, photo, description or existing file – no technical knowledge needed.",
    "s.p2t": "I design it", "s.p2d": "I model the part in CAD and send you a preview render. Changes? No problem.",
    "s.p3t": "Print & check", "s.p3d": "Printed, measured, checked for tolerances – and refined if needed.",
    "s.p4t": "Delivered", "s.p4d": "You get the finished part plus all source files. Something off? I'll fix it.",
    "s.cases": 'Typical <span class="serif">jobs.</span>', "s.cases.lead": "Problems without an off-the-shelf solution – and how they get solved.",
    "s.problem": "Problem", "s.solution": "Solution",
    "s.c1t": "Enclosure for an ESP32 project", "s.c1p": "Custom sensor board without a housing: exposed PCB, loose wires, no protection.", "s.c1s": "Snap-fit enclosure with cable management, ventilation slots and a magnetic lid for quick access.",
    "s.c2t": "Discontinued spare part", "s.c2p": "A bracket on a machine snapped – the part is no longer available anywhere.", "s.c2s": "Measure the original, model a reinforced version and print it in heat-resistant PETG.",
    "s.c3t": "Custom cable management", "s.c3p": "Unusual desk frame – no off-the-shelf clip fits the rail profile.", "s.c3s": "Parametric clip system that snaps exactly onto the profile, printed as a full set.",
    "s.c4t": "Product prototype", "s.c4p": "Housing prototypes needed to test the form factor – injection moulding is too expensive at this stage.", "s.c4s": "Housing modelled from the technical brief, several iterations with a clean surface finish.",
    "s.mat": 'Materials & <span class="serif">specs.</span>',
    "s.m1": "Prototypes, display parts, easy to post-process", "s.m2": "Functional, tough & heat resistant", "s.m3": "Flexible & rubber-like – grips, seals, bumpers", "s.m4": "Tougher than standard PLA, smooth surface",
    "s.rec": "Recommended", "s.strong": "Strong", "s.flex": "Flex",
    "s.sp1": "Layer resolution", "s.sp2": "CAD software", "s.sp3": "File formats", "s.sp4": "Input", "s.sp4v": "Sketch, photo, description", "s.sp5": "Turnaround", "s.sp5v": "Print 1–3 days · Design 2–5 days",
    "s.faq": 'Frequently asked <span class="serif">questions.</span>',
    "s.q1": "What does a print cost?", "s.a1": "Depends on size, material and effort. Send me your idea or file – you'll get an exact quote within 24 hours, free and without obligation.",
    "s.q2": "I don't have a 3D file – is that a problem?", "s.a2": "Not at all. A sketch, a photo with measurements or a description is enough. I'll create the CAD model.",
    "s.q3": "What if the part doesn't fit?", "s.a3": "A revision round is included. I adjust the model until it fits – that's what the test print is for.",
    "s.q4": "Do I get the source files?", "s.a4": "Yes. For design jobs you get the STL plus the native CAD files – so the part stays yours.",
    "s.q5": "Which material should I choose?", "s.a5": "PLA for prototypes & display parts, PETG for functional and outdoor parts, TPU for anything flexible. I'm happy to advise.",
    "s.quote": 'Let\'s <span class="serif">talk.</span>', "s.quote.lead": "Describe your project briefly – I'll reply within 24 hours with a quote.",
    "f.type": "What do you need?", "f.t1": "3D Print", "f.t2": "CAD Design", "f.t3": "Design + Print", "f.t4": "Spare part", "f.t5": "Other",
    "f.name": "Name", "f.email": "Email", "f.mat": "Material", "f.mat0": "Not sure yet", "f.qty": "Quantity", "f.msg": "Your project",
    "f.msgph": "What should the part do? Dimensions, where is it used, deadline…", "f.send": "Send request", "f.note": "Opens your email app with the request prepared. Attach photos or files there.",
    "c.yt": "Message on YouTube", "c.mw": "Models on MakerWorld", "c.resp": "Typical reply within 24 h",
  };
  const DYN = {
    de: { models: "Modelle", justNow: "gerade eben", updated: "Aktualisiert", views: "Aufrufe", newest: "Neu", latest: "Neuestes Video", short: "Short", copy: "Kopieren", copied: "Kopiert ✓", schematic: "Schaltplan", code: "Quellcode", wiring: "Verdrahtung", open: "Schaltplan & Code", noModels: "Modelle werden synchronisiert", noModelsD: "Die neuesten Designs erscheinen hier automatisch. Bis dahin findest du alle Modelle direkt auf MakerWorld.", noVideos: "Videos werden synchronisiert", noVideosD: "Die neuesten Videos erscheinen hier automatisch.", toMW: "Zu MakerWorld", toYT: "Zum Kanal", subs: "Abonnenten", sent: "E-Mail-Programm wird geöffnet …", copiedReq: "Anfrage in die Zwischenablage kopiert – schick sie mir per YouTube oder E-Mail." },
    en: { models: "models", justNow: "just now", updated: "Updated", views: "views", newest: "New", latest: "Latest video", short: "Short", copy: "Copy", copied: "Copied ✓", schematic: "Schematic", code: "Source code", wiring: "Wiring", open: "Schematic & code", noModels: "Models are syncing", noModelsD: "The latest designs will appear here automatically. Until then you'll find all models on MakerWorld.", noVideos: "Videos are syncing", noVideosD: "The latest videos will appear here automatically.", toMW: "Go to MakerWorld", toYT: "Go to channel", subs: "subscribers", sent: "Opening your email app …", copiedReq: "Request copied to clipboard – send it to me via YouTube or email." },
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  let lang = store.get("lang") || ((navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en");
  const original = new Map();

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;
    document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-ph]").forEach((el) => {
      const isHtml = el.hasAttribute("data-i18n-html");
      const isPh = el.hasAttribute("data-i18n-ph");
      const key = el.getAttribute(isHtml ? "data-i18n-html" : isPh ? "data-i18n-ph" : "data-i18n");
      if (!original.has(el)) original.set(el, isPh ? el.placeholder : isHtml ? (el.dataset.src || el.innerHTML) : el.textContent);
      const val = l === "en" && EN[key] != null ? EN[key] : original.get(el);
      if (isPh) el.placeholder = val;
      else if (isHtml) { el.dataset.src = original.get(el); el.innerHTML = val; if (el.classList.contains("split")) splitWords(el); }
      else el.textContent = val;
    });
    document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === l));
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  }

  // ─────────── word-split headline animation ───────────
  function splitWords(el) {
    let i = 0;
    const wrap = (text, cls) => text.split(/(\s+)/).map((p) => {
      if (!p) return "";
      if (/^\s+$/.test(p)) return " ";
      return `<span class="w"><span style="--i:${i++}"${cls ? ` class="${cls}"` : ""}>${p}</span></span>`;
    }).join("");
    let html = "";
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) html += wrap(n.textContent);
      else if (n.nodeType === 1) {
        if (n.tagName === "BR") { html += "<br>"; return; }
        html += wrap(n.textContent, n.className);
      }
    });
    el.innerHTML = html;
  }

  // ─────────── reveal on scroll ───────────
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;
  function observe(root = document) {
    root.querySelectorAll(".rv:not(.in), .split:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));
  }

  // ─────────── modal ───────────
  function openModal(id) {
    const m = document.getElementById(id);
    m.classList.add("on"); m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(m) {
    m.classList.remove("on"); m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    m.dispatchEvent(new Event("closed"));
  }
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-close]");
    if (c) closeModal(c.closest(".modal"));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".modal.on").forEach(closeModal);
  });

  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2600);
  }

  // ─────────── helpers ───────────
  const fmt = (n) => {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(".0", "") + "M";
    if (n >= 1e4) return Math.round(n / 1e3) + "K";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(".0", "") + "K";
    return String(n);
  };
  function ago(iso) {
    const d = new Date(iso); if (isNaN(d)) return "";
    const s = (Date.now() - d) / 1000;
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (const [u, sec] of units) if (s >= sec) return rtf.format(-Math.floor(s / sec), u);
    return DYN[lang].justNow;
  }
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function countUp(el, to) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ─────────── nav ───────────
  const nav = document.getElementById("nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  document.querySelector(".burger")?.addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll(".mnav a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => { store.set("lang", b.dataset.lang); applyLang(b.dataset.lang); }));

  // spotlight on cards
  document.addEventListener("pointermove", (e) => {
    const c = e.target.closest?.(".svc-card");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  });
  document.querySelectorAll(".yr").forEach((y) => (y.textContent = new Date().getFullYear()));

  window.B = { t: (k) => DYN[lang][k] ?? k, get lang() { return lang; }, fmt, ago, esc, countUp, observe, openModal, closeModal, toast };

  document.querySelectorAll(".split").forEach((el) => { if (!el.hasAttribute("data-i18n-html")) splitWords(el); });
  applyLang(lang);
  observe();
  // Hero sofort zeigen – nicht auf den Scroll-Beobachter warten
  requestAnimationFrame(() => document.querySelectorAll(".hero .rv, .hero .split, .page-hero .rv, .page-hero .split").forEach((el) => el.classList.add("in")));
  // Sicherheitsnetz: alles, was schon im Bild ist, nach kurzer Zeit sicher einblenden
  const reveal = () => document.querySelectorAll(".rv:not(.in), .split:not(.in)").forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add("in");
  });
  setTimeout(reveal, 1200);
  addEventListener("scroll", () => { clearTimeout(reveal._t); reveal._t = setTimeout(reveal, 250); }, { passive: true });
})();
