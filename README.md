# U19/2 Trainer – SV Menden

Kostenlose PWA für die Trainingsplanung. Läuft komplett offline im Browser, alle Daten liegen lokal auf dem Gerät (localStorage) – kein Server, kein Login.

## Installation auf GitHub Pages

1. Neues (oder bestehendes) GitHub-Repository anlegen.
2. Diese Dateien in den **Repo-Root** hochladen (nicht in einen Unterordner):
   - `index.html`
   - `style.css`
   - `app.js`
   - `sw.js`
   - `manifest.webmanifest`
   - Ordner `icons/` mit `icon-192.png` und `icon-512.png`
3. In den Repo-Einstellungen unter **Settings → Pages** die Quelle auf den Branch (z. B. `main`) und Ordner `/ (root)` stellen.
4. Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/<repo-name>/` erreichbar.

## Auf dem iPhone installieren

1. Die GitHub-Pages-URL in **Safari** öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** wählen.
4. Die App öffnet sich danach im Vollbildmodus wie eine normale App.

## App aktualisieren

Einfach neue Versionen von `index.html`, `style.css`, `app.js` etc. ins Repository hochladen. Die bestehenden Trainingsdaten, Spieler, Notizen und Spieltage bleiben erhalten, da sie separat im Browser-Speicher liegen und **nicht** Teil der Code-Dateien sind.

Wichtig: In `sw.js` steht ganz oben `CACHE_VERSION`. Diesen Wert bei jedem Update hochzählen (z. B. `v1` → `v2`), damit iPhones zuverlässig die neue Version laden statt eine alte gecachte Fassung zu behalten.

## Icons austauschen

Die mitgelieferten Icons sind Platzhalter. Es gibt zwei Varianten pro Größe:

- `icon-192.png` / `icon-512.png` – randlos, wird u. a. für den iOS-Home-Bildschirm verwendet.
- `icon-192-maskable.png` / `icon-512-maskable.png` – mit extra Rand ("Safe Zone"), damit Android das Icon in Kreis-/Squircle-Form zuschneiden kann, ohne wichtige Inhalte abzuschneiden.

Beim Ersetzen durch ein eigenes Vereinslogo: Für die `-maskable`-Dateien das Logo deutlich kleiner/zentrierter platzieren (ca. 20–25 % Rand auf allen Seiten), für die normalen Dateien darf es bis an den Rand gehen.

## Backup

Unter **Backup** in der App lässt sich jederzeit der komplette Datenbestand als JSON-Datei herunterladen und bei Bedarf (z. B. neues Gerät) wieder importieren.
