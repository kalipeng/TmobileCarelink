import firebase_admin
from firebase_admin import credentials, db
import joblib
import numpy as np
import time

# ========== Step 1: Initialize Firebase ==========
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://kneeheal-320a8-default-rtdb.firebaseio.com/'
})

# ========== Step 2: Load the trained model ==========
model = joblib.load("mpu_angle_model.pkl")

# ========== Step 3: Retrieve the latest uploaded sensor data ==========
ref = db.reference("user_001/data")
snapshot = ref.order_by_key().limit_to_last(1).get()

for timestamp, data in snapshot.items():
    mpu1 = data.get("mpu1", {})
    mpu2 = data.get("mpu2", {})

    if not mpu1 or not mpu2:
        print("Missing mpu1 or mpu2 data. Skipping.")
        continue

    # ========== Step 4: Create the feature vector ==========
    feature_vector = [
        mpu1.get("acc_x", 0), mpu1.get("acc_y", 0), mpu1.get("acc_z", 0),
        mpu1.get("gyro_x", 0), mpu1.get("gyro_y", 0), mpu1.get("gyro_z", 0),
        mpu2.get("acc_x", 0), mpu2.get("acc_y", 0), mpu2.get("acc_z", 0),
        mpu2.get("gyro_x", 0), mpu2.get("gyro_y", 0), mpu2.get("gyro_z", 0),
    ]

    # ========== Step 5: Predict using the model ==========
    predicted_angle = model.predict([feature_vector])[0]

    # ========== Step 6: Generate system suggestions ==========
    suggestions = []
    if predicted_angle > 100:
        suggestions.append("Warning: Knee flexion angle is too high.")
    elif predicted_angle < 30:
        suggestions.append("Encourage more movement to reach the target angle.")
    else:
        suggestions.append("Great range of motion! Keep it up.")

    # ========== Step 7: Write prediction and suggestions back to Firebase ==========
    update_data = {
        "predicted_angle": float(predicted_angle),
        "suggestions": suggestions
    }
    ref.child(timestamp).update(update_data)

    print(f"Prediction and suggestions updated in Firebase (timestamp {timestamp}).")
