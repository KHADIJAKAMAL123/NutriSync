import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# ==========================================
# 1. GLOBAL DICTIONARIES & CONSTANTS
# ==========================================

MOTIVATIONAL_QUOTES = [
    "Success starts with self-discipline.",
    "Your body can stand almost anything. It is your mind that you have to convince.",
    "Small daily improvements over time lead to stunning results.",
    "Action is the foundational key to all success.",
    "Energy flows where attention goes.",
    "You do not have to be extreme, just consistent.",
    "Progress, not perfection.",
    "The secret of getting ahead is getting started.",
    "Strength does not come from physical capacity. It comes from an indomitable will.",
    "Take care of your body. It is the only place you have to live.",
]

HEALTH_ADVICES = [
    "Aim to drink at least 3 liters of water throughout the day for optimal metabolic function.",
    "Prioritize 7 to 9 hours of quality sleep each night to maximize muscle recovery and mental clarity.",
    "Include high-fiber whole foods in every meal to support digestion and sustain energy levels.",
    "Incorporate 10 to 15 minutes of light stretching or mobility work into your daily routine.",
    "Limit processed sugar intake and opt for complex carbohydrates like oats and brown rice.",
    "Maintain consistent meal timing to keep blood sugar levels stable and prevent energy crashes.",
    "Practice mindful eating by slowing down during meals to improve digestion and satiety signals.",
    "Consume high-quality protein within 1 to 2 hours post-workout to kickstart muscle repair.",
    "Take short walking breaks every hour during sedentary tasks to keep circulation active.",
    "Include a variety of colourful vegetables in your daily diet to cover essential micronutrients.",
]

FOOD_PROTEIN_DB = {
    "eggs": {"unit": "piece", "protein_per_unit": 6.0},
    "egg white": {"unit": "piece", "protein_per_unit": 3.6},
    "chicken": {"unit": "gram", "protein_per_unit": 0.27},
    "boiled chicken": {"unit": "gram", "protein_per_unit": 0.27},
    "chicken breast": {"unit": "gram", "protein_per_unit": 0.31},
    "chickpeas": {"unit": "gram", "protein_per_unit": 0.19},
    "chole": {"unit": "gram", "protein_per_unit": 0.19},
    "oats": {"unit": "gram", "protein_per_unit": 0.17},
    "oatmeal": {"unit": "gram", "protein_per_unit": 0.17},
    "lentils": {"unit": "gram", "protein_per_unit": 0.09},
    "daal": {"unit": "gram", "protein_per_unit": 0.09},
    "daal mash": {"unit": "gram", "protein_per_unit": 0.22},
    "red beans": {"unit": "gram", "protein_per_unit": 0.24},
    "lobia": {"unit": "gram", "protein_per_unit": 0.24},
    "yogurt": {"unit": "gram", "protein_per_unit": 0.10},
    "dahi": {"unit": "gram", "protein_per_unit": 0.10},
    "cottage cheese": {"unit": "gram", "protein_per_unit": 0.12},
    "paneer": {"unit": "gram", "protein_per_unit": 0.12},
    "soya chunks": {"unit": "gram", "protein_per_unit": 0.48},
    "tofu": {"unit": "gram", "protein_per_unit": 0.08},
    "almonds": {"unit": "gram", "protein_per_unit": 0.21},
    "peanut butter": {"unit": "gram", "protein_per_unit": 0.25},
    "whey protein powder": {"unit": "gram", "protein_per_unit": 0.80},
    "fish fillet": {"unit": "gram", "protein_per_unit": 0.22},
    "greek yogurt": {"unit": "gram", "protein_per_unit": 0.10},
}

