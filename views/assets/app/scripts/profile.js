
import Users from "../../_common/classes/Users.js";

export default class Profile {
    constructor(storage) {
        this.storage = storage;
        this.users = new Users();
        this.photoObjectUrl = null;
    }

    init() {
        this.users.setAuthToken(this.storage.getToken());

        document.querySelector("[data-profile-form]")?.addEventListener("submit", (event) => {
            this.updateProfile(event);
        });

        document.querySelector("[data-profile-photo-form]")?.addEventListener("submit", (event) => {
            this.updatePhoto(event);
        });

        document.querySelector("[data-profile-photo-input]")?.addEventListener("change", (event) => {
            this.previewPhoto(event.currentTarget.files[0]);
        });

        document.querySelector("[data-profile-photo-cancel]")?.addEventListener("click", () => {
            document.querySelector("[data-profile-photo-input]").value = "";
            this.previewPhoto(null);
        });

        void this.loadProfile();
    }

    async loadProfile() {
        try {
            const response = await this.users.me();

            if (response?.status !== "success" || !response.data) {
                throw new Error(response?.message || "Não foi possível carregar seu perfil.");
            }

            this.renderProfile(response.data);
        } catch (error) {
            this.showFeedback("[data-profile-feedback]", error.message || "Não foi possível carregar seu perfil.", "error");
        }
    }

    renderProfile(user) {
        const form = document.querySelector("[data-profile-form]");

        form.elements.namedItem("name").value = user.name || "";
        form.elements.namedItem("email").value = user.email || "";

        const savedUser = this.storeUser(user);

        if (savedUser.token) {
            this.users.setAuthToken(savedUser.token);
        }

        this.refreshHeader(savedUser);

        const initials = this.getInitials(savedUser.name);
        document.querySelectorAll("[data-user-initials]").forEach((element) => {
            element.textContent = initials;
        });
    }

    async updateProfile(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const button = form.querySelector("[type='submit']");
        const currentPassword = form.elements.namedItem("current_password").value;
        const newPassword = form.elements.namedItem("new_password").value;

        if (Boolean(currentPassword) !== Boolean(newPassword)) {
            this.showFeedback("[data-profile-feedback]", "Para trocar a senha, preencha a senha atual e a nova senha.", "error");
            return;
        }

        if (newPassword && newPassword.length < 8) {
            this.showFeedback("[data-profile-feedback]", "A nova senha deve ter pelo menos 8 caracteres.", "error");
            return;
        }

        const data = {
            name: form.elements.namedItem("name").value.trim(),
            email: form.elements.namedItem("email").value.trim()
        };

        if (currentPassword && newPassword) {
            data.current_password = currentPassword;
            data.new_password = newPassword;
        }

        this.setBusy(button, true, "Salvando...");
        this.showFeedback("[data-profile-feedback]", "");

        try {
            const response = await this.users.update(data);

            if (response?.status !== "success" || !response.data) {
                throw new Error(response?.message || "Não foi possível atualizar seu perfil.");
            }

            this.renderProfile(response.data);

            form.elements.namedItem("current_password").value = "";
            form.elements.namedItem("new_password").value = "";

            this.showFeedback("[data-profile-feedback]", response.message || "Perfil atualizado com sucesso.", "success");
        } catch (error) {
            this.showFeedback("[data-profile-feedback]", error.message || "Não foi possível atualizar seu perfil.", "error");
        } finally {
            this.setBusy(button, false, "Salvar dados");
        }
    }

    async updatePhoto(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const button = form.querySelector("[type='submit']");
        const input = form.elements.namedItem("photo");
        const photo = input.files[0];
        const feedback = "[data-profile-photo-feedback]";

        if (!photo) {
            this.showFeedback(feedback, "Selecione uma imagem para continuar.", "error");
            return;
        }

        if (photo.size > 5 * 1024 * 1024) {
            this.showFeedback(feedback, "A imagem deve ter no máximo 5 MB.", "error");
            return;
        }

        if (photo.type && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
            this.showFeedback(feedback, "Escolha uma imagem JPG, PNG ou WEBP.", "error");
            return;
        }

        this.setBusy(button, true, "Enviando...");
        this.showFeedback(feedback, "");

        try {
            // O Users.js do BioGas recebe o File e monta o FormData.
            const response = await this.users.uploadPhoto(photo);

            if (response?.status !== "success" || !response.data?.photo) {
                throw new Error(response?.message || "Não foi possível atualizar sua foto.");
            }

            const user = this.storeUser({ photo: response.data.photo });

            this.refreshHeader(user);

            form.reset();
            this.revokePhotoPreview();

            this.showFeedback(feedback, response.message || "Foto atualizada com sucesso.", "success");
        } catch (error) {
            this.showFeedback(feedback, error.message || "Não foi possível atualizar sua foto.", "error");
        } finally {
            this.setBusy(button, false, "Atualizar foto");
        }
    }

    previewPhoto(photo) {
        this.revokePhotoPreview();

        const preview = document.querySelector("[data-profile-photo-preview]");
        const image = document.querySelector("[data-profile-preview-image]");

        if (!photo) {
            preview.hidden = true;
            return;
        }

        this.photoObjectUrl = URL.createObjectURL(photo);
        image.src = this.photoObjectUrl;
        preview.hidden = false;
    }

    refreshHeader(user) {
        const initials = this.getInitials(user.name);

        document.querySelectorAll("[data-user-name]").forEach((element) => {
            element.textContent = user.name || "Minha Conta";
        });

        document.querySelectorAll("[data-user-avatar]").forEach((avatar) => {
            const image = avatar.querySelector("[data-user-photo]");
            const fallback = avatar.querySelector("[data-user-initials]");
            const photoUrl = this.getSafePhotoUrl(user.photo);

            fallback.textContent = initials;

            image.hidden = true;
            fallback.hidden = false;

            image.onerror = () => {
                image.hidden = true;
                fallback.hidden = false;
            };

            image.onload = () => {
                image.hidden = false;
                fallback.hidden = true;
            };

            if (photoUrl) {
                image.src = photoUrl;
            } else {
                image.removeAttribute("src");
            }
        });
    }

    storeUser(changes) {
        const user = { ...(this.storage.getUser() || {}), ...changes };
        const token = user.token || this.storage.getToken();

        if (token) {
            this.storage.saveSession(token, user);
        }

        return user;
    }

    getInitials(name = "") {
        return name.split(" ").filter(Boolean).slice(0, 2)
            .map((part) => part[0]).join("").toUpperCase() || "BG";
    }

    getSafePhotoUrl(photo) {
        if (typeof photo !== "string" || photo === "") {
            return null;
        }

        try {
            const url = new URL(photo, new URL("../../../../", import.meta.url));

            return ["http:", "https:", "blob:"].includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    }

    revokePhotoPreview() {
        if (this.photoObjectUrl) {
            URL.revokeObjectURL(this.photoObjectUrl);
            this.photoObjectUrl = null;
        }

        const preview = document.querySelector("[data-profile-photo-preview]");

        if (preview) {
            preview.hidden = true;
        }

        document.querySelector("[data-profile-preview-image]")?.removeAttribute("src");
    }

    showFeedback(selector, message, type = "") {
        const element = document.querySelector(selector);

        if (!element) {
            return;
        }

        element.textContent = message;
        element.className = `app-message${type ? ` is-${type}` : ""}`;
        element.dataset.state = type;
        element.classList.toggle("hidden", !message);
    }

    setBusy(button, busy, label) {
        button.disabled = busy;
        button.textContent = busy ? "Aguarde..." : label;
    }
}
