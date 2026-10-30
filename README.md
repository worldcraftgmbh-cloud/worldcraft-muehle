# 🎲 Mühle (Nine Men's Morris) – Meister Edition

Ein vollwertiges, eigenständiges und modernes Web-Projekt für das traditionelle Strategiespiel **Mühle** (engl. *Nine Men's Morris*), entwickelt mit **React 19**, **TypeScript**, **Vite** und **Tailwind CSS**.

---

## 🌟 Features & Highlights

### 1. Spiel-Setup & Architektur
- **Moderne Component-Architektur:** Klare Trennung von Spiellogik (`src/logic`), Benutzeroberfläche (`src/components`), KI-Engine (`src/ai`) und Cloud-Services (`src/services`).
- **Web Audio API Sound-Synthesizer:** Eigenständige, prozedurale Klangeffekte (Setzen, Ziehen, Mühlen-Akkord, Schlagen, Sieg-Fanfare) ohne externe Asset-Abhängigkeiten.
- **Konfetti-Effekte & Animationen:** Visuelle Belohnungen bei Siegen (`canvas-confetti`) und animierte SVG-Hervorhebungen.

### 2. Vollständige offizielle Mühle-Regeln (Standard)
- **24 Schnittpunkte:** Drei ineinanderliegende Quadrate (äußeres, mittleres, inneres Quadrat) mit den standardgemäßen vier Verbindungsquerlinien.
- **Phase 1 (Setzen):** Beide Spieler setzen abwechselnd je 9 Steine auf beliebige freie Punkte.
- **Phase 2 (Ziehen):** Sobald alle 18 Steine gesetzt sind, ziehen die Steine entlang der Linien auf freie Nachbarfelder.
- **Phase 3 (Springen):** Sobald ein Spieler nur noch 3 Steine auf dem Feld hat, darf dieser frei auf jedes freie Feld des gesamten Brettes springen.
- **Mühlen-Erkennung & Schlag-Logik:**
  - Drei Steine in einer horizontalen oder vertikalen Linie bilden eine Mühle.
  - Das Schließen einer Mühle (auch bei Öffnen und Wieder-Schließen in Folgezügen) berechtigt zum Schlagen eines gegnerischen Steins.
  - **Schutzregel (Standard):** Steine in einer geschlossenen Mühle sind geschützt, *es sei denn*, der Gegner besitzt nur noch Steine in Mühlen.
- **Sieg & Niederlage:**
  - Ein Spieler verliert, wenn er nach Phase 1 auf weniger als 3 Steine reduziert wird.
  - Ein Spieler verliert, wenn er am Zug ist und keinen legalen Zug mehr ausführen kann (Blockade / Verbauung).

### 3. KI-Gegner & Lernsystem
- **Phasenerkennende Heuristik:**
  - Priorität 1: Schließen eigener Mühlen.
  - Priorität 2: Blockieren gegnerischer 2er-Reihen.
  - Priorität 3: Vorbereitung von Zwickmühlen / Doppelbedrohungen und Kontrolle zentraler Kreuzungen.
- **Schwierigkeitsstufen:**
  - `Leicht`: Spielerische Züge mit 70% Mühlen-Fokus.
  - `Mittel`: Taktische Heuristik mit Blockade- und Doppel-Mühlen-Erkennung.
  - `Meister`: Minimax-Algorithmus mit Alpha-Beta-Pruning.
  - `Lernende KI (Adaptive AI)`: Reinforcement Learning (Q-Learning) mit Belohnungs-Rückkopplung nach Spielende.
  - `KI vs KI`: Automatischer Demonstrationsmodus.
- **Kanonische Symmetrie-Reduktion:** 8-fache Reduktion des Stellungsraums durch Berücksichtigung von Drehungen (90°, 180°, 270°) und Spiegelungen.
- **Selbstspiel-Training:** Schnell-Trainingsfunktion (10, 50 oder 100 Partien) im Browser.
- **Firestore-Anbindung:**
  - Vorbereitet für persistente Speicherung in Google Firebase Firestore.
  - Funktioniert out-of-the-box offline mit `LocalStorage`.
  - Einfaches Konfigurations-Modal für Firebase Project-ID und API-Key mit Live-Verbindungstest.
  - Import/Export gelernter Stellungen als JSON.

### 4. Edles UI & Interaktives SVG-Board
- Hochpräzises Vektor-Brett mit dunklem Edelholz-/Titan-Design, goldenen Verbindungslinien und klaren Koordinaten (a–g, 1–7).
- Responsive Steuerung mit Touch-optimierten Trefferflächen.
- 3D-gestaltete Spielsteine mit dynamischem Beleuchtungsverlauf.
- Optische Indikatoren:
  - Gültige Setz- und Zielfelder leuchten pulsierend auf.
  - Ausgewählter Stein hebt sich ab.
  - Neu geschlossene Mühlen erstrahlen mit goldenem Heiligenschein.
  - Schlagbare gegnerische Steine werden mit Fadenkreuz-Zielringen markiert.
- Detaillierte Spieler-Karten mit Phasen-Anzeige, Steine-Vorrat und KI-Denkanzeige.
- Interaktives Aktions-Banner und vollständige Zughistorie mit algebraischer Notation.

---

## 📁 Projektstruktur

```
Mühle/
├── index.html                   # HTML-Einstiegspunkt mit Google Fonts & Icons
├── package.json                 # Abhängigkeiten und Skripte
├── tsconfig.json                # TypeScript-Konfiguration
├── vite.config.ts               # Vite-Build-Konfiguration
├── tailwind.config.js           # Farb- & Design-Thema
├── src/
│   ├── main.tsx                 # React Root
│   ├── App.tsx                  # Hauptkomponente mit Spielschleife & Events
│   ├── index.css                # Tailwind Directives & globale Animationen
│   ├── types/
│   │   └── game.ts              # Typdefinitionen (GameState, Move, Board, etc.)
│   ├── logic/
│   │   ├── boardConstants.ts    # 24 Punkte, Nachbarschaften (Adjazenz), alle 16 Mühlen
│   │   ├── rules.ts             # Regelwerk, Mühlenprüfung, Schutzregel, Siegprüfungen
│   │   └── engine.ts            # Zustandsübergänge (Setzen, Ziehen, Schlagen)
│   ├── ai/
│   │   ├── evaluator.ts         # Heuristische Stellungsbewertung je Phase
│   │   ├── minimax.ts           # Minimax mit Alpha-Beta-Pruning & Zugauswahl
│   │   └── learningAI.ts        # Q-Learning, 8 Symmetrien, Selbstspiel-Simulation
│   ├── services/
│   │   └── firestoreService.ts  # Firestore REST-Client, LocalStorage-Cache, Import/Export
│   ├── sound/
│   │   └── soundEffects.ts      # Web Audio API Synthesizer
│   └── components/
│       ├── Header.tsx           # Menüleiste, Modusauswahl, Undo, Audio & Modals
│       ├── Board.tsx            # Interaktives SVG-Mühlebrett mit visuellen Effekten
│       ├── PlayerCard.tsx       # Statuskarte für Spieler (Phase, Steine, Handvorrat)
│       ├── ActionBanner.tsx     # Dynamischer Spielanweisungs-Banner
│       ├── MoveHistory.tsx      # Zughistorie mit Notationsanzeige
│       ├── RulesModal.tsx       # Vollständige Spielregelerklärung im Modal
│       └── FirestoreModal.tsx   # Firebase & KI-Trainings-Konfiguration
```

---

## 🚀 Installation & Start

### Entwicklungsserver starten:
```bash
npm run dev
```
Öffne anschließend die im Terminal angezeigte URL (in der Regel `http://localhost:5173`).

### Für die Produktion bauen:
```bash
npm run build
```
Die optimierten Produktionsdateien werden im Ordner `dist/` generiert.

### Vorschau des Produktions-Builds:
```bash
npm run preview
```

---

## ☁️ Firebase Firestore Konfiguration (Optional)

Das Spiel funktioniert standardmäßig komplett autark im **Offline-Modus** und speichert alle gelernten Stellungen im Browser (`LocalStorage`).

Wenn du die gelernten Stellungen in deiner eigenen **Google Cloud Firebase** Instanz speichern möchtest:
1. Erstelle ein kostenloses Firebase-Projekt auf [console.firebase.google.com](https://console.firebase.google.com/).
2. Aktiviere **Firestore Database**.
3. Klicke im Spiel oben rechts auf **KI-Speicher**.
4. Trage deine `Project ID` und deinen `Web API Key` ein.
5. Klicke auf **Verbindung testen & Speichern**.
