const Toast = {
    show(message, type = "success") {
        const toast = document.createElement("section");

        toast.classList.add("toast");
        toast.classList.add(`toast-${type}`);

        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(function () {
            toast.remove();
        }, 3000);
    },

    success(message) {
        this.show(message, "success");
    },

    warning(message) {
        this.show(message, "warning");
    },

    error(message) {
        this.show(message, "error");
    },

    response(response) {
        if (!response) {
            this.error("Resposta inesperada da API.");
            return;
        }

        const message =
            response.message || "Resposta recebida.";

        if (response.type === "success") {
            this.success(message);
            return;
        }

        if (response.type === "warning") {
            this.warning(message);
            return;
        }

        if (response.type === "error") {
            this.error(message);
            return;
        }

        this.error("Resposta inesperada da API.");
        console.error(response);
    }
};

export default Toast;