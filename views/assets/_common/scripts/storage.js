export default class SessionStorage {
    #tokenKey;
    #userKey;

    constructor(scope = "user") {
        this.scope = scope;

        const suffix = scope === "user" ? "" : `_${scope}`;

        this.#tokenKey = `biogas_token${suffix}`;
        this.#userKey = `biogas_user${suffix}`;
    }

    saveSession(token, user = null) {
        localStorage.setItem(this.#tokenKey, token);

        if (user) {
            localStorage.setItem(this.#userKey, JSON.stringify(user));
        }
    }

    getToken() {
        return localStorage.getItem(this.#tokenKey);
    }

    getUser() {
        const user = localStorage.getItem(this.#userKey);

        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user);
        } catch (error) {
            this.clearSession();
            return null;
        }
    }

    clearSession() {
        localStorage.removeItem(this.#tokenKey);
        localStorage.removeItem(this.#userKey);
    }
}