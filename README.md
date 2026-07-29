# NutriSync — Precision Health & Fitness Command Center

NutriSync is a comprehensive, lightweight web application designed to help users manage their health, nutrition, and daily fitness workflows seamlessly. Built with a responsive frontend and a Python/Flask backend, NutriSync offers real-time tracking, health metrics calculations, and personalized workout/diet guidance.

Live Demo: [https://nutri-sync-liart.vercel.app/](https://nutri-sync-liart.vercel.app/)

---

## Key Features

* **Habit & Water Tracker:** Monitor daily hydration levels and routine progress interactively.
* **Health Calculators:** Calculate Body Mass Index (BMI), daily calorie needs, and target macro distributions.
* **Food & Calorie Logger:** Log food items with automated calorie tallying against customizable daily targets.
* **Diet & Workout Guides:** Access curated exercise routines and meal suggestions.
* **Interactive UI:** Smooth-scrolling layout with modern aesthetic themes built using modern CSS variables and JavaScript.

---

## Tech Stack

* **Frontend:** HTML5, CSS3 (Modern Flexbox/Grid, CSS Variables), JavaScript (ES6+)
* **Backend:** Python 3.x, Flask
* **Deployment:** Vercel / Render

---

## Project Structure

```text
nutrisync/
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
├── vercel.json
├── .gitignore
└── README.md
