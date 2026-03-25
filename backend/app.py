"""
backend/app.py — Flask REST API for Diabetic Retinopathy detection.

Run:
    python backend/app.py

Endpoints:
    GET  /health   → health check
    POST /predict  → DR stage prediction from uploaded image

Requires:
    model/dr_model.h5 to exist (pretrained 5-class Keras model)
"""

import sys
import os
import tempfile

# Allow importing predict.py from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask, request, jsonify
from predict import predict_dr, DR_LABELS

# ─── App setup ─────────────────────────────────────────────────────────────────

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "tif", "tiff", "bmp"}


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check — confirms the API is reachable."""
    return jsonify({
        "status":  "running",
        "message": "Diabetic Retinopathy Detection API is online.",
        "stages":  DR_LABELS,
    })


@app.route("/predict", methods=["POST"])
def predict():
    """
    POST /predict

    Accepts a multipart/form-data request with an image file under the key 'image'.
    Returns a JSON object:
        {
            "prediction":        "Severe NPDR",
            "stage":             3,
            "confidence":        0.87,
            "all_probabilities": {
                "No DR":            0.02,
                "Mild NPDR":        0.04,
                "Moderate NPDR":    0.05,
                "Severe NPDR":      0.87,
                "Proliferative DR": 0.02
            }
        }

    Error responses:
        400  — missing or invalid file
        415  — unsupported image format
        503  — model file not found on server
        500  — unexpected inference error
    """

    # ── Validate upload ──────────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided.",
            "hint":  "Send a multipart/form-data POST with key 'image'.",
        }), 400

    file = request.files["image"]

    if file.filename == "" or file.filename is None:
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error":   "Unsupported file format.",
            "allowed": sorted(ALLOWED_EXTENSIONS),
        }), 415

    # ── Save to a temp file, run inference, clean up ─────────────────────────
    ext = "." + file.filename.rsplit(".", 1)[1].lower()
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name

        result = predict_dr(tmp_path)

        return jsonify({
            "prediction":        result["prediction"],
            "confidence":        result["confidence"],
            "stage":             result["stage"],
            "all_probabilities": result["all_probabilities"],
        })

    except FileNotFoundError as e:
        # Model file missing on server side
        return jsonify({
            "error":  "Model not loaded.",
            "detail": str(e),
        }), 503

    except Exception as e:
        return jsonify({
            "error":  "Prediction failed.",
            "detail": str(e),
        }), 500

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ─── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    print(f"[INFO] Starting DR Detection API on port {port} …")
    app.run(host="0.0.0.0", port=port, debug=debug)
