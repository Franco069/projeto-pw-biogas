export default class SimulationResult {
    constructor(data = {}) {
        this.estimatedBiogasM3 = Number(data.estimated_biogas_m3 ?? data.estimatedBiogasM3 ?? 0);
        this.estimatedEnergyKwh = Number(data.estimated_energy_kwh ?? data.estimatedEnergyKwh ?? 0);
        this.monthlySaving = Number(data.monthly_saving ?? data.monthlySaving ?? 0);
        this.annualSaving = Number(data.annual_saving ?? data.annualSaving ?? 0);
        this.paybackMonths = data.payback_months == null && data.paybackMonths == null ? null : Number(data.payback_months ?? data.paybackMonths);
    }
}