WORKOUT_DATABASE = {
    "chest": {
        "warmup": "5 minutes light jump rope followed by arm circles and 2 set x 15 reps lightweight incline push-ups.",
        "cooldown": "3 minutes door-frame chest stretch and static shoulder stretch.",
        "exercises": [
            {
                "name": "Barbell Bench Press",
                "sets_reps": "4 sets x 8-10 reps",
                "instructions": "Lie flat on the bench, grip barbell slightly wider than shoulder-width, lower smoothly to mid-chest, and press explosively.",
            },
            {
                "name": "Incline Dumbbell Press",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Set bench to a 30-45 degree incline. Press dumbbells straight up over upper chest while keeping core tight.",
            },
            {
                "name": "Cable Chest Flyes",
                "sets_reps": "3 sets x 12-15 reps",
                "instructions": "Stand in the center of cable towers. Pull handles together in front of chest in a hugging motion with a slight elbow bend.",
            },
            {
                "name": "Parallel Bar Dips",
                "sets_reps": "3 sets to failure",
                "instructions": "Lean slightly forward to target chest muscles, lower until elbows are at 90 degrees, and push back up.",
            },
        ],
    },
    "back": {
        "warmup": "5 minutes rower or light cardio followed by cat-cow stretches and band pull-aparts.",
        "cooldown": "3 minutes lat child pose stretch and foam rolling lower back.",
        "exercises": [
            {
                "name": "Barbell Deadlift",
                "sets_reps": "4 sets x 6-8 reps",
                "instructions": "Keep spine neutral, drive hips through, keep bar close to shins, and extend fully at the top.",
            },
            {
                "name": "Lat Pulldowns",
                "sets_reps": "4 sets x 10-12 reps",
                "instructions": "Grip bar wide, pull down toward upper chest while driving elbows down and back. Avoid swinging.",
            },
            {
                "name": "Bent-Over Barbell Rows",
                "sets_reps": "3 sets x 8-10 reps",
                "instructions": "Hinge hips back at 45 degrees, row bar into belly button while driving elbows past torso.",
            },
            {
                "name": "Seated Cable Rows",
                "sets_reps": "3 sets x 12 reps",
                "instructions": "Sit upright, keep shoulders depressed, pull handle into stomach, squeeze shoulder blades together.",
            },
        ],
    },
    "arms": {
        "warmup": "3 minutes wrist mobility drills and lightweight dumbbell hammer curls paired with triceps pushdowns.",
        "cooldown": "3 minutes forearm, bicep, and overhead tricep wall stretches.",
        "exercises": [
            {
                "name": "EZ Bar Bicep Curl",
                "sets_reps": "4 sets x 10-12 reps",
                "instructions": "Keep elbows locked near ribs, curl bar toward shoulders, pause at peak contraction.",
            },
            {
                "name": "Triceps Cable Pushdowns",
                "sets_reps": "4 sets x 12-15 reps",
                "instructions": "Extend arms down fully using a rope or straight bar, squeezing triceps locked at bottom.",
            },
            {
                "name": "Incline Dumbbell Curls",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Sit back on 45-degree bench, extend arms fully at bottom, curl without swinging shoulders.",
            },
            {
                "name": "Skullcrushers (Lying Tricep Extension)",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Lie flat, lower bar toward forehead by bending elbows, press up extending forearms.",
            },
        ],
    },
    "legs": {
        "warmup": "5 minutes stationary cycle followed by leg swings, bodyweight squats, and ankle mobility stretches.",
        "cooldown": "4 minutes standing quad stretches, seated hamstring stretches, and calf stretches.",
        "exercises": [
            {
                "name": "Barbell Back Squats",
                "sets_reps": "4 sets x 8-10 reps",
                "instructions": "Position bar across upper back, bend knees and hips, squat until thighs are parallel to ground, drive through heels.",
            },
            {
                "name": "Romanian Deadlifts",
                "sets_reps": "4 sets x 10-12 reps",
                "instructions": "Keep soft knee bend, hinge forward at hips until hamstrings feel tight, return to top.",
            },
            {
                "name": "Leg Press",
                "sets_reps": "3 sets x 12-15 reps",
                "instructions": "Place feet shoulder-width apart, lower sled control to 90 degrees, press up without locking knees.",
            },
            {
                "name": "Standing Calf Raises",
                "sets_reps": "4 sets x 15-20 reps",
                "instructions": "Elevate toes on step, lower heels deep down, explode up onto toes and squeeze calf muscles.",
            },
        ],
    },
    "shoulders": {
        "warmup": "5 minutes arm circles, dumbbell external rotations, and light overhead presses.",
        "cooldown": "3 minutes cross-body shoulder stretch and upper trap stretches.",
        "exercises": [
            {
                "name": "Overhead Barbell Military Press",
                "sets_reps": "4 sets x 8-10 reps",
                "instructions": "Press barbell straight overhead from collarbone level, lock out core and glutes at peak.",
            },
            {
                "name": "Dumbbell Lateral Raises",
                "sets_reps": "4 sets x 12-15 reps",
                "instructions": "Raise dumbbells out to sides until parallel to floor with slight forward tilt of pinky fingers.",
            },
            {
                "name": "Face Pulls",
                "sets_reps": "3 sets x 15 reps",
                "instructions": "Attach rope to high pulley, pull toward face while driving hands outward to target rear delts.",
            },
            {
                "name": "Dumbbell Front Raises",
                "sets_reps": "3 sets x 12 reps",
                "instructions": "Lift weights straight forward in front of chest under strict control without torso sway.",
            },
        ],
    },
    "biceps": {
        "warmup": "3 minutes light dumbbell curls and wrist rolls.",
        "cooldown": "2 minutes standing wall bicep stretch.",
        "exercises": [
            {
                "name": "Barbell Bicep Curl",
                "sets_reps": "4 sets x 8-10 reps",
                "instructions": "Keep posture tall, curl shoulder-width grip barbell upward without swinging lower back.",
            },
            {
                "name": "Hammer Curls",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Grip dumbbells with neutral palms facing each other, lift straight up toward shoulders.",
            },
            {
                "name": "Preacher Curls",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Rest arms on preacher pad, lower weight fully, squeeze biceps hard at top.",
            },
            {
                "name": "Concentration Curls",
                "sets_reps": "3 sets x 12 reps",
                "instructions": "Rest elbow against inner thigh, lift dumbbell toward chest focus on peak isolation.",
            },
        ],
    },
    "triceps": {
        "warmup": "3 minutes light cable tricep extensions and push-ups.",
        "cooldown": "2 minutes overhead tricep static stretch.",
        "exercises": [
            {
                "name": "Close-Grip Bench Press",
                "sets_reps": "4 sets x 8-10 reps",
                "instructions": "Grip barbell shoulder-width apart, keep elbows tucked close to body throughout motion.",
            },
            {
                "name": "Overhead Dumbbell Tricep Extension",
                "sets_reps": "3 sets x 10-12 reps",
                "instructions": "Hold dumbbell overhead with both hands, lower behind head, press straight back up.",
            },
            {
                "name": "Tricep Dips on Bench",
                "sets_reps": "3 sets x 12-15 reps",
                "instructions": "Place hands behind back on bench, lower hips downward by bending arms, press back up.",
            },
            {
                "name": "Single-Arm Cable Kickbacks",
                "sets_reps": "3 sets x 12 reps per arm",
                "instructions": "Hinge forward, extend arm backward smoothly until tricep is fully contracted.",
            },
        ],
    },
}


