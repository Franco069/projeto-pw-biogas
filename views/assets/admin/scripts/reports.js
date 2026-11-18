import Users from "../../_common/classes/Users.js";
import Simulations from "../../_common/classes/Simulations.js";
import Simulation from "../../_common/classes/Simulation.js";
import Reports from "../../_common/classes/Reports.js";
import Report from "../../_common/classes/Report.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class AdminReports {
    constructor() {
        this.usersApi = new Users();
        this.simulationsApi = new Simulations();
        this.reportsApi = new Reports();
        this.toast = Object.create(Toast);
    }

    init() {
        document.querySelector("#admin-report-form")?.addEventListener("submit", (event) => this.generate(event));
    }

    async generate(event) {
        event.preventDefault();
        const button = event.currentTarget.querySelector('[type="submit"]');
        button.disabled = true;
        try {
            const responses = await Promise.all([
                this.usersApi.listManaged(2), this.simulationsApi.listAdmin(), this.reportsApi.listAdmin()
            ]);
            for (const response of responses) {
                if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar os relatórios.");
            }
            const limit = new Date();
            limit.setDate(limit.getDate() - Number(document.querySelector("#admin-report-period").value));
            const inPeriod = (value) => value && new Date(value.replace(" ", "T")) >= limit;
            const users = (responses[0].data || []).filter((item) => inPeriod(item.created_at));
            const simulations = (responses[1].data || []).map((item) => new Simulation(item)).filter((item) => inPeriod(item.createdAt));
            const reports = (responses[2].data || []).map((item) => new Report(item)).filter((item) => inPeriod(item.generatedAt));
            const savings = simulations.reduce((total, item) => total + item.result.monthlySaving, 0);
            document.querySelector("#admin-report-results").innerHTML = `
                <h3>Relatórios Gerados</h3>
                <section class="admin-report-list">
                    <article class="admin-report-item"><h4>Resumo do período</h4>
                        <p>Novos usuários: ${users.length}</p><p>Novas simulações: ${simulations.length}</p>
                        <p>Relatórios criados: ${reports.length}</p><p>Economia mensal somada: ${this.currency(savings)}</p>
                    </article>
                    ${reports.map((report) => `<article class="admin-report-item">
                        <h4>${this.escapeHtml(report.title)}</h4><p>${this.escapeHtml(report.locationName)}</p>
                        <p>Gerado em ${this.date(report.generatedAt)}</p></article>`).join("")}
                </section>`;
        } catch (error) {
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    currency(value) { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
    date(value) { return value ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR") : "—"; }
    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
}
