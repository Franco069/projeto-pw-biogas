export default class Report {
    constructor(data = {}) {
        this.id = Number(data.id ?? 0);
        this.simulationId = Number(data.simulation_id ?? 0);
        this.title = data.title ?? '';
        this.generatedAt = data.generated_at ?? '';
        this.locationName = data.location_name ?? '';
    }
}
