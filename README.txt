U19/2 TRAINER-APP – KOSTENLOSE PWA

Enthalten:
- Trainingsanwesenheit: Anwesend / Abgesagt / Unentschuldigt / Offen
- Automatische 2- oder 3-Team-Aufteilung aus den Anwesenden
- Primär- und Sekundärpositionen
- Einzelstatistik je Spieler
- Stärken, Entwicklungsfelder und Trainingsfokus
- Individuelle Trainer-Notizen mit Priorität und Trainingsmaßnahme
- Automatische Kader- und Startelf-Erstellung anhand der Trainingsbeteiligung
- Manuelle Kader- und Startelf-Anpassung
- Spielerverfügbarkeit wird vor dem Spiel manuell aus der WhatsApp-Abstimmung übernommen
- JSON-Backup/Import
- Offline-Nutzung nach Installation

WICHTIG ZUR KADER-AUTOMATIK
Trainingsbeteiligung = Anzahl "Anwesend" / Anzahl erfasster Trainings des Spielers.
Bei gleichem Wert werden weniger unentschuldigte Fehlzeiten bevorzugt.
Die ausgewählte Formation stellt sicher, dass die Startelf positionsgerecht erstellt wird.
Danach darf der Trainer Kader und Startelf jederzeit manuell ändern.

KOSTENLOS AUF DEM IPHONE INSTALLIEREN (GitHub Pages)
1. Kostenloses GitHub-Konto anlegen.
2. Neues öffentliches Repository erstellen, z. B. "u19-trainer".
3. Alle Dateien aus diesem Ordner hochladen.
4. Repository -> Settings -> Pages.
5. Unter "Build and deployment" -> Deploy from a branch -> main / root auswählen.
6. Die angezeigte https-Adresse in SAFARI auf dem iPhone öffnen.
7. Teilen -> "Zum Home-Bildschirm".
8. Die App startet danach wie eine normale App und funktioniert nach dem ersten Laden auch offline.

DATENSCHUTZ / BACKUP
Die App nutzt keine Cloud-Datenbank. Spieler-, Anwesenheits- und Notizdaten liegen im lokalen Browser-Speicher
des Geräts. Deshalb regelmäßig unter "Backup" eine JSON-Datei exportieren, besonders vor iOS-Updates,
Gerätewechsel oder dem Löschen von Safari-/Websitedaten.

DATEIEN
index.html              komplette App
manifest.webmanifest    PWA-Metadaten
sw.js                   Offline-Cache
icon-192.png / 512.png  App-Icons


UPDATE V2 – TRAININGSHISTORIE
- Im Bereich Training werden alle gespeicherten Trainingstage chronologisch angezeigt.
- Pro Termin sieht man sofort: anwesend / abgesagt / unentschuldigt / offen.
- Ein Tipp auf den Trainingstag öffnet die damalige komplette Anwesenheitsliste.
- Änderungen an einer alten Anwesenheitsliste aktualisieren Historie und Spielerstatistik sofort.

FÜR DIESES UPDATE AUF GITHUB:
Nur index.html und sw.js müssen ersetzt werden.
Die übrigen Dateien können unverändert bleiben.


UPDATE V3
1. Spielzeit & Einsatzstatistik
   - Minuten pro Kaderspieler nach dem Spiel erfassen.
   - Spielerprofil zeigt Kader, Startelf, Einwechslungen, Bank ohne Einsatz und Gesamtminuten.
   - Gespeicherte Spiele können später wieder geladen und ergänzt werden.

2. WhatsApp
   - Kader/Startelf als Text kopieren.
   - Trainingsspiel-Teams als Text kopieren.

3. Trainingsplanung
   - Offene Spielernotizen werden nach Kategorie und Priorität gebündelt.
   - Die App schlägt den stärksten aktuellen Schwerpunkt vor.

4. Anwesenheit
   - Warnungen auf der Startseite.
   - Trend über die letzten fünf erfassten Trainings in der Spielerliste und im Spielerprofil.

5. 3-Team-Rotation
   - A-B / B-C / A-C mit wechselnder Pause.
   - Einstellbarer Countdown-Timer.

UPDATE AUF GITHUB
Für dieses Update index.html und sw.js ersetzen. Alle lokalen Daten bleiben erhalten.
