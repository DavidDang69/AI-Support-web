document.addEventListener("DOMContentLoaded", function () {
    const chat = document.querySelector(".chat");
    const textarea = document.querySelector("textarea");
    const button = document.querySelector("button");

    let sending = false;

    // Přidá zprávu do chatu
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
    }

    // Odešle otázku do Flask backendu
    async function sendMessage() {
        const text = textarea.value.trim();

        if (text === "" || sending) {
            return;
        }

        sending = true;
        button.disabled = true;

        addMessage(text, false);
        textarea.value = "";

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: text,
                        student: "student"
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Chyba backendu."
                );
            }

            // Zobrazí odpověď, kterou vrátil Flask
            addMessage(data.reply, true);

        } catch (error) {
            console.error("Chyba:", error);

            addMessage(
                "Nepodařilo se spojit s backendem. " +
                "Zkontroluj, zda stále běží Flask.",
                true
            );
        } finally {
            sending = false;
            button.disabled = false;
            textarea.focus();
        }
    }

    button.addEventListener("click", sendMessage);

    textarea.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });
});