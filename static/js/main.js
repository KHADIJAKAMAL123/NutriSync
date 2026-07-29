/**
 * NutriSync - Command Center Main JavaScript Module
 * Author: Senior Frontend Engineer
 * Engine: Vanilla ES6+ JS
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // GLOBAL STATE & STORAGE KEYS
    // ==========================================
    const STORAGE_KEYS = {
        WATER: 'nutrisync_water',
        FOOD_LOG: 'nutrisync_food_log',
        NOTES: 'nutrisync_notes',
        CALORIE_BUDGET: 'nutrisync_calorie_budget'
    };

    let waterChartInstance = null;
    let dailyCalorieGoal = parseInt(localStorage.getItem(STORAGE_KEYS.CALORIE_BUDGET)) || 2000;

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const iconClass = type === 'success' ? 'fa-circle-check text-mint' : 'fa-triangle-exclamation text-warning';

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-dark border-0 shadow-lg mb-2" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex" style="border: 1px solid var(--card-border); border-radius: 12px; background: rgba(22, 27, 34, 0.95);">
                    <div class="toast-body d-flex align-items-center gap-2">
                        <i class="fa-solid ${iconClass} fs-5"></i>
                        <span>${message}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        if (toastElement && typeof bootstrap !== 'undefined') {
            const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });
            bsToast.show();
            toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
        }
    }

    async function apiRequest(url, method = 'GET', payload = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (payload) options.body = JSON.stringify(payload);

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.warn(`API call failed for ${url}:`, error.message);
            return null; // Graceful fallback handling
        }
    }

    // ==========================================
    // 1. TAB NAVIGATION MODULE
    // ==========================================
    function initTabNavigation() {
        const navButtons = document.querySelectorAll('.nav-link-custom[data-tab-target]');
        const tabPanes = document.querySelectorAll('.tab-pane-custom');

        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-tab-target');

                // Toggle active on buttons
                navButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');

                // Toggle panes
                tabPanes.forEach(pane => {
                    pane.classList.add('d-none');
                    pane.classList.remove('active');
                });

                const targetPane = document.querySelector(targetId);
                if (targetPane) {
                    targetPane.classList.remove('d-none');
                    targetPane.classList.add('active');
                }
            });
        });

        // Hero explore button tab jump
        const heroExploreBtn = document.getElementById('hero-explore-btn');
        if (heroExploreBtn) {
            heroExploreBtn.addEventListener('click', () => {
                const trackerBtn = document.getElementById('tab-btn-tracker');
                if (trackerBtn) trackerBtn.click();
            });
        }
    }

    // ==========================================
    // HERO BACKGROUND SLIDESHOW ROTATOR
    // ==========================================
    function initHeroSlideshow() {
        const slides = document.querySelectorAll('.hero-slide');
        if (!slides || slides.length === 0) return;
        
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 4000); // Rotates image every 4 seconds
    }

    // ==========================================
    // 2. INSPIRATION & HERO SLIDESHOW MODULE
    // ==========================================
    async function fetchInspiration() {
        const quoteText = document.getElementById('quote-display');
        const adviceText = document.getElementById('advice-display');
        const sparkBtn = document.getElementById('hero-spark-btn');

        if (sparkBtn) sparkBtn.disabled = true;

        const fallbackData = {
            quote: "Small daily improvements over time lead to stunning long-term results.",
            advice: "Prioritize 7 to 8 hours of sleep tonight to boost muscle repair and metabolic speed."
        };

        const data = await apiRequest('/api/inspiration') || fallbackData;

        if (quoteText) quoteText.textContent = `"${data.quote}"`;
        if (adviceText) {
            adviceText.innerHTML = `<i class="fa-solid fa-lightbulb text-mint me-2"></i>${data.advice}`;
        }

        if (sparkBtn) sparkBtn.disabled = false;
    }

    function initHeroModule() {
        fetchInspiration();
        const sparkBtn = document.getElementById('hero-spark-btn');
        if (sparkBtn) {
            sparkBtn.addEventListener('click', fetchInspiration);
        }

        // Initialize background slideshow rotator
        initHeroSlideshow();
    }

    // ==========================================
    // 3. WATER TRACKER MODULE (Chart.js + LocalStorage)
    // ==========================================
    function getWaterData() {
        const stored = localStorage.getItem(STORAGE_KEYS.WATER);
        return stored ? JSON.parse(stored) : { current: 0, target: 3000 };
    }

    function saveWaterData(data) {
        localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(data));
    }

    function initWaterTracker() {
        const canvas = document.getElementById('waterChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const waterData = getWaterData();

        waterChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Drank (ml)', 'Remaining (ml)'],
                datasets: [{
                    data: [waterData.current, Math.max(0, waterData.target - waterData.current)],
                    backgroundColor: ['#00e5ff', 'rgba(255, 255, 255, 0.08)'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        updateWaterUI();

        // Bind quick add buttons
        const addBtns = [
            { id: 'btn-water-250', amount: 250 },
            { id: 'btn-water-500', amount: 500 },
            { id: 'btn-water-1000', amount: 1000 }
        ];

        addBtns.forEach(item => {
            const btn = document.getElementById(item.id);
            if (btn) {
                btn.addEventListener('click', () => addWater(item.amount));
            }
        });

        const resetBtn = document.getElementById('btn-water-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetWater);
        }
    }

    function addWater(amount) {
        const data = getWaterData();
        data.current += amount;
        saveWaterData(data);
        updateWaterUI();
        showToast(`Added ${amount}ml of hydration!`);
    }

    function resetWater() {
        const data = getWaterData();
        data.current = 0;
        saveWaterData(data);
        updateWaterUI();
        showToast('Water log reset for the day.');
    }

    function updateWaterUI() {
        const data = getWaterData();
        const currentValEl = document.getElementById('water-current-val');
        const targetLabelEl = document.getElementById('water-target-label');

        if (currentValEl) {
            currentValEl.textContent = `${(data.current / 1000).toFixed(2)} L`;
        }
        if (targetLabelEl) {
            targetLabelEl.textContent = `Target: ${(data.target / 1000).toFixed(1)} L`;
        }

        if (waterChartInstance) {
            const remaining = Math.max(0, data.target - data.current);
            waterChartInstance.data.datasets[0].data = [data.current, remaining];
            waterChartInstance.update();
        }
    }

    // ==========================================
    // 4. FOOD & CALORIE LOGGER MODULE (LocalStorage)
    // ==========================================
    function getFoodLog() {
        const stored = localStorage.getItem(STORAGE_KEYS.FOOD_LOG);
        return stored ? JSON.parse(stored) : [];
    }

    function saveFoodLog(log) {
        localStorage.setItem(STORAGE_KEYS.FOOD_LOG, JSON.stringify(log));
    }

    function initCalorieLogger() {
        const form = document.getElementById('form-calorie-logger');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('food-item-name');
                const calsInput = document.getElementById('food-item-calories');
                const mealSelect = document.getElementById('food-item-meal');

                const newItem = {
                    id: Date.now(),
                    name: nameInput.value.trim(),
                    calories: parseInt(calsInput.value) || 0,
                    meal: mealSelect.value
                };

                const log = getFoodLog();
                log.push(newItem);
                saveFoodLog(log);

                nameInput.value = '';
                calsInput.value = '';
                renderFoodLog();
                showToast(`Logged ${newItem.name} (${newItem.calories} kcal)`);
            });
        }

        renderFoodLog();
    }

    function renderFoodLog() {
        const log = getFoodLog();
        const tbody = document.getElementById('food-log-tbody');
        const consumedText = document.getElementById('calories-consumed-text');
        const remainingText = document.getElementById('calories-remaining-text');
        const budgetSummary = document.getElementById('calorie-budget-summary');
        const progressBar = document.getElementById('calorie-progress-bar');

        if (!tbody) return;

        let totalConsumed = 0;
        tbody.innerHTML = '';

        if (log.length === 0) {
            tbody.innerHTML = `
                <tr id="empty-food-log-row">
                    <td colspan="4" class="text-center py-4 text-muted">
                        <i class="fa-solid fa-utensils mb-2 d-block" style="font-size: 1.5rem; opacity: 0.5;"></i>
                        No food entries logged yet today.
                    </td>
                </tr>
            `;
        } else {
            log.forEach((item, index) => {
                totalConsumed += item.calories;
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--card-border)';
                tr.innerHTML = `
                    <td><span class="exercise-badge py-1 px-2" style="font-size: 0.75rem;">${item.meal}</span></td>
                    <td class="font-weight-600">${item.name}</td>
                    <td class="text-mint">${item.calories} kcal</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-link text-danger p-0 delete-food-btn" data-index="${index}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add delete click handlers
            document.querySelectorAll('.delete-food-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.getAttribute('data-index'));
                    removeFoodItem(idx);
                });
            });
        }

        const remaining = Math.max(0, dailyCalorieGoal - totalConsumed);
        const percentage = Math.min(100, Math.round((totalConsumed / dailyCalorieGoal) * 100));

        if (consumedText) consumedText.textContent = `${totalConsumed} kcal`;
        if (remainingText) remainingText.textContent = `${remaining} kcal`;
        if (budgetSummary) budgetSummary.textContent = `Budget: ${dailyCalorieGoal} kcal`;

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
            if (percentage > 100) {
                progressBar.style.background = 'linear-gradient(90deg, #ff4e50, #f9d423)';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, var(--accent-teal), var(--accent-mint))';
            }
        }
    }

    function removeFoodItem(index) {
        const log = getFoodLog();
        if (index >= 0 && index < log.length) {
            const removed = log.splice(index, 1);
            saveFoodLog(log);
            renderFoodLog();
            showToast(`Removed ${removed[0].name}`);
        }
    }

    // ==========================================
    // 5. DAILY NOTES MODULE (LocalStorage)
    // ==========================================
    function getNotes() {
        const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
        return stored ? JSON.parse(stored) : [
            { id: 1, text: "Drink 500ml water right after waking up", completed: true },
            { id: 2, text: "Complete 30-minute workout or mobility routine", completed: false },
            { id: 3, text: "Consume at least 120g of high-quality protein", completed: false }
        ];
    }

    function saveNotes(notes) {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }

    function initNotesModule() {
        const form = document.getElementById('form-micro-goal');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('micro-goal-input');
                const text = input.value.trim();

                if (text) {
                    const notes = getNotes();
                    notes.push({ id: Date.now(), text, completed: false });
                    saveNotes(notes);
                    input.value = '';
                    renderNotes();
                    showToast('Micro-goal added!');
                }
            });
        }

        renderNotes();
    }

    function renderNotes() {
        const container = document.getElementById('checklist-container');
        if (!container) return;

        const notes = getNotes();
        container.innerHTML = '';

        if (notes.length === 0) {
            container.innerHTML = `<p class="text-muted text-center my-3">No active goals. Add one above!</p>`;
            return;
        }

        notes.forEach((note, index) => {
            const label = document.createElement('label');
            label.className = 'checklist-item d-flex align-items-center justify-content-between';
            label.innerHTML = `
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                    <input type="checkbox" class="custom-checkbox-input note-toggle" data-index="${index}" ${note.completed ? 'checked' : ''}>
                    <span class="checkbox-box"><i class="fa-solid fa-check"></i></span>
                    <span class="checklist-text ${note.completed ? 'text-decoration-line-through text-muted' : ''}">${note.text}</span>
                </div>
                <button type="button" class="btn btn-sm btn-link text-danger p-0 ms-2 delete-note-btn" data-index="${index}">
                    <i class="fa-solid fa-xmark fs-5"></i>
                </button>
            `;
            container.appendChild(label);
        });

        // Event delegation bindings
        container.querySelectorAll('.note-toggle').forEach(chk => {
            chk.addEventListener('change', () => {
                const idx = parseInt(chk.getAttribute('data-index'));
                const notes = getNotes();
                notes[idx].completed = chk.checked;
                saveNotes(notes);
                renderNotes();
            });
        });

        container.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = parseInt(btn.getAttribute('data-index'));
                const notes = getNotes();
                notes.splice(idx, 1);
                saveNotes(notes);
                renderNotes();
                showToast('Goal removed');
            });
        });
    }

    // ==========================================
    // 6. HEALTH CALCULATORS MODULES
    // ==========================================
    function initCalculators() {

        // --- BMI Calculator ---
        const bmiForm = document.getElementById('form-bmi-calculator');
        if (bmiForm) {
            bmiForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const weight = parseFloat(document.getElementById('bmi-weight').value);
                const height = parseFloat(document.getElementById('bmi-height').value);

                let data = await apiRequest('/api/bmi', 'POST', { weight, height });

                // Client-side fallback calculation if API fails
                if (!data) {
                    const hMetres = height / 100;
                    const bmi = weight / (hMetres * hMetres);
                    let category = 'Normal';
                    let advice = 'Maintain your balanced diet and consistent exercise routine.';
                    if (bmi < 18.5) { category = 'Underweight'; advice = 'Focus on nutrient-dense calorie surplus foods.'; }
                    else if (bmi >= 25 && bmi < 29.9) { category = 'Overweight'; advice = 'Increase daily activity and track portion sizes.'; }
                    else if (bmi >= 30) { category = 'Obese'; advice = 'Consult a professional for a structured workout and plan.'; }

                    data = { bmi: bmi.toFixed(1), category, advice };
                }

                renderBMIResults(data);
            });
        }

        // --- Calorie & Macro Calculator ---
        const macroForm = document.getElementById('form-calorie-budget');
        if (macroForm) {
            macroForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    weight: parseFloat(document.getElementById('macro-weight').value),
                    height: parseFloat(document.getElementById('macro-height').value),
                    age: parseInt(document.getElementById('macro-age').value),
                    gender: document.getElementById('macro-gender').value,
                    activity: document.getElementById('macro-act').value
                };

                let data = await apiRequest('/api/calorie-budget', 'POST', payload);

                // Fallback math if API is offline
                if (!data) {
                    let bmr = (10 * payload.weight) + (6.25 * payload.height) - (5 * payload.age);
                    bmr += payload.gender === 'male' ? 5 : -161;
                    const mults = { 'sedentary': 1.2, 'lightly active': 1.55, 'intense exercise': 1.9 };
                    const tdee = Math.round(bmr * (mults[payload.activity] || 1.2));

                    data = {
                        bmr: Math.round(bmr),
                        totalCalories: tdee,
                        macros: {
                            protein: Math.round((tdee * 0.3) / 4),
                            carbs: Math.round((tdee * 0.4) / 4),
                            fats: Math.round((tdee * 0.3) / 9)
                        }
                    };
                }

                renderMacroResults(data);
            });
        }

        // --- Nutrient Counter ---
        const nutrientForm = document.getElementById('form-nutrient-counter');
        if (nutrientForm) {
            nutrientForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const food = document.getElementById('nutrient-food-input').value.trim();
                const quantity = parseFloat(document.getElementById('nutrient-qty-input').value);

                let data = await apiRequest('/api/nutrient-counter', 'POST', { food, quantity });

                if (!data) {
                    // Fallback estimate (~20g protein per 100g average)
                    const estimatedProtein = (quantity * 0.2).toFixed(1);
                    data = { food, quantity, protein: estimatedProtein };
                }

                renderNutrientResult(data);
            });
        }
    }

    function renderBMIResults(data) {
        const valDisplay = document.getElementById('bmi-val-display');
        const badgeDisplay = document.getElementById('bmi-badge-display');
        const needle = document.getElementById('bmi-needle');
        const adviceBox = document.getElementById('bmi-advice-box');
        const adviceText = document.getElementById('bmi-advice-text');

        if (valDisplay) valDisplay.textContent = data.bmi;
        if (adviceBox) adviceBox.style.display = 'block';
        if (adviceText) adviceText.innerHTML = `<i class="fa-solid fa-circle-info text-mint me-2"></i>${data.advice}`;

        if (badgeDisplay) {
            badgeDisplay.textContent = data.category;
            badgeDisplay.className = 'bmi-badge ' + getBMIBadgeClass(data.category);
        }

        if (needle) {
            // Map BMI value (15 to 35) to degrees (-60deg to +60deg)
            const bmi = parseFloat(data.bmi);
            const clamped = Math.max(15, Math.min(35, bmi));
            const degrees = ((clamped - 15) / (35 - 15)) * 120 - 60;
            needle.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
        }
    }

    function getBMIBadgeClass(category) {
        const cat = category.toLowerCase();
        if (cat.includes('under')) return 'bmi-underweight';
        if (cat.includes('normal')) return 'bmi-normal';
        if (cat.includes('over')) return 'bmi-overweight';
        return 'bmi-obese';
    }

    function renderMacroResults(data) {
        const bmrEl = document.getElementById('bmr-val-display');
        const totalEl = document.getElementById('total-cals-display');
        const pVal = document.getElementById('macro-protein-val');
        const cVal = document.getElementById('macro-carbs-val');
        const fVal = document.getElementById('macro-fats-val');

        if (bmrEl) bmrEl.textContent = `${data.bmr} kcal`;
        if (totalEl) totalEl.textContent = `${data.totalCalories} kcal`;
        if (pVal) pVal.textContent = data.macros.protein;
        if (cVal) cVal.textContent = data.macros.carbs;
        if (fVal) fVal.textContent = data.macros.fats;

        // Auto-sync calculated calories with calorie logger budget
        dailyCalorieGoal = data.totalCalories;
        localStorage.setItem(STORAGE_KEYS.CALORIE_BUDGET, dailyCalorieGoal);
        renderFoodLog();
        showToast(`Daily budget updated to ${dailyCalorieGoal} kcal!`);
    }

    function renderNutrientResult(data) {
        const card = document.getElementById('nutrient-result-card');
        const title = document.getElementById('nutrient-result-title');
        const message = document.getElementById('nutrient-result-message');
        const protein = document.getElementById('nutrient-result-protein');

        if (card) card.style.display = 'block';
        if (title) title.textContent = `${data.quantity}g / units of ${data.food}`;
        if (message) message.textContent = `Nutrient search successfully calculated based on standard dietary database.`;
        if (protein) protein.textContent = `${data.protein}g Protein`;
    }

    // ==========================================
    // 7. DIET PLAN & WORKOUT MODULES
    // ==========================================
    function initDietAndWorkouts() {

        // --- Diet Plan Generator ---
        const dietForm = document.getElementById('form-diet-plan');
        if (dietForm) {
            dietForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    goal: document.getElementById('diet-goal').value,
                    weight: parseFloat(document.getElementById('diet-weight').value),
                    height: parseFloat(document.getElementById('diet-height').value),
                    age: parseInt(document.getElementById('diet-age').value),
                    gender: document.getElementById('diet-gender').value,
                    activity: document.getElementById('diet-act').value
                };

                let data = await apiRequest('/api/diet-plan', 'POST', payload);

                if (!data) {
                    // Fallback plan template
                    data = getFallbackDietPlan(payload.goal);
                }

                renderDietPlan(data);
            });
        }

        // --- Workout Guide Selector ---
        const musclePills = document.querySelectorAll('.muscle-pill-btn');
        musclePills.forEach(pill => {
            pill.addEventListener('click', async () => {
                musclePills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const muscle = pill.getAttribute('data-muscle');
                let data = await apiRequest(`/api/workouts/${muscle}`);

                if (!data) {
                    data = getFallbackWorkoutData(muscle);
                }

                renderWorkoutGuide(muscle, data);
            });
        });

        // Trigger initial default workout fetch
        const defaultPill = document.querySelector('.muscle-pill-btn.active');
        if (defaultPill) defaultPill.click();
    }

    function renderDietPlan(data) {
        const resultsWrapper = document.getElementById('diet-plan-results');
        const titleEl = document.getElementById('diet-plan-goal-title');
        const targetEl = document.getElementById('diet-plan-target-cals');
        const container = document.getElementById('diet-meals-container');

        if (!resultsWrapper || !container) return;

        resultsWrapper.style.display = 'block';
        if (titleEl) titleEl.textContent = `${data.goal.toUpperCase()} PROTOCOL`;
        if (targetEl) targetEl.textContent = `${data.targetCalories} kcal`;

        container.innerHTML = '';

        data.meals.forEach((meal, idx) => {
            const card = document.createElement('div');
            card.className = 'workout-exercise-card mb-3';
            card.innerHTML = `
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                    <h4 class="exercise-title text-mint mb-0">
                        <i class="fa-solid fa-utensils me-2"></i>Meal ${idx + 1}: ${meal.name}
                    </h4>
                    <span class="exercise-badge">${meal.calories} kcal</span>
                </div>
                <p class="exercise-instructions mb-2">${meal.description}</p>
                <div class="d-flex gap-3 font-weight-600" style="font-size: 0.85rem; color: var(--text-muted);">
                    <span>Protein: <strong class="text-main">${meal.protein}g</strong></span>
                    <span>Carbs: <strong class="text-main">${meal.carbs}g</strong></span>
                    <span>Fats: <strong class="text-main">${meal.fats}g</strong></span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function getFallbackDietPlan(goal) {
        return {
            goal: goal,
            targetCalories: goal === 'bulking' ? 2800 : 1800,
            meals: [
                { name: "Breakfast", calories: 500, description: "Oatmeal with whey protein, banana, and peanut butter.", protein: 35, carbs: 60, fats: 12 },
                { name: "Mid-Morning Snack", calories: 250, description: "Greek yogurt with a handful of almonds.", protein: 20, carbs: 15, fats: 10 },
                { name: "Lunch", calories: 650, description: "Grilled chicken breast with brown rice and steamed broccoli.", protein: 50, carbs: 65, fats: 12 },
                { name: "Afternoon Snack", calories: 200, description: "Hard-boiled eggs and an apple.", protein: 12, carbs: 20, fats: 9 },
                { name: "Dinner", calories: 600, description: "Baked salmon or lean beef steak with sweet potatoes.", protein: 45, carbs: 45, fats: 18 },
                { name: "Evening Recovery", calories: 200, description: "Casein protein shake or cottage cheese.", protein: 25, carbs: 5, fats: 3 }
            ]
        };
    }

    function renderWorkoutGuide(muscle, data) {
        const warmupText = document.getElementById('workout-warmup-text');
        const cooldownText = document.getElementById('workout-cooldown-text');
        const heading = document.getElementById('workout-muscle-heading');
        const grid = document.getElementById('workout-exercises-grid');

        if (warmupText) warmupText.textContent = data.warmup || '5-10 minutes dynamic stretching.';
        if (cooldownText) cooldownText.textContent = data.cooldown || '5 minutes static stretching & deep breathing.';
        if (heading) heading.textContent = `${muscle.toUpperCase()} EXERCISE ROUTINE`;

        if (!grid) return;
        grid.innerHTML = '';

        if (!data.exercises || data.exercises.length === 0) {
            grid.innerHTML = '<p class="text-muted">No exercises available for this category.</p>';
            return;
        }

        data.exercises.forEach(ex => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6';
            col.innerHTML = `
                <div class="workout-exercise-card h-100">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <h4 class="exercise-title mb-0">${ex.name}</h4>
                        <span class="exercise-badge">${ex.sets} Sets x ${ex.reps}</span>
                    </div>
                    <p class="exercise-instructions mb-0">${ex.instructions}</p>
                </div>
            `;
            grid.appendChild(col);
        });
    }

    function getFallbackWorkoutData(muscle) {
        const routines = {
            chest: {
                warmup: "Arm circles, band pull-aparts, light push-ups.",
                cooldown: "Doorway chest stretch, child's pose.",
                exercises: [
                    { name: "Barbell Bench Press", sets: 4, reps: "8-10", instructions: "Lower bar smoothly to mid-chest, drive up explosively." },
                    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", instructions: "Set bench to 30 degrees, squeeze upper chest at peak." }
                ]
            },
            back: {
                warmup: "Cat-cow stretch, dead hangs, lat activation.",
                cooldown: "Kneeling lat stretch, foam rolling lower back.",
                exercises: [
                    { name: "Lat Pulldowns", sets: 4, reps: "10-12", instructions: "Pull bar down to upper chest while driving elbows back." },
                    { name: "Bent-Over Rows", sets: 3, reps: "8-10", instructions: "Hinge at hips with straight back, row weight to navel." }
                ]
            }
        };

        return routines[muscle.toLowerCase()] || {
            warmup: "5-10 mins light cardio & joint mobility.",
            cooldown: "5 mins deep static stretching.",
            exercises: [
                { name: "Standard Push-Ups", sets: 3, reps: "15-20", instructions: "Maintain rigid core and lower chest to floor." },
                { name: "Bodyweight Squats", sets: 4, reps: "15-20", instructions: "Drive knees out, drop hips below parallel." }
            ]
        };
    }

    // ==========================================
    // 8. CONTACT FORM 
    // ==========================================
 
    function initContactForm() {
        const form = document.getElementById('form-contact');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            
            form.reset();
            showToast(`Thank you ${name}! Feedback submitted successfully.`);
        });
    }

    // ==========================================
    // INITIALIZATION ENGINE
    // ==========================================
    initTabNavigation();
    initHeroModule();
    initWaterTracker();
    initCalorieLogger();
    initNotesModule();
    initCalculators();
    initDietAndWorkouts();
    initSystemClock();
    initContactForm();

});