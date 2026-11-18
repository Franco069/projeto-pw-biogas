import HttpClientBase from "../scripts/HttpClientBase.js";
import SessionStorage from "../scripts/storage.js";

export default class FaqsCategories extends HttpClientBase {
    constructor() {
        super("http://localhost/projeto-pw-biogas/api");
    }

    async listAll() {
        return this.get("/faqs-categories/list");
    }

    async listById(id) {
        return this.get("/faqs-categories/list/:categoryId", { categoryId: id });
    }

    async insert(data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.postForm("/faqs-categories", data);
    }

    async update(id, data) {
        return this.put("/faqs-categories/:categoryId", data, { categoryId: id });
    }

    async remove(id) {
        return this.delete("/faqs-categories/:categoryId", { categoryId: id });
    }
}
