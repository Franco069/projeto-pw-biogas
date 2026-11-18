
import Simulations from "../../_common/classes/Simulations.js";
import Simulation from "../../_common/classes/Simulation.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Dashboard {
    constructor() {
        this.simulationsApi = new Simulations();
        this.simulations = [];
        this.toast = Object.create(Toast);
    }

    async render() {
        this.setLoading();

        try {
            await this.loadSimulations();

            this.renderSummary();
            this.renderActivity();
            this.renderInsights();
        } catch (error) {
            console.error(error);

            [
                "#dashboard-total-simulations",
                "#dashboard-average-energy",
                "#dashboard-total-savings"
            ].forEach((selector) => {
                const element = document.querySelector(selector);
                if (element) element.textContent = "—";
            });

            const activity = document.querySelector("#dashboard-activity");

            if (activity) {
                activity.textContent = error.message || "Falha ao carregar os dados do dashboard.";
            }

            this.toast.error(error.message || "Falha ao carregar o dashboard.");
        }
    }

    async loadSimulations() {
        const response = await this.simulationsApi.list();

        if (response?.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar as simulações.");
        }

        const data = response.data;

        this.simulations = (Array.isArray(data) ? data : [])
            .map((item) => new Simulation(item));
    }

    renderSummary() {
        const total = document.querySelector("#dashboard-total-simulations");
        const energy = document.querySelector("#dashboard-average-energy");
        const savings = document.querySelector("#dashboard-total-savings");

        if (total) {
            total.textContent = this.simulations.length;
        }

        if (energy) {
            const average = this.simulations.length
                ? this.simulations.reduce(
                    (sum, sim) => sum + sim.result.estimatedEnergyKwh, 0
                ) / this.simulations.length
                : 0;

            energy.textContent = this.number(average) + " kWh/dia";
        }

        if (savings) {
            const totalSavings = this.simulations.reduce(
                (sum, sim) => sum + sim.result.monthlySaving, 0
            );

            savings.textContent = this.currency(totalSavings);
        }
    }

    renderActivity() {
        const activity = document.querySelector("#dashboard-activity");

        if (!activity) return;

        if (!this.simulations.length) {
            activity.textContent = "Nenhuma simulação cadastrada. Crie uma simulação para acompanhar sua atividade.";
            return;
        }

        activity.innerHTML = `
            <ul class="report-list">
                ${this.simulations.slice(0, 4).map((sim) => `
                    <li class="report-item">
                        <section>
                            <h3>${this.escapeHtml(sim.location.name)}</h3>
                            <p>
                                ${this.escapeHtml(
                                    [sim.location.city, sim.location.state]
                                        .filter(Boolean).join(" / ")
                                )}
                                • ${this.date(sim.createdAt)}
                            </p>
                        </section>
                        <span class="pill">
                            ${this.currency(sim.result.monthlySaving)}/mês
                        </span>
                    </li>
                `).join("")}
            </ul>
        `;
    }

    renderInsights() {
        const recent = document.querySelector("#dashboard-top-waste");
        const bestEl = document.querySelector("#dashboard-best-scenario");

        if (recent) {
            recent.textContent = this.simulations.length
                ? `${this.simulations.length} simulação(ões) registrada(s); ${
                    this.simulations.filter((sim) => sim.wasteTypeName).length
                        ? "todas usam o resíduo cadastrado no sistema."
                        : "tipo de resíduo informado pelo cadastro do banco."
                }`
                : "Ainda não há simulações registradas.";
        }

        if (bestEl) {
            const best = this.simulations.reduce(
                (current, sim) =>
                    !current || sim.result.monthlySaving > current.result.monthlySaving
                        ? sim
                        : current,
                null
            );

            bestEl.textContent = best
                ? `${best.location.name} • ${this.currency(best.result.monthlySaving)}/mês`
                : "Sem dados para comparação.";
        }
    }

    setLoading() {
        [
            "#dashboard-total-simulations",
            "#dashboard-average-energy",
            "#dashboard-total-savings"
        ].forEach((selector) => {
            const element = document.querySelector(selector);
            if (element) element.textContent = "Carregando dados…";
        });
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
