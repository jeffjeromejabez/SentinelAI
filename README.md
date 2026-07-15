# SentinelAI

AI-powered phishing detection and cybersecurity awareness platform.

> Upload a screenshot or paste a URL — SentinelAI uses machine learning to instantly detect phishing attempts, scam messages, and cyber threats.

![SentinelAI Landing Page](screenshots/day3-homepage.png)

---

## Progress

### ✅ Day 1
- Project idea finalised
- GitHub repository created
- Folder structure scaffolded (`frontend/`, `backend/`, `ai_model/`, `dataset/`, `docs/`)

### ✅ Day 2
- Requirements finalised
- Product workflow documented
- Tech stack decided

### ✅ Day 3
- React + Vite frontend setup
- Modern cybersecurity-themed landing page completed
- Glassmorphism UI with animated cyber grid background
- Responsive layout (desktop → mobile)
- Upload section with drag-and-drop and screenshot preview
- URL input for direct link scanning
- Animated scan button with neon glow pulse
- Four feature cards with distinct accent colours
- Floating cyber decorations panel
- Sticky glassmorphism navbar with status indicator

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite 8, CSS (no Tailwind) |
| Backend   | Python (planned)                  |
| AI Model  | TensorFlow / scikit-learn (planned) |
| Database  | TBD                               |

---

## Screenshots

| View | Preview |
|------|---------|
| Homepage | ![Homepage](screenshots/day3-homepage.png) |
| Upload UI | ![Upload UI](screenshots/day3-upload-ui.png) |

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
cd frontend
npm run build
```

---

## Project Structure

```
SentinelAI/
├── frontend/          # React + Vite UI
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── UploadSection.jsx
│       │   ├── FeatureCards.jsx
│       │   └── CyberDecorations.jsx
│       ├── App.jsx
│       └── index.css
├── backend/           # Python API (coming soon)
├── ai_model/          # ML model (coming soon)
├── dataset/           # Training data (coming soon)
├── docs/              # Documentation
└── screenshots/       # UI screenshots
```

---

## Roadmap

- [ ] Day 4 — Backend API setup (FastAPI / Flask)
- [ ] Day 5 — AI model integration
- [ ] Day 6 — Connect frontend to backend
- [ ] Day 7 — Testing and deployment

---

## License

[MIT](LICENSE)
