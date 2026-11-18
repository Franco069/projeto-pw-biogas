
import Simulations from "../../_common/classes/Simulations.js";
import SystemParameters from "../../_common/classes/SystemParameters.js";
import Simulation from "../../_common/classes/Simulation.js";
import SystemParameter from "../../_common/classes/SystemParameter.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Compare {
    constructor() {
        this.simulationsApi = new Simulations();
        this.parametersApi = new SystemParameters();
        this.toast = Object.create(Toast);
        this.simulations = [];
        this.parameters = [];
    }

    async init() {
        const builder = document.querySelector("#compare-builder");

        if (!builder) return;

        try {
            await Promise.all([
                this.loadSimulations(),
                this.loadParameters()
            ]);

            this.renderCompare();
        } catch (error) {
            console.error(error);
            this.toast.error(error.message || "Falha ao carregar os dados.");
        }
    }

    async loadSimulations() {
        const response = await this.simulationsApi.list();

        if (response?.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar as simulações.");
        }

        this.simulations = (Array.isArray(response.data) ? response.data : [])
            .map((item) => new Simulation(item));
    }

    async loadParameters() {
        const response = await this.parametersApi.list();

        if (response?.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar os parâmetros.");
        }

        this.parameters = (Array.isArray(response.data) ? response.data : [])
            .map((item) => new SystemParameter(item));
    }

    equivalentGlp(simulation) {
        const parameter = this.parameters.find(
            (item) => item.name === "glp_energy_conversion"
        );

        const conversion = Number(parameter?.value);

        if (!conversion) {
            return { daily: null, monthly: null };
        }

        const daily = simulation.result.estimatedEnergyKwh / conversion;

        return {
            daily,
            monthly: daily * 30
        };
    }

    renderCompare() {
        const builder = document.querySelector("#compare-builder");
        const output = document.querySelector("#compare-output");

        if (!builder || !output) return;

        if (this.simulations.length < 2) {
            builder.textContent = "Salve pelo menos duas simulações para comparar os cenários.";
            output.innerHTML = `
                <h3>Resultado da Comparação</h3>
                <p>Os dados aparecerão quando houver duas simulações.</p>
            `;
            return;
        }

        builder.innerHTML = `
            <form id="compare-form" class="comparison-form">
                <section class="comparison-options">
                    ${this.simulations.map((sim) => `
                        <label>
                            <input type="checkbox" name="compare-id" value="${sim.id}">
                            <span>
                                ${this.escapeHtml(sim.location.name)}
                                • ${this.escapeHtml(sim.wasteTypeName)}
                                • ${this.date(sim.createdAt)}
                            </span>
                        </label>
                    `).join("")}
                </section>

                <button type="submit" class="btn btn-primary">
                    Comparar Selecionadas
                </button>
            </form>
        `;

        builder.querySelectorAll('input[name="compare-id"]').forEach((input) => {
            input.addEventListener("change", () => {
                if (builder.querySelectorAll("input:checked").length > 3) {
                    input.checked = false;
                    this.toast.warning("Selecione no máximo três simulações.");
                }
            });
        });

        document.querySelector("#compare-form").addEventListener("submit", (event) => {
            this.submitCompare(event);
        });
    }

    submitCompare(event) {
        event.preventDefault();

        const builder = document.querySelector("#compare-builder");
        const output = document.querySelector("#compare-output");

        const ids = [...builder.querySelectorAll("input:checked")]
            .map((item) => Number(item.value));

        if (ids.length < 2) {
            this.toast.warning("Selecione pelo menos duas simulações.");
            return;
        }

        const chosen = this.simulations.filter((sim) => ids.includes(sim.id));

        const rows = [
            ["Tipo de resíduo", (sim) => this.escapeHtml(sim.wasteTypeName || "Não informado")],
            ["Pessoas", (sim) => this.number(sim.peopleQuantity, 0)],

            ["Resíduos", (sim) =>
                `${this.number(sim.dailyWasteKg)} kg/dia`],

            ["Biogás", (sim) =>
                `${this.number(sim.result.estimatedBiogasM3)} m³/dia`],

            ["Energia", (sim) =>
                `${this.number(sim.result.estimatedEnergyKwh)} kWh/dia`],

            ["GLP equivalente", (sim) => {
                const amount = this.equivalentGlp(sim).monthly;

                return amount === null
                    ? "—"
                    : `${this.number(Math.min(amount, sim.glpConsumptionKg))} kg/mês`;
            }],

            ["Consumo atual de GLP", (sim) =>
                `${this.number(sim.glpConsumptionKg)} kg/mês`],

            ["Economia mensal", (sim) =>
                this.currency(sim.result.monthlySaving)],

            ["Economia anual", (sim) =>
                this.currency(sim.result.annualSaving)],

            ["Payback", (sim) =>
                sim.result.paybackMonths === null
                    ? "Indeterminado"
                    : `${this.number(sim.result.paybackMonths)} meses`]
        ];

        output.innerHTML = `
            <h3>Resultado da Comparação</h3>

            <section class="comparison-table">
                <table>
                    <thead>
                        <tr>
                            <th>Indicador</th>
                            ${chosen.map((sim) => `
                                <th>${this.escapeHtml(sim.location.name)}</th>
                            `).join("")}
                        </tr>
                    </thead>

                    <tbody>
                        ${rows.map(([label, formatter]) => `
                            <tr>
                                <th>${label}</th>
                                ${chosen.map((sim) => `
                                    <td>${formatter(sim)}</td>
                                `).join("")}
                            </tr>
                        `).join("")}
                        <tr>
                            <th>Fotos</th>
                            ${chosen.map((sim) => `<td><div class="simulation-photo-gallery">
                                ${sim.images.length ? sim.images.map((image) => `
                                    <img class="simulation-photo" src="${this.escapeHtml(image.image_url)}" alt="${this.escapeHtml(image.alt_text || `Foto de ${sim.location.name}`)}">
                                `).join("") : "Sem fotos."}
                            </div></td>`).join("")}
                        </tr>
                    </tbody>
                </table>
            </section>
        `;
    }

    number(value, digits = 2) {
        return Number(value || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    }

    currency(value) {
        return Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    date(value) {
        return value
            ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR")
            : "—";
    }

    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char]));
    }
}
