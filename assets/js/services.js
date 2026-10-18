/* beluci — services page: quote form */
(function () {
  "use strict";
  const { t, toast } = window.B;
  const form = document.getElementById("quote-form");
  let email = "";

  fetch("site.config.json").then((r) => r.json()).then((c) => {
    email = (c.contactEmail || "").trim();
    if (email) {
      const a = document.getElementById("mail-link");
      a.href = "mailto:" + email; a.hidden = false;
      document.getElementById("mail-text").textContent = email;
    }
  }).catch(() => {});

  // "Anfragen"-Buttons wählen die passende Leistung vor
  const map = { print: "t1", cad: "t2", bundle: "t3" };
  document.querySelectorAll("[data-pick]").forEach((b) =>
    b.addEventListener("click", () => { const r = document.getElementById(map[b.dataset.pick]); if (r) r.checked = true; }));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = ["name", "email", "message"].filter((k) => !String(d[k] || "").trim() || (k === "email" && !/^\S+@\S+\.\S+$/.test(d[k])));
    form.querySelectorAll("input,textarea").forEach((el) => (el.style.borderColor = bad.includes(el.name) ? "#ff5b1f" : ""));
    if (bad.length) { form.querySelector(`[name="${bad[0]}"]`).focus(); return; }

    const subject = `Anfrage: ${d.type} – ${d.name}`;
    const body = [
      `Leistung: ${d.type}`, `Material: ${d.material}`, `Stückzahl: ${d.qty}`, "",
      d.message, "", `— ${d.name}`, d.email,
    ].join("\n");

    if (email) {
      location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast(t("sent"));
    } else {
      try { await navigator.clipboard.writeText(subject + "\n\n" + body); } catch {}
      toast(t("copiedReq"));
      setTimeout(() => window.open("https://www.youtube.com/@Belutschy/about", "_blank", "noopener"), 1200);
    }
  });
})();
