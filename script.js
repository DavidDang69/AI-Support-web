
document.addEventListener("DOMContentLoaded", function () {
    // Přepínač: true = backend, false = demo bez backendu
    const USE_BACKEND = true;

    // Adresa tvého vlastního backendu na Renderu
    const BACKEND_URL = "https://ai-support-web-0rpr.onrender.com/chat";

    // Doplň své studentské ID, pokud ho učitel vyžaduje
    const STUDENT_ID = "Dang_David_4ITE";

    const chat = document.querySelector(".chat");
    const textarea = document.querySelector("textarea");
    const button = document.querySelector("button");

    // E-mail je volitelný; tvoje současné HTML ho nemusí obsahovat
    const emailInput = document.querySelector("#email");

    let sending = false;

    // Přidá zprávu do chatu a vrátí její textovou bublinu
    function addMessage(text, isAI) {
        const message = document.createElement("div");
        message.classList.add(
            "message",
            isAI ? "ai-message" : "user-message"
        );

        if (isAI) {
            const avatar = document.createElement("div");
            avatar.classList.add("avatar");
            avatar.textContent = "AI";
            message.appendChild(avatar);
        }

        const content = document.createElement("div");
        content.classList.add("message-content");

        const sender = document.createElement("div");
        sender.classList.add("sender");
        sender.textContent = isAI ? "AI Support" : "Ty";

        const bubble = document.createElement("div");
        bubble.classList.add("bubble");
        bubble.textContent = text;

        content.appendChild(sender);
        content.appendChild(bubble);
        message.appendChild(content);
        chat.appendChild(message);

        chat.scrollTop = chat.scrollHeight;

        return bubble;
    }

    // Odešle otázku na backend
    async function sendMessage() {
        const text = textarea.value.trim();

        if (!text || sending) {
            return;
        }

        sending = true;
        button.disabled = true;

        addMessage(text, false);
        textarea.value = "";

        // Zatím zobrazíme stav zpracování
        const answerBubble = addMessage(
            "Zpracovávám dotaz…",
            true
        );

        try {
            const payload = {
                message: text,
                student: STUDENT_ID,
                email: emailInput
                    ? emailInput.value.trim() || null
                    : null
            };

            // DEMO režim bez backendu
            if (!USE_BACKEND) {
                answerBubble.textContent =
                    "Demo odpověď (bez serveru)\n\n" +
                    "Student: " + payload.student + "\n" +
                    "Dotaz: " + payload.message;

                return;
            }

            // Odeslání dotazu na backend
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                answerBubble.textContent = data.error
                    ? "Chyba serveru: " + data.error
                    : "Server vrátil chybu: " + response.status;

                return;
            }

            // Zobrazení odpovědi serveru
            if (data.reply) {
                answerBubble.textContent = data.reply;
            } else if (data.error) {
                answerBubble.textContent =
                    "Chyba serveru: " + data.error;
            } else {
                answerBubble.textContent =
                    "Server nevrátil žádnou odpověď.";
            }

        } catch (error) {
            console.error("Chyba komunikace:", error);

            answerBubble.textContent =
                "Nepodařilo se spojit se serverem.";
        } finally {
            sending = false;
            button.disabled = false;
            textarea.focus();
            chat.scrollTop = chat.scrollHeight;
        }
    }

    // Kliknutí na tlačítko odešle zprávu
    button.addEventListener("click", sendMessage);

    // Enter odešle zprávu, Shift + Enter vytvoří nový řádek
    textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});
