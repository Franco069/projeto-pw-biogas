
import Simulations from "../../_common/classes/Simulations.js";
import SystemParameters from "../../_common/classes/SystemParameters.js";
import Simulation from "../../_common/classes/Simulation.js";
import SystemParameter from "../../_common/classes/SystemParameter.js";
import FormController from "../../_common/prototypes/FormController.js";
import Toast from "../../_common/prototypes/Toast.js";
import WasteTypes from "../../_common/classes/WasteTypes.js";
import WasteType from "../../_common/classes/WasteType.js";
import LocationImages from "../../_common/classes/LocationImages.js";

export default class SimulationsPage {
    constructor() {
        this.simulationsApi = new Simulations();
        this.parametersApi = new SystemParameters();
        this.wastesApi = new WasteTypes();
        this.locationImagesApi = new LocationImages();
        this.formController = Object.create(FormController);
        this.toast = Object.create(Toast);
        this.simulations = [];
        this.parameters = [];
        this.wastes = [];
        this.selectedSimulation = null;
        this.photoUploading = false;
    }

    init() {
        document.querySelector("#simulation-form")
            ?.addEventListener("submit", (event) => this.submitSimulation(event));

        void this.loadParameters();
        void this.loadWastes();

        document.querySelector("#sim-waste-type")?.addEventListener("change", () => this.renderWasteYield());
        document.querySelector("#show-all-simulations")?.addEventListener("click", () => this.showSimulations());
        document.querySelector("#close-simulation-picker")?.addEventListener("click", () => document.querySelector("#simulation-picker").close());
        document.querySelector("#simulation-picker-list")?.addEventListener("click", (event) => {
            const button = event.target.closest("button[data-simulation-id]");
            if (button && !this.photoUploading) this.selectSimulation(Number(button.dataset.simulationId));
        });
        document.querySelector("#simulation-images")?.addEventListener("change", (event) => this.previewImages(event.currentTarget.files));
        document.querySelector("#simulation-photo-form")?.addEventListener("submit", (event) => this.uploadImages(event));
    }

    async loadWastes() {
        const select = document.querySelector("#sim-waste-type");
        try {
            const response = await this.wastesApi.list();
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar os resíduos.");
            this.wastes = (Array.isArray(response.data) ? response.data : [])
                .map((item) => new WasteType({ ...item, estimatedYield: item.estimated_yield }));
            select.innerHTML = '<option value="">Selecione o resíduo</option>' + this.wastes.map((waste) =>
                `<option value="${waste.id}">${this.escapeHtml(waste.name)}</option>`).join("");
            select.disabled = !this.wastes.length;
            if (!this.wastes.length) select.innerHTML = '<option value="">Nenhum resíduo ativo cadastrado</option>';
        } catch (error) {
            select.innerHTML = '<option value="">Não foi possível carregar os resíduos</option>';
            this.toast.error(error.message);
        }
    }

    renderWasteYield() {
        const waste = this.wastes.find((item) => item.id === Number(document.querySelector("#sim-waste-type").value));
        document.querySelector("#sim-waste-yield").textContent = waste
            ? `Rendimento estimado: ${this.number(waste.estimatedYield, 4)} m³/kg.`
            : "O rendimento do resíduo escolhido será usado no cálculo.";
    }

    async showSimulations() {
        if (this.photoUploading) return;
        const dialog = document.querySelector("#simulation-picker");
        const list = document.querySelector("#simulation-picker-list");
        list.textContent = "Carregando simulações...";
        if (!dialog.open) dialog.showModal();
        try {
            const response = await this.simulationsApi.list();
            if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar as simulações.");
            this.simulations = (Array.isArray(response.data) ? response.data : []).map((item) => new Simulation(item));
            list.innerHTML = this.simulations.length ? `<div class="report-list">${this.simulations.map((sim) => `
                <article class="report-item">
                    <section><h3>${this.escapeHtml(sim.location.name)}</h3>
                        <p>${this.escapeHtml(sim.wasteTypeName)} • ${this.escapeHtml(sim.createdAt)}</p>
                    </section>
                    <button type="button" class="btn btn-primary" data-simulation-id="${sim.id}">Selecionar</button>
                </article>`).join("")}</div>` : "Crie uma simulação antes de adicionar fotos.";
        } catch (error) {
            list.textContent = error.message;
        }
    }

    selectSimulation(id) {
        const simulation = this.simulations.find((item) => item.id === id);
        if (!simulation) return;
        this.selectedSimulation = simulation;
        document.querySelector("#simulation-photo-target").textContent = `Simulação selecionada: ${simulation.location.name} (${simulation.wasteTypeName}).`;
        document.querySelector("#upload-simulation-photos").disabled = false;
        this.renderSavedImages(simulation.images);
        this.showImageFeedback("");
        document.querySelector("#simulation-picker").close();
    }

    renderSavedImages(images) {
        const container = document.querySelector("#simulation-saved-images");
        container.innerHTML = images.length ? images.map((item) => `
            <img class="simulation-photo" src="${this.escapeHtml(item.image_url)}" alt="${this.escapeHtml(item.alt_text || "Foto da simulação")}">
        `).join("") : "Nenhuma foto adicionada a esta simulação.";
    }

    validImages(files) {
        return files.every((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024);
    }

    previewImages(files) {
        const container = document.querySelector("#simulation-image-previews");
        container.innerHTML = "";
        if (!this.validImages([...files])) {
            this.showImageFeedback("Use imagens JPG, PNG ou WEBP de até 5 MB.", "error");
            return;
        }
        for (const file of files) {
            const image = document.createElement("img");
            image.className = "simulation-photo";
            image.alt = file.name;
            const objectUrl = URL.createObjectURL(file);
            image.onload = image.onerror = () => URL.revokeObjectURL(objectUrl);
            image.src = objectUrl;
            container.appendChild(image);
        }
        this.showImageFeedback("");
    }

    async uploadImages(event) {
        event.preventDefault();
        if (this.photoUploading) return;
        const form = event.currentTarget;
        const files = [...document.querySelector("#simulation-images").files];
        const simulation = this.selectedSimulation;
        if (!simulation) {
            this.showImageFeedback("Escolha uma simulação em Todas simulações.", "error");
            return;
        }
        if (!files.length || !this.validImages(files)) {
            this.showImageFeedback("Selecione imagens JPG, PNG ou WEBP de até 5 MB.", "error");
            return;
        }
        this.photoUploading = true;
        document.querySelector("#upload-simulation-photos").disabled = true;
        document.querySelector("#show-all-simulations").disabled = true;
        this.showImageFeedback("Enviando fotos...");
        let saved = 0;
        try {
            for (const file of files) {
                const response = await this.locationImagesApi.insert(simulation.location.id, file);
                if (response?.status !== "success") throw new Error(response?.message || "Não foi possível enviar a foto.");
                saved += 1;
            }
            this.showImageFeedback(`Fotos adicionadas à simulação ${simulation.location.name}.`, "success");
        } catch (error) {
            this.showImageFeedback(`${saved ? `${saved} foto(s) salva(s). ` : ""}${error.message}`, "error");
        } finally {
            if (saved) {
                form.reset();
                document.querySelector("#simulation-image-previews").innerHTML = "";
                try {
                    const response = await this.locationImagesApi.listAll(simulation.location.id);
                    if (response?.status !== "success") throw new Error(response?.message || "Não foi possível carregar as fotos.");
                    simulation.images = Array.isArray(response.data) ? response.data : [];
                    this.renderSavedImages(simulation.images);
                } catch (error) {
                    this.toast.error(error.message);
                }
            }
            this.photoUploading = false;
            document.querySelector("#upload-simulation-photos").disabled = false;
            document.querySelector("#show-all-simulations").disabled = false;
        }
    }

    showImageFeedback(message, state = "") {
        const feedback = document.querySelector("#simulation-image-feedback");
        feedback.textContent = message;
        feedback.hidden = !message;
        feedback.dataset.state = state;
        feedback.className = "app-message";
    }

    async loadParameters() {
        try {
            const response = await this.parametersApi.list();

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível carregar os parâmetros.");
            }

            this.parameters = (Array.isArray(response.data) ? response.data : [])
                .map((item) => new SystemParameter(item));
        } catch (error) {
            console.error(error);
            this.toast.error(error.message || "Falha ao carregar os parâmetros.");
        }
    }

