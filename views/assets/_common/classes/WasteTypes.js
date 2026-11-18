import HttpClientBase from "../scripts/HttpClientBase.js";
import SessionStorage from "../scripts/storage.js";

export default class WasteTypes extends HttpClientBase {
    constructor() {
        super("http://localhost/projeto-pw-biogas/api");
        this.setAuthToken(new SessionStorage().getToken() || "");
    }

    list() { return this.get("/waste-types/list"); }
    create(data) { return this.postForm("/waste-types/", data); }
    update(id, data) { return this.putForm("/waste-types/:waste_type_id", data, { waste_type_id: id }); }
    remove(id) { return this.delete("/waste-types/:waste_type_id", { waste_type_id: id }); }
}
