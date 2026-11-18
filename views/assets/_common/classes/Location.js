export default class Location {
    constructor(data = {}) {
        this.id = Number(data.location_id ?? data.id ?? 0);
        this.name = data.location_name ?? data.name ?? '';
        this.type = data.location_type ?? data.type ?? '';
        this.city = data.city ?? '';
        this.state = data.state ?? '';
    }
}
