<div align="center">

# 🕐 Advanced Clock Pro

### An all-in-one clock, productivity & wellness suite built with pure HTML, CSS &amp; JavaScript

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/Framework-None-lightgrey?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**[🚀 Live Demo](#-live-demo) · [✨ Features](#-features) · [🛠 Tech Stack](#️-tech-stack) · [📦 Installation](#-installation--setup) · [📁 Structure](#-project-structure)**

</div>

---

## 📖 About The Project

**Advanced Clock Pro** is a single web app that brings together everything a student, professional, or anyone managing their day would normally need five different apps for — a clock, a world-time tool, alarms, timers, a calendar, a productivity planner, health reminders, relaxation tools, and even a handful of utility mini-tools — all in one clean, themeable interface.

It was built to demonstrate that a genuinely feature-rich, multi-module application can be delivered with **nothing but vanilla HTML, CSS, and JavaScript** — no frameworks, no backend, no database. Every feature runs directly in the browser, and all user data (alarms, habits, journal entries, settings) persists locally using the browser's `localStorage`, making the app fully functional offline after the first load.

---

## 🚀 Live Demo

🔗 **[https://itsmeankita.github.io/Clock-Project/](https://itsmeankita.github.io/Clock-Project/)**

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🕐 Clock
- Digital & Analog modes, 12h/24h toggle, ms display
- Live date, timezone, dynamic time-based greeting
- Auto-theme by time of day
- Battery & network status widgets
- Live weather + sunrise/sunset (geolocation-based)
- Algorithmic moon phase calculator
- AI-style **Smart Bedtime Calculator** (90-min sleep cycles)
- Rule-based **Productivity Score**

### 🌍 World Clock
- Add/remove cities from major time zones
- Live day/night indicator per city
- DST-correct offsets via the `Intl` API
- Time difference calculator
- Meeting time finder across saved cities

### ⏰ Alarms
- Multiple alarms, repeat days, 3 tones, vibration
- Snooze, and **stop challenges**: math puzzle or shake-to-dismiss

### ⏱ Stopwatch & ⌛ Timers
- Laps with best/worst highlighting, CSV export
- Multiple simultaneous timers with quick presets

</td>
<td width="50%" valign="top">

### 📅 Calendar & Countdowns
- Monthly calendar with events, birthdays, exams, holidays
- Generic countdown creator for any occasion

### 💼 Planner
- To-Do list, Habit tracker with streaks
- Goal tracker with progress bars
- Daily journal with mood picker
- Pomodoro Focus Dashboard

### 🟢 Health
- Water, medicine, eye-care (20-20-20), and movement reminders
- Sleep tracker · Guided 4-7-8 breathing exercise

### 🎵 Relax
- Live-synthesized ambient sounds (rain/ocean/forest/white noise)
- Meditation timer

### 🎮 Fun Clocks
Binary · Hex · Roman Numeral · Emoji · Flip Clock

### 🧩 Mini Tools
Calculator · Unit Converter · QR Generator & Scanner · Sticky Notes · Clipboard History

### 📊 Dashboard & ⚙️ Settings
Usage analytics, 11 themes, particle background, custom wallpaper, EN/HI toggle, full data export/import

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (Custom Properties, Glassmorphism, Flex/Grid, Animations) |
| Logic | Vanilla JavaScript (ES6+) |
| QR Scanning | [jsQR](https://github.com/cozmo/jsQR) |
| Weather & Sun Data | [Open-Meteo](https://open-meteo.com/) (free, no API key) |
| QR Generation | [QR Server API](https://goqr.me/api/) |
| Audio | Web Audio API (real-time ambient sound synthesis) |
| Browser APIs | Notifications, Geolocation, Battery, DeviceMotion, Fullscreen, Vibration |
| Persistence | Browser LocalStorage |

No build tools, no bundlers, no package manager — it just runs.

---

## 📁 Project Structure

```
Clock-Project/
├── index.html      # Page structure & markup
├── style.css        # All styling, themes & animations
├── script.js         # Application logic — every module & feature
└── README.md
```

---

## 📦 Installation & Setup

No installation needed — it's a static site.

**Option 1 — Run locally**
```bash
git clone https://github.com/Itsmeankita/Clock-Project.git
cd Clock-Project
```
Then simply open `index.html` in any modern browser.

**Option 2 — Use it live**
Just visit the [Live Demo](#-live-demo) link above.

---

## 🧠 How It Works (Key Design Notes)

- **Modular Tabs:** Each feature area (Clock, World Clock, Alarms, Planner, Health, Relax, Fun Clocks, Tools) is an independent panel, driven by shared utility functions, keeping a large feature set organized in a single script.
- **State Persistence:** Alarms, habits, journal entries, notes, and settings are all stored in `localStorage`, namespaced by feature, so data survives refreshes with zero backend.
- **Rule-Based "Smart" Features:** The Smart Bedtime Calculator and Productivity Score use deterministic formulas (sleep-cycle math, task-completion ratios) rather than a connected AI/LLM API — a deliberate, transparent design choice.
- **Real-Time Audio Synthesis:** Ambient sounds (rain/ocean/forest/white noise) are generated live using the Web Audio API's noise buffers and filters — no external audio files are downloaded.

---

## 📌 Honest Notes

- Weather, QR scanning, and notifications require browser permissions (location, camera, notifications respectively).
- Ambient sounds are synthesized filtered noise, not real nature recordings.
- All data stays in your own browser's local storage — nothing is sent to a server.
- True offline installable PWA support would require a separate `manifest.json` and `service-worker.js`.

---

## 🙋 About Me

Hi, I'm **Ankita Kumari** — a 3rd year Computer Science Engineering student passionate about building clean, practical, and interactive web applications. I enjoy turning everyday utilities into polished, feature-complete projects, focusing on solid fundamentals — HTML, CSS, and JavaScript — before reaching for frameworks. This project reflects that approach: a fully offline-capable, browser-only app with a wide, genuinely usable feature set.

I'm currently learning C++ and JavaScript in more depth, and always open to feedback, collaboration, or interesting project ideas.

📫 Reach out via my [GitHub profile](https://github.com/Itsmeankita).

---

## 👤 Author

**Ankita Kumari** ([@Itsmeankita](https://github.com/Itsmeankita))

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

⭐ If you found this project useful, consider giving it a star!

</div>