# ==========================================
# 2. FLASK ROUTES & ENDPOINTS
# ==========================================

@app.route("/")
def index():
    """Serve index.html template."""
    return render_template("index.html")


@app.route("/api/inspiration", methods=["GET"])
def get_inspiration():
    """Return random motivational quote and health advice."""
    quote = random.choice(MOTIVATIONAL_QUOTES)
    advice = random.choice(HEALTH_ADVICES)
    return jsonify({"quote": quote, "advice": advice})


@app.route("/api/bmi", methods=["POST"])
def calculate_bmi():
    """
    Accept JSON {"weight": float, "height": float}.
    Calculate BMI = weight / ((height / 100) ^ 2).
    """
    data = request.get_json() or {}
    weight = float(data.get("weight", 0))
    height = float(data.get("height", 0))

    if weight <= 0 or height <= 0:
        return jsonify({"error": "Weight and height must be positive numbers."}), 400

    height_in_meters = height / 100.0
    bmi = round(weight / (height_in_meters ** 2), 2)

    if bmi < 18.5:
        category = "Underweight"
        advice = "Consider a calorie-surplus diet rich in complex carbs and lean protein to build healthy weight."
    elif 18.5 <= bmi <= 24.9:
        category = "Normal weight"
        advice = "Maintain your balanced meal intake and continue with regular resistance and cardio training."
    elif 25.0 <= bmi <= 29.9:
        category = "Overweight"
        advice = "Incorporate a mild calorie deficit combined with daily cardio and strength training."
    else:
        category = "Obese"
        advice = "Focus on structured nutritional changes, regular low-impact exercise, and consult a professional."

    return jsonify({"bmi": bmi, "category": category, "advice": advice})


