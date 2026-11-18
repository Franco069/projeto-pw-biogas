
import HttpClientBase from "../scripts/HttpClientBase.js";
import SessionStorage from "../scripts/storage.js";

export default class LocationImages extends HttpClientBase {
    constructor() {
        super("http://localhost/projeto-pw-biogas/api");
        this.setAuthToken(new SessionStorage().getToken() || "");
    }

    async listAll(locationId) {
        return this.get("/locations/:location_id/images", {
            location_id: locationId
        });
    }

    async insert(locationId, file) {
        const formData = new FormData();
        formData.append("image", file);

        return this.postForm("/locations/:location_id/images", formData, {
            location_id: locationId
        });
    }

    async remove(locationId, imageId) {
        return this.delete("/locations/:location_id/images/:image_id", {
            location_id: locationId,
            image_id: imageId
        });
    }
}
