
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI, OpenAIError

app = Flask(__name__)
CORS(app)


@app.get("/")
def home():
    return "VDF Support Backend is running"


@app.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid request data"}), 400

    message = (data.get("message") or "").strip()

    if not message:
        return jsonify({"error": "message is required"}), 400

    if len(message) > 3000:
        return jsonify({"error": "Message is too long"}), 400

    # API klic se nacita z prostredi Renderu
    api_key = os.environ.get("OPENAI_API_KEY")

    if not api_key:
        app.logger.error("OPENAI_API_KEY is not configured")
        return jsonify({
            "error": "OpenAI API key není nastaven na serveru."
        }), 503

    try:
        client = OpenAI(api_key=api_key)

        # Odeslani dotazu do OpenAI API
        response = client.responses.create(
            model=os.environ.get("OPENAI_MODEL", "gpt-5.6-luna"),
            instructions=(
                "Jsi AI asistent technicke podpory skolniho projektu "
                "AI Support. Odpovidej cesky, srozumitelne a vecne. "
                "Pomahaj uzivatelum resit technicke problemy. "
                "Pokud neznas odpoved, priznej to."
            ),
            input=message,
            max_output_tokens=500,
            reasoning={"effort": "low"}
        )

        reply = (response.output_text or "").strip()

        if not reply:
            return jsonify({
                "error": "AI nevratila zadnou odpoved."
            }), 502

        return jsonify({"reply": reply})

    except OpenAIError:
        app.logger.exception("OpenAI API error")
        return jsonify({
            "error": "Nepodarilo se ziskat odpoved od OpenAI API."
        }), 502

    except Exception:
        app.logger.exception("Unexpected backend error")
        return jsonify({
            "error": "Nastala neocekavana chyba backendu."
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