@app.route("/api/calorie-budget", methods=["POST"])
def calculate_calorie_budget():
    """
    Accept JSON {"weight": float, "height": float, "age": float, "gender": str, "act": str}.
    Calculate BMR using Harris-Benedict equation and macro splits.
    """
    data = request.get_json() or {}
    weight = float(data.get("weight", 0))
    height = float(data.get("height", 0))
    age = float(data.get("age", 0))
    gender = str(data.get("gender", "")).strip().lower()
    act = str(data.get("act", "")).strip().lower()

    if weight <= 0 or height <= 0 or age <= 0:
        return jsonify({"error": "Weight, height, and age must be positive values."}), 400

    if gender == "male":
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    elif gender == "female":
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    else:
        return jsonify({"error": "Gender must be either 'male' or 'female'."}), 400

    activity_multipliers = {
        "sedentary": 1.2,
        "lightly active": 1.55,
        "lightly_active": 1.55,
        "intense exercise": 1.9,
        "intense_exercise": 1.9,
    }

    multiplier = activity_multipliers.get(act, 1.2)
    total_calories = round(bmr * multiplier, 2)
    bmr = round(bmr, 2)

    # Macros calculations: Protein 30%, Carbs 40%, Fats 30%
    protein_g = round((total_calories * 0.30) / 4.0, 2)
    carbs_g = round((total_calories * 0.40) / 4.0, 2)
    fats_g = round((total_calories * 0.30) / 9.0, 2)

    return jsonify(
        {
            "bmr": bmr,
            "total_calories": total_calories,
            "macros": {
                "protein": protein_g,
                "carbs": carbs_g,
                "fats": fats_g,
            },
        }
    )


@app.route("/api/nutrient-counter", methods=["POST"])
def calculate_nutrient():
    """
    Accept JSON {"food": str, "quantity": float}.
    Look up food item in FOOD_PROTEIN_DB and return protein content.
    """
    data = request.get_json() or {}
    food_input = str(data.get("food", "")).strip().lower()
    quantity = float(data.get("quantity", 0))

    if not food_input or quantity <= 0:
        return jsonify({"error": "Please provide a valid food item name and positive quantity."}), 400

    matched_item = None
    for item_key, details in FOOD_PROTEIN_DB.items():
        if item_key == food_input or item_key in food_input or food_input in item_key:
            matched_item = (item_key, details)
            break

    if not matched_item:
        return jsonify(
            {
                "food": food_input,
                "quantity": quantity,
                "protein": 0.0,
                "message": f"Food item '{food_input}' was not found in database. Try chicken, eggs, oats, or daal.",
            }
        ), 444

    item_name, item_info = matched_item
    unit = item_info["unit"]
    total_protein = round(quantity * item_info["protein_per_unit"], 2)

    message = f"Found {item_name.title()}: {total_protein}g protein total for {quantity} {unit}(s)."

    return jsonify(
        {
            "food": item_name.title(),
            "quantity": quantity,
            "protein": total_protein,
            "message": message,
        }
    )


