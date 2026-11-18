import Users from "../../_common/classes/Users.js";
import User from "../../_common/classes/User.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";
import SessionStorage from "../../_common/scripts/storage.js";

export default class UsersPage {
    constructor(typeId = 2) {
        this.typeId = typeId;
        this.prefix = typeId === 1 ? "admin" : "user";
        this.usersApi = new Users();
        this.formController = Object.create(FormController);
        this.toast = Object.create(Toast);
        this.users = [];
    }

    async init() {
        document.querySelector(`#create-${this.prefix}`)?.addEventListener("click", () => this.openForm());
        document.querySelector(`#${this.prefix}s-body`)?.addEventListener("click", (event) => this.handleAction(event));
        document.querySelector(`#${this.prefix}-form`)?.addEventListener("submit", (event) => this.submit(event));
        try {
            await this.loadUsers();
            this.render();
        } catch (error) {
            this.toast.error(error.message);
        }
    }

    async loadUsers() {
        const response = await this.usersApi.listManaged(this.typeId);
        if (response?.status !== "success") {
            throw new Error(response?.message || "Não foi possível carregar as contas.");
        }
        this.users = (Array.isArray(response.data) ? response.data : []).map((item) => {
            const user = new User({ ...item, typeId: item.user_type_id });
            user.createdAt = item.created_at;
            return user;
        });
    }

    render() {
        const body = document.querySelector(`#${this.prefix}s-body`);
        body.innerHTML = this.users.length ? this.users.map((user) => `
            <tr>
                <td>${this.escapeHtml(user.name)}</td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${this.typeId === 1 ? "Administrador" : "Usuário"}</td>
                <td>${this.date(user.createdAt)}</td>
                <td><nav class="management-actions">
                    <button data-id="${user.id}" class="btn btn-secondary btn-small view">Ver</button>
                    <button data-id="${user.id}" class="btn btn-secondary btn-small edit">Editar</button>
                    <button data-id="${user.id}" class="btn btn-secondary btn-small remove">Excluir</button>
                </nav></td>
            </tr>
        `).join("") : '<tr><td colspan="5">Nenhuma conta cadastrada.</td></tr>';
    }

    openForm(user = null) {
        const form = document.querySelector(`#${this.prefix}-form`);
        form.reset();
        form.dataset.id = user?.id || "";
        form.elements.namedItem("name").value = user?.name || "";
        form.elements.namedItem("email").value = user?.email || "";
        const password = form.elements.namedItem("password");
        password.required = !user;
        password.disabled = Boolean(user);
        password.closest("label").hidden = Boolean(user);
        document.querySelector(`#${this.prefix}-modal-title`).textContent =
            `${user ? "Editar" : "Criar"} ${this.typeId === 1 ? "Administrador" : "Usuário"}`;
        document.querySelector(`#${this.prefix}-modal`).classList.remove("hidden");
    }

    async handleAction(event) {
        const button = event.target.closest("button[data-id]");
        if (!button) return;
        const user = this.users.find((item) => item.id === Number(button.dataset.id));
        if (!user) return;
        if (button.classList.contains("view")) this.renderDetails(user);
        if (button.classList.contains("edit")) this.openForm(user);
        if (!button.classList.contains("remove") || !window.confirm("Excluir esta conta?")) return;
        button.disabled = true;
        try {
            const response = await this.usersApi.removeManaged(this.typeId, user.id);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível excluir a conta.");
            await this.loadUsers();
            this.render();
            document.querySelector(`#${this.prefix}-details`).textContent = "Selecione uma conta para ver detalhes.";
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
                ? await this.usersApi.updateManaged(this.typeId, form.dataset.id, data)
                : await this.usersApi.createManaged(this.typeId, data);
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível salvar a conta.");
            const storage = new SessionStorage();
            const current = storage.getUser();
            if (Number(current?.id) === Number(response.data?.id)) {
                storage.saveSession(storage.getToken(), { ...current, ...response.data });
                document.querySelectorAll("[data-user-name]").forEach((element) => { element.textContent = response.data.name; });
            }
            document.querySelector(`#${this.prefix}-modal`).classList.add("hidden");
            await this.loadUsers();
            this.render();
            this.renderDetails(this.users.find((item) => item.id === Number(response.data?.id)));
            this.toast.success(response.message);
        } catch (error) {
            this.toast.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    renderDetails(user) {
        if (!user) return;
        document.querySelector(`#${this.prefix}-details`).innerHTML = `
            <h3>${this.escapeHtml(user.name)}</h3>
            <p><strong>E-mail:</strong> ${this.escapeHtml(user.email)}</p>
            <p><strong>Papel:</strong> ${this.typeId === 1 ? "Administrador" : "Usuário"}</p>
            <p><strong>Criado em:</strong> ${this.date(user.createdAt)}</p>`;
    }

    date(value) { return value ? new Date(value.replace(" ", "T")).toLocaleString("pt-BR") : "—"; }
    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }
}
