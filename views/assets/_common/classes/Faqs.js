import HttpClientBase from "../scripts/HttpClientBase.js";
import SessionStorage from "../scripts/storage.js";

export default class Faqs extends HttpClientBase {
    constructor() {
        super("http://localhost/projeto-pw-biogas/api");
    }

    async listAll() {
        return this.get("/faqs/list");
    }

    async listById(id) {
        return this.get("/faqs/list/:faqId", { faqId: id });
    }

    async listAdmin() {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.get("/faqs/admin/list");
    }

    async insert(data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.postForm("/faqs", data);
    }

    async update(id, data) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.putForm("/faqs/:faqId", data, { faqId: id });
    }

    async remove(id) {
        this.setAuthToken(new SessionStorage().getToken() || "");
        return this.delete("/faqs/:faqId", { faqId: id });
    }
}