@app.route("/api/diet-plan", methods=["POST"])
def generate_diet_plan():
    """
    Accept JSON {"goal": str, "bmr": float}.
    Goals supported: 'bulking', 'cutting', 'weight-loss'.
    Return a detailed 6-meal structure tailored to goal and BMR.
    """
    data = request.get_json() or {}
    goal = str(data.get("goal", "")).strip().lower()
    bmr = float(data.get("bmr", 1800))

    if bmr <= 0:
        bmr = 1800.0

    if goal == "bulking":
        target_calories = round(bmr * 1.4, 2)
        portion_modifier = "Large Portion"
        protein_boost = "High Protein + High Complex Carbs"
        meals = {
            "Breakfast": f"4 Whole Eggs + 100g Oats with Banana and Peanut Butter ({portion_modifier})",
            "Mid-Morning Snack": "150g Cottage Cheese / Paneer with Mixed Nuts and Whole Wheat Bread",
            "Lunch": f"250g Chicken Breast / Boiled Chicken + 200g Brown Rice + Salad ({protein_boost})",
            "Afternoon Snack": "50g Soya Chunks or Chickpeas Chaat + Fruit Smoothie",
            "Dinner": "200g Fish Fillet or Red Beans / Lobia Curry + 2 Whole Wheat Rotis + Vegetables",
            "Evening Recovery": "1 Scoop Whey Protein Powder / 200g Greek Yogurt with Almonds",
        }
    elif goal in ["cutting", "weight-loss", "weight_loss"]:
        target_calories = round(bmr * 0.9, 2)
        portion_modifier = "Strict Controlled Portion"
        protein_boost = "High Lean Protein + Low Carbs"
        meals = {
            "Breakfast": f"4 Egg Whites + 1 Whole Egg + 40g Oatmeal in Water ({portion_modifier})",
            "Mid-Morning Snack": "100g Cucumber and Tomato Salad + 10 Almonds",
            "Lunch": f"150g Boiled Chicken / Fish + 80g Steamed Quinoa or Brown Rice ({protein_boost})",
            "Afternoon Snack": "100g Low-Fat Yogurt / Dahi or Green Tea with Sprouts",
            "Dinner": "150g Tofu or Daal Mash / Lentils + Large Bowl of Green Leafy Vegetables",
            "Evening Recovery": "1 Scoop Whey Protein in Water or 3 Boiled Egg Whites",
        }
    else:
        target_calories = round(bmr * 1.15, 2)
        portion_modifier = "Moderate Balanced Portion"
        protein_boost = "Balanced Protein and Carbohydrates"
        meals = {
            "Breakfast": f"2 Whole Eggs + 2 Slices Whole Grain Toast + 1 Fruit ({portion_modifier})",
            "Mid-Morning Snack": "1 Bowl Greek Yogurt / Dahi with Honey",
            "Lunch": f"180g Chicken or Chickpeas / Chole + 150g Rice + Fresh Greens ({protein_boost})",
            "Afternoon Snack": "Handful of Almonds and Walnuts + Green Tea",
            "Dinner": "150g Cottage Cheese / Paneer or Lentils + 1 Wheat Roti + Salad",
            "Evening Recovery": "1 Glass Warm Milk / Soy Milk or 2 Egg Whites",
        }

    return jsonify(
        {
            "goal": goal.title(),
            "target_calories": target_calories,
            "meals": meals,
        }
    )


@app.route("/api/workouts/<muscle>", methods=["GET"])
def get_workout(muscle):
    """Return exercise guides, warmup, and cooldown for the requested muscle string."""
    muscle_key = str(muscle).strip().lower()

    if muscle_key not in WORKOUT_DATABASE:
        available_muscles = list(WORKOUT_DATABASE.keys())
        return jsonify(
            {
                "error": f"Muscle group '{muscle}' not found.",
                "available_muscle_groups": available_muscles,
            }
        ), 404

    data = WORKOUT_DATABASE[muscle_key]
    return jsonify(
        {
            "muscle": muscle_key.title(),
            "warmup": data["warmup"],
            "cooldown": data["cooldown"],
            "exercises": data["exercises"],
        }
    )


# ==========================================
# 3. APPLICATION LAUNCHER
# ==========================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)