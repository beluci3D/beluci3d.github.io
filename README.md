# beluci — Website

Moderne Portfolio- & Service-Website für 3D-Druck, CAD und Elektronik.
**MakerWorld-Modelle und YouTube-Videos werden automatisch alle 3 Stunden aktualisiert** – du musst nie wieder etwas von Hand eintragen.

## So funktioniert das Auto-Update

1. Die GitHub Action (`.github/workflows/static.yml`) läuft alle 3 Stunden, bei jedem Push und auf Knopfdruck.
2. Sie startet `scripts/update-feeds.mjs`, das
   - deine neuesten **YouTube-Videos** über den offiziellen RSS-Feed holt,
   - deine **MakerWorld-Modelle** über die Bambu-Lab-API (Fallback: echter Browser) lädt und die Vorschaubilder optimiert,
   - alles in `data/youtube.json`, `data/makerworld.json` und `assets/mw/` speichert.
3. Danach wird die Website automatisch neu veröffentlicht.

Falls eine Quelle einmal nicht erreichbar ist, bleiben einfach die letzten Daten stehen – die Seite geht nie kaputt.

## Einmalige Einrichtung

1. Alle Dateien ins Repository `beluci3d.github.io` hochladen (alte `index.html`/`services.html` werden ersetzt).
2. **Settings → Actions → General → Workflow permissions → „Read and write permissions"** aktivieren und speichern.
3. **Settings → Pages → Source: „GitHub Actions"** (ist bei dir schon so eingestellt).
4. **Actions → „Update & Deploy" → „Run workflow"** einmal starten. Nach ~2 Minuten ist alles live.

### Falls MakerWorld-Modelle nicht erscheinen
Öffne irgendeins deiner Modelle auf MakerWorld, kopiere den Link (z. B. `https://makerworld.com/de/models/1234567-...`)
und trag ihn in `site.config.json` bei `"makerworldAnyModelUrl"` ein. Daraus wird deine Nutzer-ID automatisch ermittelt.

## Einstellungen — `site.config.json`

| Feld | Bedeutung |
|---|---|
| `youtubeHandle` | Dein YouTube-Handle ohne @ |
| `youtubeChannelId` | Optional, wird automatisch erkannt |
| `makerworldHandle` | Dein MakerWorld-Name ohne @ |
| `makerworldUid` / `makerworldAnyModelUrl` | Optional, nur falls die automatische Erkennung nicht klappt |
| `contactEmail` | Deine Kontakt-E-Mail für das Anfrageformular |
| `maxVideos`, `maxModels` | Wie viele Einträge geladen werden |

## Inhalte ändern
- **Texte**: Deutsch direkt in `index.html` / `services.html`, Englisch in `assets/js/main.js` (Objekt `EN`).
- **Elektronik-Projekte** (Schaltplan + Code): `data/electronics.json`.
- **Design/Farben**: oben in `assets/css/style.css` (`--accent` ist das Orange).
