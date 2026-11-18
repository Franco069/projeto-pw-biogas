import SystemParameters from "../../_common/classes/SystemParameters.js";
import SystemParameter from "../../_common/classes/SystemParameter.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Params {
    constructor() {
        this.parametersApi = new SystemParameters();
        this.formController = Object.create(FormController);
        this.toast = Object.create(Toast);
        this.parameters = [];
    }

    async init() {
        document.querySelector("#params-list")?.addEventListener("submit", (event) => this.submit(event));
        try {
            const response = await this.parametersApi.list();
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar os parâmetros.");
            this.parameters = (Array.isArray(response.data) ? response.data : [])
                .filter((item) => item.name !== "biogas_yield")
                .map((item) => new SystemParameter(item));
            this.render();
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    render() {
        document.querySelector("#params-list").innerHTML = this.parameters.length ? this.parameters.map((parameter) => `
            <form class="form-grid admin-card" data-id="${parameter.id}">
                <h3>${this.escapeHtml(parameter.description)}</h3>
                <input type="hidden" name="name" value="${this.escapeHtml(parameter.name)}">
                <input type="hidden" name="unit" value="${this.escapeHtml(parameter.unit)}">
                <input type="hidden" name="description" value="${this.escapeHtml(parameter.description)}">
                <label>Valor (${this.escapeHtml(parameter.unit)})
                    <input name="value" type="number" step="0.0001" min="0.0001" max="999999.9999" required value="${parameter.value}">
                </label>
                <footer class="form-actions"><button type="submit" class="btn btn-primary">Salvar parâmetro</button></footer>
                <aside class="admin-message hidden" aria-live="polite"></aside>
            </form>`).join("") : "Nenhum parâmetro ativo cadastrado.";
    }

    async submit(event) {
        event.preventDefault();
        const form = event.target;
        const button = form.querySelector('[type="submit"]');
        const feedback = form.querySelector("aside");
        this.formController.init(form);
        const data = this.formController.serialize();
        button.disabled = true;
        feedback.className = "admin-message hidden";
        try {
            const response = await this.parametersApi.update(form.dataset.id, data);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível salvar o parâmetro.");
            const parameter = this.parameters.find((item) => item.id === Number(form.dataset.id));
            parameter.value = Number(data.value);
            feedback.textContent = response.message;
            feedback.className = "admin-message success";
            this.toast.success(response.message);
        } catch (error) {
            feedback.textContent = error.message;
            feedback.className = "admin-message error";
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
}
