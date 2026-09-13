from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import cv2
import os
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from ultralytics import YOLO


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

DETECTOR_PATH = MODEL_DIR / "best.pt"
BINARY_VERIFIER_PATH = MODEL_DIR / "binary_pothole_verifier.pt"
SEVERITY_PATH = MODEL_DIR / "pothole_verifier.pt"

DETECTOR_CONFIDENCE = 0.35
BINARY_THRESHOLD = 0.60
DETECTOR_IMAGE_SIZE = 768

CROP_PADDING = 0.15


# ============================================================
# CHECK MODELS
# ============================================================

for model_path in [
    DETECTOR_PATH,
    BINARY_VERIFIER_PATH,
    SEVERITY_PATH,
]:
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")


# ============================================================
# LOAD MODELS ONCE
# ============================================================

print("Loading AI models...")

detector = YOLO(str(DETECTOR_PATH))
binary_verifier = YOLO(str(BINARY_VERIFIER_PATH))
severity_model = YOLO(str(SEVERITY_PATH))

print("All AI models loaded successfully.")


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(title="Pothole AI Service")
FRONTEND_ORIGINS = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in FRONTEND_ORIGINS],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Pothole AI Service",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models": {
            "detector": True,
            "binary_verifier": True,
            "severity": True,
        },
    }


# ============================================================
# HELPERS
# ============================================================

def get_class_index(model, target_name):
    names = model.names

    for index, name in names.items():
        if str(name).lower() == target_name.lower():
            return int(index)

    raise ValueError(
        f"Class '{target_name}' not found. Classes: {names}"
    )


def padded_crop(image, box):
    height, width = image.shape[:2]

    x1, y1, x2, y2 = map(float, box)

    box_width = x2 - x1
    box_height = y2 - y1

    pad_x = box_width * CROP_PADDING
    pad_y = box_height * CROP_PADDING

    x1 = max(0, int(x1 - pad_x))
    y1 = max(0, int(y1 - pad_y))
    x2 = min(width, int(x2 + pad_x))
    y2 = min(height, int(y2 + pad_y))

    return image[y1:y2, x1:x2]


def classify_severity(crop):
    result = severity_model.predict(
        crop,
        imgsz=224,
        verbose=False,
        device="cpu",
    )[0]

    probabilities = result.probs.data.cpu().numpy()

    severity_scores = {}

    for index, class_name in severity_model.names.items():
        name = str(class_name).lower()

        if name in {"minor", "moderate", "severe"}:
            severity_scores[name] = float(probabilities[int(index)])

    total = sum(severity_scores.values())

    if total <= 0:
        return "unknown", 0.0

    # Ignore the old "not_pothole" severity class and
    # renormalize only the actual severity classes.
    severity_scores = {
        name: score / total
        for name, score in severity_scores.items()
    }

    severity = max(
        severity_scores,
        key=severity_scores.get
    )

    confidence = severity_scores[severity]

    return severity, confidence


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    try:
        image_bytes = await file.read()

        np_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8
        )

        image = cv2.imdecode(
            np_array,
            cv2.IMREAD_COLOR
        )

        if image is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image file."
            )

        image_height, image_width = image.shape[:2]

        # ----------------------------------------------------
        # 1. POTHOLE DETECTOR
        # ----------------------------------------------------

        detector_result = detector.predict(
            image,
            imgsz=DETECTOR_IMAGE_SIZE,
            conf=DETECTOR_CONFIDENCE,
            device="cpu",
            verbose=False,
        )[0]

        accepted_detections = []

        if detector_result.boxes is None:
            detector_boxes = []
        else:
            detector_boxes = detector_result.boxes

        pothole_class_index = get_class_index(
            binary_verifier,
            "pothole"
        )

        # ----------------------------------------------------
        # 2. VERIFY EACH DETECTION
        # ----------------------------------------------------

        for box_data in detector_boxes:

            box = (
                box_data.xyxy[0]
                .cpu()
                .numpy()
            )

            detector_conf = float(
                box_data.conf[0]
                .cpu()
                .item()
            )

            crop = padded_crop(
                image,
                box
            )

            if crop.size == 0:
                continue

            verification = binary_verifier.predict(
                crop,
                imgsz=224,
                device="cpu",
                verbose=False,
            )[0]

            pothole_probability = float(
                verification.probs.data[
                    pothole_class_index
                ]
                .cpu()
                .item()
            )

            # Reject false positive
            if pothole_probability < BINARY_THRESHOLD:
                continue

            # ------------------------------------------------
            # 3. SEVERITY
            # ------------------------------------------------

            severity, severity_confidence = (
                classify_severity(crop)
            )

            x1, y1, x2, y2 = map(
                float,
                box
            )

            bbox = {
                "x": round(
                    (x1 / image_width) * 100,
                    2
                ),
                "y": round(
                    (y1 / image_height) * 100,
                    2
                ),
                "width": round(
                    ((x2 - x1) / image_width) * 100,
                    2
                ),
                "height": round(
                    ((y2 - y1) / image_height) * 100,
                    2
                ),
            }

            accepted_detections.append({
                "confidence": round(
                    detector_conf * 100,
                    2
                ),
                "verificationConfidence": round(
                    pothole_probability * 100,
                    2
                ),
                "severity": severity,
                "severityConfidence": round(
                    severity_confidence * 100,
                    2
                ),
                "boundingBox": bbox,
            })

        # ----------------------------------------------------
        # NO POTHOLE
        # ----------------------------------------------------

        if not accepted_detections:
            return {
                "detected": False,
                "detectedCount": 0,
                "confidenceScore": 0,
                "severity": None,
                "boundingBoxes": [],
                "detections": [],
            }

        # ----------------------------------------------------
        # SUMMARY RESULT
        # ----------------------------------------------------

        highest_confidence_detection = max(
            accepted_detections,
            key=lambda item: item["confidence"]
        )

        severity_priority = {
            "minor": 1,
            "moderate": 2,
            "severe": 3,
        }

        overall_severity_detection = max(
            accepted_detections,
            key=lambda item: severity_priority.get(
                item["severity"],
                0
            )
        )

        return {
            "detected": True,
            "detectedCount": len(
                accepted_detections
            ),
            "confidenceScore":
                highest_confidence_detection[
                    "confidence"
                ],
            "severity":
                overall_severity_detection[
                    "severity"
                ],
            "boundingBoxes": [
                item["boundingBox"]
                for item in accepted_detections
            ],
            "detections":
                accepted_detections,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("Prediction error:", error)

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )