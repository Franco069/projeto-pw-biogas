import WasteTypes from "../../_common/classes/WasteTypes.js";
import WasteType from "../../_common/classes/WasteType.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class Wastes {
    constructor() {
        this.wastesApi = new WasteTypes();
        this.formController = Object.create(FormController);
        this.toast = Object.create(Toast);
        this.wastes = [];
    }

    async init() {
        document.querySelector("#create-waste")?.addEventListener("click", () => this.openForm());
        document.querySelector("#wastes-body")?.addEventListener("click", (event) => this.handleAction(event));
        document.querySelector("#waste-form")?.addEventListener("submit", (event) => this.submit(event));
        try {
            await this.loadWastes();
            this.render();
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    async loadWastes() {
        const response = await this.wastesApi.list();
        if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar os resíduos.");
        this.wastes = (Array.isArray(response.data) ? response.data : []).map((item) => {
            const waste = new WasteType({ ...item, estimatedYield: item.estimated_yield });
            waste.createdAt = item.created_at;
            return waste;
        });
    }

    render() {
        document.querySelector("#wastes-body").innerHTML = this.wastes.length ? this.wastes.map((waste) => `
            <tr>
                <td>${this.escapeHtml(waste.name)}</td>
                <td>${this.escapeHtml(waste.description)}</td>
                <td>${waste.estimatedYield.toLocaleString("pt-BR")} m³/kg</td>
                <td>${this.date(waste.createdAt)}</td>
                <td><nav class="management-actions">
                    <button data-id="${waste.id}" class="btn btn-secondary btn-small view">Ver</button>
                    <button data-id="${waste.id}" class="btn btn-secondary btn-small edit">Editar</button>
                    <button data-id="${waste.id}" class="btn btn-secondary btn-small remove">Excluir</button>
                </nav></td>
            </tr>`).join("") : '<tr><td colspan="5">Nenhum resíduo cadastrado.</td></tr>';
    }

    openForm(waste = null) {
        const form = document.querySelector("#waste-form");
        form.reset();
        form.dataset.id = waste?.id || "";
        form.elements.namedItem("name").value = waste?.name || "";
        form.elements.namedItem("description").value = waste?.description || "";
        form.elements.namedItem("estimated_yield").value = waste?.estimatedYield ?? "";
        document.querySelector("#waste-modal-title").textContent = waste ? "Editar Resíduo" : "Criar Resíduo";
        document.querySelector("#waste-modal").classList.remove("hidden");
    }

    renderDetails(waste) {
        if (!waste) return;
        document.querySelector("#waste-details").innerHTML = `
            <h3>${this.escapeHtml(waste.name)}</h3>
            <p>${this.escapeHtml(waste.description)}</p>
            <p><strong>Rendimento estimado:</strong> ${waste.estimatedYield.toLocaleString("pt-BR")} m³/kg</p>
            <p><strong>Criado em:</strong> ${this.date(waste.createdAt)}</p>`;
    }

    async handleAction(event) {
        const button = event.target.closest("button[data-id]");
        if (!button) return;
        const waste = this.wastes.find((item) => item.id === Number(button.dataset.id));
        if (!waste) return;
        if (button.classList.contains("view")) this.renderDetails(waste);
        if (button.classList.contains("edit")) this.openForm(waste);
        if (!button.classList.contains("remove") || !window.confirm("Excluir este resíduo?")) return;
        button.disabled = true;
        try {
            const response = await this.wastesApi.remove(waste.id);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível excluir o resíduo.");
            await this.loadWastes();
            this.render();
            document.querySelector("#waste-details").textContent = "Selecione um resíduo para ver detalhes.";
            this.toast.success(response.message);
        } catch (error) {
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    async submit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('[type="submit"]');
        this.formController.init(form);
        const data = this.formController.serialize();
        button.disabled = true;
        try {
            const response = form.dataset.id
                ? await this.wastesApi.update(form.dataset.id, data)
                : await this.wastesApi.create(data);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível salvar o resíduo.");
            document.querySelector("#waste-modal").classList.add("hidden");
            await this.loadWastes();
            this.render();
            this.renderDetails(this.wastes.find((item) => item.id === Number(response.data?.id)));
            this.toast.success(response.message);
        } catch (error) {
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    date(value) { return value ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR") : "—"; }
    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
}
