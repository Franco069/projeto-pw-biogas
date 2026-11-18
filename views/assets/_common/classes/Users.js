import HttpClientBase from "../scripts/HttpClientBase.js";
import SessionStorage from "../scripts/storage.js";

export default class Users extends HttpClientBase {
    constructor(typeId = 2) {
        super("http://localhost/projeto-pw-biogas/api");
        this.typeId = typeId;
    }

    async login(email, password) {
        return this.postForm("/users/login", {
            email,
            password
        });
    }

    async loginFromForm(form) {
        return this.postForm("/users/login", form);
    }

    async loginAdminFromForm(form) {
        return this.postForm("/users/login-admin", form);
    }

    async register(data) {
        return this.postForm("/users/register", data);
    }

    async update(data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.putForm(this.typeId === 1 ? "/users/update-admin" : "/users/update", data);
    }

    async me() {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.get(this.typeId === 1 ? "/users/me-admin" : "/users/me");
    }

    async uploadPhoto(file) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        const formData = new FormData();
        formData.append("photo", file);
        return this.postForm(this.typeId === 1 ? "/users/photo-admin" : "/users/photo", formData);
    }

    listManaged(typeId) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.get("/users/manage/:type_id", { type_id: typeId });
    }

    createManaged(typeId, data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.postForm("/users/manage/:type_id", data, { type_id: typeId });
    }

    updateManaged(typeId, id, data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.putForm("/users/manage/:type_id/:user_id", data, { type_id: typeId, user_id: id });
    }

    removeManaged(typeId, id) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.delete("/users/manage/:type_id/:user_id", { type_id: typeId, user_id: id });
    }
}
