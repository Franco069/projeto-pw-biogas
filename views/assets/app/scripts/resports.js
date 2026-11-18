
import Simulations from "../../_common/classes/Simulations.js";
import SystemParameters from "../../_common/classes/SystemParameters.js";
import ReportsApi from "../../_common/classes/Reports.js";
import Simulation from "../../_common/classes/Simulation.js";
import SystemParameter from "../../_common/classes/SystemParameter.js";
import Report from "../../_common/classes/Report.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Reports {
    constructor() {
        this.simulationsApi = new Simulations();
        this.parametersApi = new SystemParameters();
        this.reportsApi = new ReportsApi();
        this.toast = Object.create(Toast);

        this.simulations = [];
        this.parameters = [];
        this.reportOpener = null;
    }

    async init() {
        const container = document.querySelector("#app-report-list");
        const preview = document.querySelector("#app-report-preview");

        if (!container) return;

        container.addEventListener("click", async (event) => {
            const button = event.target.closest("button");

            if (!button) return;

            if (button.classList.contains("generate-report")) {
                this.reportOpener = button;
                await this.generateReport(button.dataset.id);
            }

            if (button.classList.contains("open-report")) {
                this.reportOpener = button;

                const sim = this.simulations.find(
                    (item) => item.id === Number(button.dataset.simulationId)
                );

                if (sim) {
                    this.renderReportPreview(sim);
                } else {
                    this.toast.error("Simulação deste relatório não encontrada.");
                }
            }
        });

        preview?.addEventListener("click", (event) => {
            if (event.target === event.currentTarget) {
                this.closeReportPreview();
            }
        });

        preview?.addEventListener("close", () => {
            if (this.reportOpener?.isConnected) {
                this.reportOpener.focus();
            }
        });

        try {
            await Promise.all([
                this.loadSimulations(),
                this.loadParameters()
            ]);

            await this.loadReports();
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

    async loadReports() {
        const container = document.querySelector("#app-report-list");

        if (!container) return;

        container.textContent = "Carregando dados…";

        try {
            const response = await this.reportsApi.list();

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível carregar os relatórios.");
            }

            const reports = (Array.isArray(response.data) ? response.data : [])
                .map((item) => new Report(item));

            const reportedIds = new Set(
                reports.map((report) => Number(report.simulationId))
            );

            const availableSimulations = this.simulations.filter(
                (sim) => !reportedIds.has(Number(sim.id))
            );

            const reportItems = reports.map((report) => `
                <article class="report-item">
                    <section>
                        <h4>${this.escapeHtml(report.title)}</h4>
                        <p>
                            ${this.escapeHtml(report.locationName)}
                            • ${this.date(report.generatedAt)}
                        </p>
                    </section>

                    <button
                        type="button"
                        data-simulation-id="${report.simulationId}"
                        class="btn btn-secondary open-report">
                        Abrir relatório
                    </button>
                </article>
            `).join("");

            const simulationItems = availableSimulations.map((sim) => `
                <article class="report-item">
                    <section>
                        <h4>${this.escapeHtml(sim.location.name)}</h4>
                        <p>
                            ${this.currency(sim.result.monthlySaving)}/mês
                            • ${this.date(sim.createdAt)}
                        </p>
                    </section>

                    <button
                        type="button"
                        data-id="${sim.id}"
                        class="btn btn-primary generate-report">
                        Gerar relatório
                    </button>
                </article>
            `).join("");

            const noSimulationMessage = this.simulations.length
                ? "Todas as simulações já têm um relatório."
                : "Nenhuma simulação salva para gerar relatório.";

            container.innerHTML = `
                <section class="report-group" aria-labelledby="generated-reports-title">
                    <h3 id="generated-reports-title">Relatórios gerados</h3>

                    ${reportItems
                        ? `<section class="report-list">${reportItems}</section>`
                        : "<p>Nenhum relatório gerado ainda.</p>"}
                </section>

                <section class="report-group" aria-labelledby="available-simulations-title">
                    <h3 id="available-simulations-title">
                        Simulações disponíveis para gerar relatório
                    </h3>

                    ${simulationItems
                        ? `<section class="report-list">${simulationItems}</section>`
                        : `<p>${noSimulationMessage}</p>`}
                </section>
            `;
        } catch (error) {
            console.error(error);
            container.textContent = error.message || "Falha ao carregar relatórios.";
            this.toast.error(error.message || "Falha ao carregar relatórios.");
        }
    }

    async generateReport(id) {
        const sim = this.simulations.find(
            (item) => item.id === Number(id)
        );

        if (!sim) {
            this.toast.error("Não foi possível localizar a simulação.");
            return;
        }

        try {
            const response = await this.reportsApi.create({
                simulation_id: sim.id,
                title: `Relatório de ${sim.location.name}`
            });

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível registrar o relatório.");
            }

            await this.loadReports();

            this.reportOpener = document.querySelector(
                `#app-report-list .open-report[data-simulation-id="${sim.id}"]`
            );

            this.renderReportPreview(sim);

            this.toast.success(response.message || "Relatório gerado.");
        } catch (error) {
            console.error(error);
            this.toast.error(error.message || "Falha ao gerar o relatório.");
        }
    }

    renderReportPreview(sim) {
        const preview = document.querySelector("#app-report-preview");

        if (!preview) return;

        const glp = this.equivalentGlp(sim);

        const replaced = glp.monthly === null
            ? null
            : Math.min(glp.monthly, sim.glpConsumptionKg);

        const paramHtml = this.parameters.map((item) => `
            <dt>${this.escapeHtml(item.description || item.name)}</dt>
            <dd>
                ${this.number(item.value, 4)}
                ${this.escapeHtml(item.unit)}
            </dd>
        `).join("");

        preview.innerHTML = `
            <section class="report-modal-content">
                <header class="report-modal-header">
                    <h2 id="report-modal-title">
                        Relatório — ${this.escapeHtml(sim.location.name)}
                    </h2>

                    <div class="report-modal-actions">
                        <button type="button" id="print-report" class="btn btn-secondary">
                            Imprimir
                        </button>

                        <button type="button" id="close-report" class="btn btn-primary">
                            Fechar
                        </button>
                    </div>
                </header>

                <section class="report-preview" id="printable-report">
                    <article>
                        <h3>${this.escapeHtml(sim.location.name)}</h3>

                        <h5>Dados do local</h5>
                        <p>
                            ${this.escapeHtml([
                                sim.location.type,
                                sim.location.city,
                                sim.location.state
                            ].filter(Boolean).join(" • "))}
                        </p>

                        <h5>Entradas</h5>
                        <dl>
                            <dt>Quantidade de pessoas</dt>
                            <dd>${this.number(sim.peopleQuantity, 0)}</dd>

                            <dt>Consumo mensal de GLP</dt>
                            <dd>${this.number(sim.glpConsumptionKg)} kg</dd>

                            <dt>Custo mensal atual de GLP</dt>
                            <dd>${this.currency(sim.glpMonthlyCost)}</dd>

                            <dt>Custo de implantação</dt>
                            <dd>${this.currency(sim.implementationCost)}</dd>
                        </dl>

                        <h5>Parâmetros do sistema</h5>
                        <dl>
                            ${paramHtml || "<dd>Parâmetros indisponíveis.</dd>"}
                        </dl>

                        <h5>Resultados</h5>
                        <dl>
                            <dt>Resíduos</dt>
                            <dd>${this.number(sim.dailyWasteKg)} kg/dia</dd>

                            <dt>Biogás</dt>
                            <dd>${this.number(sim.result.estimatedBiogasM3)} m³/dia</dd>

                            <dt>Energia</dt>
                            <dd>${this.number(sim.result.estimatedEnergyKwh)} kWh/dia</dd>

                            <dt>GLP equivalente diário</dt>
                            <dd>
                                ${glp.daily === null
                                    ? "—"
                                    : `${this.number(glp.daily)} kg/dia`}
                            </dd>

                            <dt>GLP equivalente mensal</dt>
                            <dd>
                                ${glp.monthly === null
                                    ? "—"
                                    : `${this.number(glp.monthly)} kg/mês`}
                            </dd>

                            <dt>GLP substituível</dt>
                            <dd>
                                ${replaced === null
                                    ? "—"
                                    : `${this.number(replaced)} kg/mês`}
                            </dd>

                            <dt>Economia mensal</dt>
                            <dd>${this.currency(sim.result.monthlySaving)}</dd>

                            <dt>Economia anual</dt>
                            <dd>${this.currency(sim.result.annualSaving)}</dd>

                            <dt>Payback</dt>
                            <dd>
                                ${sim.result.paybackMonths === null
                                    ? "Indeterminado"
                                    : `${this.number(sim.result.paybackMonths)} meses`}
                            </dd>
                        </dl>

                        <h5>Comparação</h5>
                        <p>
                            Consumo atual de GLP:
                            ${this.number(sim.glpConsumptionKg)} kg/mês.
                            Potencial de substituição por biogás:
                            ${replaced === null
                                ? "—"
                                : `${this.number(replaced)} kg/mês`}.
                        </p>

                        <p>
                            Custo atual mensal:
                            ${this.currency(sim.glpMonthlyCost)}.
                            Economia mensal estimada:
                            ${this.currency(sim.result.monthlySaving)}.
                        </p>
                    </article>
                </section>
            </section>
        `;

        if (!preview.open) {
            preview.showModal();
        }

        document.querySelector("#close-report").focus();

        document.querySelector("#close-report")
            .addEventListener("click", () => this.closeReportPreview(), { once: true });

        document.querySelector("#print-report")
            .addEventListener("click", () => window.print());
    }

    closeReportPreview() {
        const preview = document.querySelector("#app-report-preview");

        if (preview?.open) {
            preview.close();
        }
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
