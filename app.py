
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Pro školní projekt povolíme CORS všude
CORS(app)

# Cesta ke znalostnímu dokumentu
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

KNOWLEDGE_FILE = os.path.join(
    BASE_DIR,
    "doc",
    "podpora.md"
)

# Načtení znalostního dokumentu
def load_knowledge_base():
    try:
        with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as file:
            content = file.read()

        app.logger.info("Znalostni dokument byl nacten.")
        return content

    except FileNotFoundError:
        app.logger.error("Soubor doc/podpora.md nebyl nalezen.")
        return None


KNOWLEDGE_BASE = load_knowledge_base()


@app.get("/")
def home():
    return "VDF Support Backend is running"


# Kontrola, zda je dokument načtený
@app.get("/knowledge-status")
def knowledge_status():
    return jsonify({
        "loaded": KNOWLEDGE_BASE is not None,
        "characters": len(KNOWLEDGE_BASE) if KNOWLEDGE_BASE else 0
    })


@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    message = data.get("message", "")
    student = data.get("student", "unknown")

    if not isinstance(message, str):
        return jsonify({"error": "Invalid message"}), 400

    message = message.strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    if KNOWLEDGE_BASE is None:
        return jsonify({
            "error": "Knowledge document is not available."
        }), 503

    # Zatím testovací odpověď
    reply = (
        f"[DEMO] Přijal jsem dotaz od {student}: {message}\n"
        "Znalostní dokument podpora.md je načten."
    )

    return jsonify({"reply": reply})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
    