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
