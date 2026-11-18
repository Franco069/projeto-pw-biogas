import Location from './Location.js';
import SimulationResult from './SimulationResult.js';

export default class Simulation {
    constructor(data = {}) {
        this.id = Number(data.id ?? 0);
        this.userId = Number(data.user_id ?? data.userId ?? 0);
        this.location = new Location(data);
        this.wasteTypeName = data.waste_type_name ?? '';
        this.wasteTypeId = Number(data.waste_type_id ?? 0);
        this.images = Array.isArray(data.images) ? data.images : [];
        this.peopleQuantity = Number(data.people_quantity ?? 0);
        this.dailyWasteKg = Number(data.daily_waste_kg ?? 0);
        this.glpConsumptionKg = Number(data.glp_consumption_kg ?? 0);
        this.glpMonthlyCost = Number(data.glp_monthly_cost ?? 0);
        this.implementationCost = Number(data.implementation_cost ?? 0);
        this.createdAt = data.created_at ?? '';
        this.result = new SimulationResult(data);
    }
}
