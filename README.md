# 🎮 CyberTac — Neon Cyberpunk Tic-Tac-Toe

A modern, responsive, neon-infused **Tic-Tac-Toe Web Application** built with vanilla HTML5, CSS3, and modern JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## ✨ Features

- **Cyberpunk Dark Glassmorphism**: Glowing neon cyan (Player X) and neon pink (Player O) visuals with ambient animated gradient orbs and backdrop blur.
- **Multiple Game Modes**:
  - **2 Players (Pass & Play)**: Challenge a friend locally on the same device.
  - **vs AI Opponent**:
    - **Normal Mode**: Fast casual play with basic defensive heuristics.
    - **Unbeatable (Minimax AI)**: Mathematically optimal computer opponent that never loses.
- **Synthesized Audio**: Built-in sound effects using the browser's native **Web Audio API** (no external audio files required, zero latency, toggleable sound).
- **Celebration Effects**: Built-in canvas confetti bursts upon winning rounds.
- **Interactive UI**:
  - Ghost hover previews indicating where moves will land.
  - Live turn indicators with glowing active scorecards.
  - Animated victory highlights.
  - Scoreboard tracking wins for X, O, and ties.
- **Zero Dependencies**: Pure HTML, CSS, and JS — runs instantly anywhere without npm builds or external libraries.

---

## 🚀 How to Run Locally

You can run this project in two simple ways:

### Option 1: Direct in Browser
Simply double-click [`index.html`](index.html) or right-click and choose **Open with > Chrome / Edge / Firefox**.

### Option 2: Live Server / Python Local Server
If you prefer a local HTTP server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```
Then visit `http://localhost:8000` in your web browser.

---

## 🛠️ Project Structure

```text
tic-tac-toe-game/
├── index.html        # Game layout, scoreboard, grid, and modal
├── style.css         # Neon cyberpunk design system & glassmorphism
├── app.js            # Game engine, Minimax AI, audio synth & confetti
├── .gitignore        # Files to ignore in Git version control
└── README.md         # Documentation and guide
```

---

## 🌐 Deploy to GitHub Pages (Play Online for Free)

1. Push this repository to GitHub (see the step-by-step Git guide below).
2. Go to your repository on **GitHub.com**.
3. Click **Settings** > **Pages** (under Code and automation).
4. Under **Build and deployment** > **Branch**, select `main` branch and `/ (root)` folder.
5. Click **Save**. Within 1–2 minutes, GitHub will give you a public URL (e.g. `https://<your-username>.github.io/<repo-name>/`) to share with friends!

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