    parameter(name) {
        return this.parameters.find((item) => item.name === name);
    }

    equivalentGlp(simulation) {
        const conversion = Number(this.parameter("glp_energy_conversion")?.value);

        if (!conversion) {
            return { daily: null, monthly: null };
        }

        const daily = simulation.result.estimatedEnergyKwh / conversion;

        return {
            daily,
            monthly: daily * 30
        };
    }

    renderSimulationResult(simulation) {
        const result = document.querySelector("#simulation-result");

        if (!result) return;

        const equivalent = this.equivalentGlp(simulation);

        result.classList.remove("hidden");

        result.innerHTML = `
            <h3>Simulação registrada</h3>

            <section class="simulation-summary">
                <article>
                    <strong>${this.escapeHtml(simulation.wasteTypeName)}</strong>
                    <span>${this.number(simulation.dailyWasteKg)} kg/dia</span>
                </article>

                <article>
                    <strong>Biogás estimado</strong>
                    <span>${this.number(simulation.result.estimatedBiogasM3)} m³/dia</span>
                </article>

                <article>
                    <strong>Energia potencial</strong>
                    <span>${this.number(simulation.result.estimatedEnergyKwh)} kWh/dia</span>
                </article>

                <article>
                    <strong>GLP substituível</strong>
                    <span>
                        ${equivalent.monthly === null
                            ? "Parâmetro indisponível"
                            : `${this.number(Math.min(equivalent.monthly, simulation.glpConsumptionKg))} kg/mês`}
                    </span>
                </article>

                <article>
                    <strong>Economia mensal</strong>
                    <span>${this.currency(simulation.result.monthlySaving)}</span>
                </article>

                <article>
                    <strong>Economia anual</strong>
                    <span>${this.currency(simulation.result.annualSaving)}</span>
                </article>

                <article>
                    <strong>Payback</strong>
                    <span>
                        ${simulation.result.paybackMonths === null
                            ? "Indeterminado"
                            : `${this.number(simulation.result.paybackMonths)} meses`}
                    </span>
                </article>
            </section>

            <p class="mt-md">
                A simulação foi salva no histórico e já pode ser comparada
                ou incluída em relatório.
            </p>

            <nav class="topbar-actions mt-md">
                <a class="btn btn-primary" href="history.html">Ver Histórico</a>
                <a class="btn btn-secondary" href="compare.html">Comparar Cenários</a>
            </nav>
        `;
    }

    async submitSimulation(event) {
        event.preventDefault();

        const form = event.currentTarget;
        this.formController.init(form);

        const result = document.querySelector("#simulation-result");

        if (result) {
            result.classList.add("hidden");
            result.textContent = "";
        }

        try {
            const response = await this.simulationsApi.create(
                this.formController.serialize()
            );

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível criar a simulação.");
            }

            this.toast.success(response.message || "Simulação criada com sucesso.");

            form.reset();
            this.renderWasteYield();

            const created = new Simulation(response.data);
            this.renderSimulationResult(created);

            this.simulations = [
                created,
                ...this.simulations.filter((item) => item.id !== created.id)
            ];
        } catch (error) {
            console.error(error);
            this.toast.error(error.message || "Falha ao salvar a simulação.");
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

    escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[char]));
    }
}
