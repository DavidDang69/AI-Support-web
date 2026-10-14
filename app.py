
import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)


@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}

    message = (data.get("message") or "").strip()
    student = (data.get("student") or "unknown").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    # Zatím testovací odpověď
    reply = f"[DEMO] Přijal jsem dotaz od {student}: {message}"

    return jsonify({"reply": reply})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=True)
