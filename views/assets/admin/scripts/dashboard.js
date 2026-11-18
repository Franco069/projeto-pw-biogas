import Users from "../../_common/classes/Users.js";
import WasteTypes from "../../_common/classes/WasteTypes.js";
import Faqs from "../../_common/classes/Faqs.js";
import Simulations from "../../_common/classes/Simulations.js";
import Reports from "../../_common/classes/Reports.js";
import SystemParameters from "../../_common/classes/SystemParameters.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Dashboard {
    constructor() {
        this.usersApi = new Users();
        this.wastesApi = new WasteTypes();
        this.faqsApi = new Faqs();
        this.simulationsApi = new Simulations();
        this.reportsApi = new Reports();
        this.parametersApi = new SystemParameters();
        this.toast = Object.create(Toast);
    }

    async render() {
        try {
            const responses = await Promise.all([
                this.usersApi.listManaged(2), this.usersApi.listManaged(1), this.wastesApi.list(),
                this.faqsApi.listAdmin(), this.simulationsApi.listAdmin(), this.reportsApi.listAdmin(), this.parametersApi.list()
            ]);
            for (const response of responses) {
                if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar o painel.");
            }
            const [users, admins, wastes, faqs, simulations, reports, parameters] = responses.map((response) => Array.isArray(response.data) ? response.data : []);
            const published = faqs.filter((faq) => Number(faq.active) === 1).length;
            const ratio = faqs.length ? Math.round(published / faqs.length * 100) : 0;
            this.setText("#admin-total-users", users.length);
            this.setText("#admin-total-admins", admins.length);
            this.setText("#admin-total-wastes", wastes.length);
            this.setText("#admin-total-published-faqs", published);
            this.setText("#admin-overview-published", published);
            this.setText("#admin-overview-wastes", wastes.length);
            this.setText("#admin-overview-admins", admins.length);
            this.setText("#admin-overview-parameters", `${parameters.filter((parameter) => parameter.name !== "biogas_yield").length} parâmetros`);
            const wasteParameter = parameters.find((parameter) => parameter.name === "waste_per_person");
            this.setText("#admin-overview-yield", wasteParameter
                ? `Resíduo por pessoa: ${Number(wasteParameter.value).toLocaleString("pt-BR")} ${wasteParameter.unit}` : "Resíduo por pessoa não configurado");
            this.setText("#admin-faq-ratio", `${ratio}%`);
            this.setText("#admin-published-faqs-count", published);
            this.setText("#admin-draft-faqs-count", faqs.length - published);
            this.setText("#admin-donut-wastes-count", wastes.length);
            document.querySelector("#admin-donut-faqs").className = `admin-donut ratio-${Math.round(ratio / 10)}`;
            const counts = { users: users.length, admins: admins.length, wastes: wastes.length, faqs: faqs.length };
            const maximum = Math.max(...Object.values(counts), 1);
            for (const [key, count] of Object.entries(counts)) {
                this.setText(`#admin-column-${key}-value`, count);
                document.querySelector(`#admin-column-${key}`).dataset.level = count ? Math.max(1, Math.round(count / maximum * 10)) : 0;
            }
            const activities = [
                ...users.map((item) => ({ text: `Usuário: ${item.name}`, date: item.updated_at || item.created_at })),
                ...admins.map((item) => ({ text: `Administrador: ${item.name}`, date: item.updated_at || item.created_at })),
                ...wastes.map((item) => ({ text: `Resíduo: ${item.name}`, date: item.updated_at || item.created_at })),
                ...faqs.map((item) => ({ text: `FAQ: ${item.question}`, date: item.created_at })),
                ...simulations.map((item) => ({ text: `Simulação: ${item.location_name}`, date: item.created_at })),
                ...reports.map((item) => ({ text: `Relatório: ${item.title}`, date: item.generated_at })),
                ...parameters.map((item) => ({ text: `Parâmetro: ${item.description}`, date: item.updated_at || item.created_at }))
            ].filter((item) => item.date).sort((left, right) => new Date(right.date.replace(" ", "T")) - new Date(left.date.replace(" ", "T")));
            this.setText("#admin-overview-timestamp", activities.length ? `Atualizado em ${this.date(activities[0].date)}` : "Sem atualizações recentes.");
            document.querySelector("#admin-recent-activity").innerHTML = activities.length ? `
                <ul class="admin-report-list">${activities.slice(0, 5).map((item) => `
                    <li class="admin-report-item"><p>${this.escapeHtml(item.text)}</p><time>${this.date(item.date)}</time></li>
                `).join("")}</ul>` : "Nenhuma movimentação recente.";
        } catch (error) {
            document.querySelector("#admin-recent-activity").textContent = error.message;
            this.toast.error(error.message);
        }
    }

    setText(selector, value) { const element = document.querySelector(selector); if (element) element.textContent = value; }
    date(value) { return value ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR") : "—"; }
    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
}
