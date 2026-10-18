/* beluci — services page: quote form
   Anfragen werden direkt per E-Mail zugestellt (über formsubmit.co, kein Server nötig).
   Klappt das mal nicht, öffnet sich als Notlösung das E-Mail-Programm des Besuchers. */
(function () {
  "use strict";
  const { toast } = window.B;
  const form = document.getElementById("quote-form");
  let email = "beluci3d@gmail.com";

  const TXT = {
    de: { note: "Deine Anfrage landet direkt in meinem Postfach. Fotos oder Dateien kannst du mir danach per Antwort-Mail schicken.",
          sending: "Wird gesendet …", okT: "Danke, Anfrage ist da!", okD: "Ich melde mich innerhalb von 24 Stunden bei dir – schau auch im Spam-Ordner nach.",
          again: "Weitere Anfrage", fail: "Direktversand fehlgeschlagen – dein E-Mail-Programm wird geöffnet." },
    en: { note: "Your request goes straight to my inbox. You can send photos or files afterwards by replying to my email.",
          sending: "Sending …", okT: "Thanks, request received!", okD: "I'll get back to you within 24 hours – please also check your spam folder.",
          again: "Send another", fail: "Direct sending failed – opening your email app instead." },
  };
  const L = () => TXT[window.B.lang] || TXT.de;
  const note = form.querySelector(".note");
  const setNote = () => { if (note) note.textContent = L().note; };

  function showMail() {
    const a = document.getElementById("mail-link");
    if (!a || !email) return;
    a.href = "mailto:" + email; a.hidden = false;
    document.getElementById("mail-text").textContent = email;
  }
  showMail(); setNote();
  document.addEventListener("langchange", setNote);

  fetch("site.config.json").then((r) => r.json()).then((c) => {
    if ((c.contactEmail || "").trim()) { email = c.contactEmail.trim(); showMail(); }
  }).catch(() => {});

  // "Anfragen"-Buttons wählen die passende Leistung vor
  const map = { print: "t1", cad: "t2", bundle: "t3" };
  document.querySelectorAll("[data-pick]").forEach((b) =>
    b.addEventListener("click", () => { const r = document.getElementById(map[b.dataset.pick]); if (r) r.checked = true; }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = ["name", "email", "message"].filter((k) => !String(d[k] || "").trim() || (k === "email" && !/^\S+@\S+\.\S+$/.test(d[k])));
    form.querySelectorAll("input,textarea").forEach((el) => (el.style.borderColor = bad.includes(el.name) ? "#c6f432" : ""));
    if (bad.length) { form.querySelector(`[name="${bad[0]}"]`).focus(); return; }

    const subject = `Neue Anfrage: ${d.type} – ${d.name}`;
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.innerHTML;
    btn.disabled = true; btn.style.opacity = ".7"; btn.textContent = L().sending;

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: subject,
          _replyto: d.email,
          _template: "table",
          _captcha: "false",
          Name: d.name,
          "E-Mail": d.email,
          Leistung: d.type,
          Material: d.material,
          "Stückzahl": d.qty,
          Nachricht: d.message,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || String(j.success) === "false") throw new Error(j.message || res.status);

      const html = form.innerHTML;
      form.innerHTML = `<div style="text-align:center;padding:40px 10px;display:grid;gap:14px;justify-items:center">
        <div style="width:64px;height:64px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#0a0a0a;font-size:30px">✓</div>
        <h3 style="font-size:26px;letter-spacing:-.03em">${L().okT}</h3>
        <p style="color:var(--text-2);margin:0;max-width:380px">${L().okD}</p>
        <button type="button" class="btn btn-ghost" id="again">${L().again}</button></div>`;
      form.querySelector("#again").addEventListener("click", () => { form.innerHTML = html; location.reload(); });
    } catch (err) {
      toast(L().fail);
      const body = [`Leistung: ${d.type}`, `Material: ${d.material}`, `Stückzahl: ${d.qty}`, "", d.message, "", `— ${d.name}`, d.email].join("\n");
      setTimeout(() => { location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; }, 900);
      btn.disabled = false; btn.style.opacity = ""; btn.innerHTML = label;
    }
  });
})();
