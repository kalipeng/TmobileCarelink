import firebase_admin
from firebase_admin import credentials, db
import joblib
import numpy as np
import time

# === Firebase Admin Initialization ===
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://kneeheal-320a8-default-rtdb.firebaseio.com/'
})

# === Load Trained Model ===
model = joblib.load("mpu_angle_model.pkl")

# === Firebase Reference ===
data_ref = db.reference("/user_001/data")
processed = set()

print("ML prediction loop started...")

while True:
    data = data_ref.get()
    if not data:
        time.sleep(2)
        continue

    sorted_keys = sorted(data.keys(), key=lambda x: int(x))
    for key in sorted_keys:
        if key in processed:
            continue

        entry = data[key]
        try:
            m1 = entry["mpu1"]
            m2 = entry["mpu2"]

            # Construct model input vector
            vector = [
                m1["acc_x"], m1["acc_y"], m1["acc_z"],
                m1["gyro_x"], m1["gyro_y"], m1["gyro_z"],
                m2["acc_x"], m2["acc_y"], m2["acc_z"],
                m2["gyro_x"], m2["gyro_y"], m2["gyro_z"]
            ]
        except KeyError:
            print(f"❌ Incomplete data at {key}, skipping")
            processed.add(key)
            continue

        # Run model prediction
        predicted_angle = float(model.predict([vector])[0])
        print(f"✅ Predicted angle for {key}: {predicted_angle:.2f}")

        # Suggestion logic
        suggestion = (
            "Great range of motion! Keep it up."
            if predicted_angle > 60 else
            "Try to bend a bit further."
        )

        # Write back to Firebase
        update_ref = data_ref.child(key)
        update_ref.update({
            "predicted_angle": round(predicted_angle, 1),
            "suggestions": {"0": suggestion}
        })

        processed.add(key)

    time.sleep(2)  # Wait before checking for new data