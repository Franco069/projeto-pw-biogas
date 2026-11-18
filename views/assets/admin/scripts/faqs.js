import Faqs from "../../_common/classes/Faqs.js";
import FaqsCategories from "../../_common/classes/FaqsCategories.js";
import Faq from "../../_common/classes/Faq.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";

export default class FaqsPage {
    constructor() {
        this.faqsApi = new Faqs();
        this.categoriesApi = new FaqsCategories();
        this.formController = Object.create(FormController);
        this.toast = Object.create(Toast);
        this.faqs = [];
    }

    async init() {
        document.querySelector("#create-faq")?.addEventListener("click", () => this.openForm());
        document.querySelector("#faqs-body")?.addEventListener("click", (event) => this.handleAction(event));
        document.querySelector("#faq-form")?.addEventListener("submit", (event) => this.submit(event));
        document.querySelector("#faq-category-form")?.addEventListener("submit", (event) => this.createCategory(event));
        try {
            await Promise.all([this.loadFaqs(), this.loadCategories()]);
            this.render();
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    async loadFaqs() {
        const response = await this.faqsApi.listAdmin();
        if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar as FAQs.");
        this.faqs = (Array.isArray(response.data) ? response.data : []).map((item) => {
            const faq = new Faq({ ...item, faqsCategoryId: item.faqs_category_id });
            faq.createdAt = item.created_at;
            return faq;
        });
    }

    async loadCategories() {
        const response = await this.categoriesApi.listAll();
        if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar as categorias.");
        const categories = (Array.isArray(response.data) ? response.data : []).filter((item) => Number(item.active) === 1);
        document.querySelector("#faq-category").innerHTML = categories.length
            ? categories.map((category) => `<option value="${Number(category.id)}">${this.escapeHtml(category.name)}</option>`).join("")
            : '<option value="">Nenhuma categoria ativa cadastrada</option>';
    }

    async createCategory(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector('[type="submit"]');
        this.formController.init(form);
        const data = this.formController.serialize();
        button.disabled = true;
        try {
            const response = await this.categoriesApi.insert(data);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível criar a categoria.");
            await this.loadCategories();
            form.reset();
            this.toast.success(response.message);
        } catch (error) {
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    render() {
        document.querySelector("#faqs-body").innerHTML = this.faqs.length ? this.faqs.map((faq) => `
            <tr>
                <td>${this.escapeHtml(faq.question)}</td>
                <td>${this.escapeHtml(faq.answer)}</td>
                <td><span class="tag ${faq.active ? "tag-success" : ""}">${faq.active ? "Publicado" : "Rascunho"}</span></td>
                <td>${this.date(faq.createdAt)}</td>
                <td><nav class="management-actions">
                    <button data-id="${faq.id}" class="btn btn-secondary btn-small view">Ver</button>
                    <button data-id="${faq.id}" class="btn btn-secondary btn-small edit">Editar</button>
                    <button data-id="${faq.id}" class="btn btn-secondary btn-small toggle">${faq.active ? "Despublicar" : "Publicar"}</button>
                    <button data-id="${faq.id}" class="btn btn-secondary btn-small remove">Excluir</button>
                </nav></td>
            </tr>`).join("") : '<tr><td colspan="5">Nenhuma FAQ cadastrada.</td></tr>';
    }

    openForm(faq = null) {
        const form = document.querySelector("#faq-form");
        form.reset();
        form.dataset.id = faq?.id || "";
        form.elements.namedItem("question").value = faq?.question || "";
        form.elements.namedItem("answer").value = faq?.answer || "";
        if (faq) form.elements.namedItem("faqs_category_id").value = faq.faqsCategoryId;
        document.querySelector("#faq-published").checked = faq ? Boolean(faq.active) : true;
        document.querySelector("#faq-modal-title").textContent = faq ? "Editar FAQ" : "Criar FAQ";
        document.querySelector("#faq-modal").classList.remove("hidden");
    }

    renderDetails(faq) {
        if (!faq) return;
        document.querySelector("#faq-details").innerHTML = `<h3>${this.escapeHtml(faq.question)}</h3>
            <p>${this.escapeHtml(faq.answer)}</p><p><strong>Status:</strong> ${faq.active ? "Publicado" : "Rascunho"}</p>`;
    }

    async handleAction(event) {
        const button = event.target.closest("button[data-id]");
        if (!button) return;
        const faq = this.faqs.find((item) => item.id === Number(button.dataset.id));
        if (!faq) return;
        if (button.classList.contains("view")) this.renderDetails(faq);
        if (button.classList.contains("edit")) this.openForm(faq);
        const remove = button.classList.contains("remove");
        const toggle = button.classList.contains("toggle");
        if ((!remove && !toggle) || (remove && !window.confirm("Excluir esta FAQ?"))) return;
        button.disabled = true;
        try {
            const response = remove ? await this.faqsApi.remove(faq.id) : await this.faqsApi.update(faq.id, {
                question: faq.question, answer: faq.answer, faqs_category_id: faq.faqsCategoryId, active: faq.active ? 0 : 1
            });
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível alterar a FAQ.");
            await this.loadFaqs();
            this.render();
            document.querySelector("#faq-details").textContent = "Selecione uma FAQ para ver detalhes.";
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
        data.active = document.querySelector("#faq-published").checked ? 1 : 0;
        button.disabled = true;
        try {
            const response = form.dataset.id
                ? await this.faqsApi.update(form.dataset.id, data) : await this.faqsApi.insert(data);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível salvar a FAQ.");
            document.querySelector("#faq-modal").classList.add("hidden");
            await this.loadFaqs();
            this.render();
            this.renderDetails(this.faqs.find((item) => item.id === Number(response.data?.id)));
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
