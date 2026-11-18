
import Simulations from "../../_common/classes/Simulations.js";
import SystemParameters from "../../_common/classes/SystemParameters.js";
import Simulation from "../../_common/classes/Simulation.js";
import SystemParameter from "../../_common/classes/SystemParameter.js";
import Toast from "../../_common/prototypes/Toast.js";
import LocationImages from "../../_common/classes/LocationImages.js";

export default class History {
    constructor() {
        this.simulationsApi = new Simulations();
        this.parametersApi = new SystemParameters();
        this.locationImagesApi = new LocationImages();
        this.toast = Object.create(Toast);
        this.simulations = [];
        this.parameters = [];
        this.selectedLocationId = null;
    }

    async init() {
        document.querySelector("#sim-list-body")?.addEventListener("click", (event) => {
            const button = event.target.closest("button");

            if (!button) return;

            const simulation = this.simulations.find(
                (item) => item.id === Number(button.dataset.id)
            );

            if (button.classList.contains("view")) {
                this.renderHistoryDetails(simulation);

                if (simulation?.location.id) {
                    this.selectedLocationId = simulation.location.id;

                    document.querySelector("#location-images").hidden = false;

                    void this.loadLocationImages();
                }
            }

            if (button.classList.contains("remove")) {
                this.deleteSimulation(button.dataset.id);
            }
        });

        try {
            await Promise.all([
                this.loadSimulations(),
                this.loadParameters()
            ]);

            this.renderHistory();

            document.querySelector("#location-image-input")?.addEventListener("change", (event) => {
                this.previewLocationImages(event.currentTarget.files);
            });

            document.querySelector("#location-image-form")?.addEventListener("submit", (event) => {
                void this.uploadLocationImages(event);
            });

            document.querySelector("#location-image-list")?.addEventListener("click", (event) => {
                const button = event.target.closest("button.remove-location-image");

                if (button) {
                    void this.deleteLocationImage(button.dataset.id);
                }
            });
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

    renderHistory() {
        const body = document.querySelector("#sim-list-body");

        if (!body) return;

        body.innerHTML = "";

        if (!this.simulations.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="6">Nenhuma simulação cadastrada ainda.</td>
                </tr>
            `;
            return;
        }

        body.innerHTML = this.simulations.map((sim) => `
            <tr>
                <td>${this.escapeHtml(sim.location.name)}</td>

                <td>
                    ${this.escapeHtml(
                        [sim.location.type, sim.location.city, sim.location.state]
                            .filter(Boolean).join(" • ")
                    )}
                </td>

                <td>${this.number(sim.dailyWasteKg)} kg/dia</td>
                <td>${this.number(sim.result.estimatedBiogasM3)} m³/dia</td>
                <td>${this.date(sim.createdAt)}</td>

                <td>
                    <nav class="action-btns">
                        <button data-id="${sim.id}"
                            class="btn btn-secondary btn-small view">
                            Detalhes
                        </button>

                        <button data-id="${sim.id}"
                            class="btn btn-secondary btn-small danger remove">
                            Excluir
                        </button>
                    </nav>
                </td>
            </tr>
        `).join("");
    }

    renderHistoryDetails(sim) {
        const details = document.querySelector("#sim-details");

        if (!details || !sim) return;

        const glp = this.equivalentGlp(sim);

        details.innerHTML = `
            <h3>${this.escapeHtml(sim.location.name)}</h3>

            <dl>
                <dt>Local</dt>
                <dd>${this.escapeHtml(
                    [sim.location.type, sim.location.city, sim.location.state]
                        .filter(Boolean).join(" • ")
                )}</dd>

                <dt>Pessoas</dt>
                <dd>${this.number(sim.peopleQuantity, 0)}</dd>

                <dt>Resíduos</dt>
                <dd>${this.number(sim.dailyWasteKg)} kg/dia</dd>

                <dt>Tipo de resíduo</dt>
                <dd>${this.escapeHtml(sim.wasteTypeName || "Não informado")}</dd>

                <dt>Biogás estimado</dt>
                <dd>${this.number(sim.result.estimatedBiogasM3)} m³/dia</dd>

                <dt>Energia estimada</dt>
                <dd>${this.number(sim.result.estimatedEnergyKwh)} kWh/dia</dd>

                <dt>GLP equivalente</dt>
                <dd>
                    ${glp.monthly === null
                        ? "Parâmetro indisponível"
                        : `${this.number(glp.monthly)} kg/mês`}
                </dd>

                <dt>Consumo atual de GLP</dt>
                <dd>${this.number(sim.glpConsumptionKg)} kg/mês</dd>

                <dt>Custo atual de GLP</dt>
                <dd>${this.currency(sim.glpMonthlyCost)}/mês</dd>

                <dt>Economia mensal</dt>
                <dd>${this.currency(sim.result.monthlySaving)}</dd>

                <dt>Economia anual</dt>
                <dd>${this.currency(sim.result.annualSaving)}</dd>

                <dt>Custo de implantação</dt>
                <dd>${this.currency(sim.implementationCost)}</dd>

                <dt>Payback</dt>
                <dd>
                    ${sim.result.paybackMonths === null
                        ? "Indeterminado"
                        : `${this.number(sim.result.paybackMonths)} meses`}
                </dd>

                <dt>Criada em</dt>
                <dd>${this.date(sim.createdAt)}</dd>
            </dl>
        `;
    }

    async deleteSimulation(id) {
        if (!window.confirm(
            "Excluir esta simulação? Os resultados vinculados também serão removidos."
        )) {
            return;
        }

        try {
            const response = await this.simulationsApi.delete(id);

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível excluir a simulação.");
            }

            this.simulations = this.simulations.filter(
                (sim) => sim.id !== Number(id)
            );

            this.renderHistory();

            const details = document.querySelector("#sim-details");

            if (details) {
                details.innerHTML = `
                    <h3>Detalhes da Simulação</h3>
                    <p>Selecione uma simulação para ver os indicadores completos.</p>
                `;
            }

            this.selectedLocationId = null;

            const imageSection = document.querySelector("#location-images");

            if (imageSection) {
                imageSection.hidden = true;
            }

            this.toast.success(response.message || "Simulação excluída.");
        } catch (error) {
            console.error(error);
            this.toast.error(error.message || "Falha ao excluir a simulação.");
        }
    }

    async loadLocationImages() {
        const list = document.querySelector("#location-image-list");
        const locationId = this.selectedLocationId;

        if (!list || !locationId) return;

        list.textContent = "Carregando imagens…";

        try {
            const response = await this.locationImagesApi.listAll(locationId);

            if (response?.status !== "success") {
                throw new Error(response?.message || "Não foi possível carregar as imagens.");
            }

            if (locationId !== this.selectedLocationId) return;

            this.renderLocationImages(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error(error);

            if (locationId === this.selectedLocationId) {
                list.textContent = error.message || "Falha ao carregar imagens.";
            }
        }
    }

    renderLocationImages(images) {
        const list = document.querySelector("#location-image-list");

        if (!list) return;

        list.innerHTML = "";

        if (!images.length) {
            list.textContent = "Este local ainda não possui imagens.";
            return;
        }

        images.forEach((item) => {
            const article = document.createElement("article");
            article.className = "location-image-item";

            const image = document.createElement("img");
            image.className = "location-image-thumbnail";
            image.alt = item.alt_text || "Foto do local";
            image.loading = "lazy";
            image.src = item.image_url;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-secondary btn-small danger remove-location-image";
            button.dataset.id = item.id;
            button.textContent = "Excluir foto";

            article.append(image, button);
            list.appendChild(article);
        });
    }

    previewLocationImages(files) {
        const container = document.querySelector("#location-image-previews");

        if (!container) return;

        container.innerHTML = "";

        for (const file of files) {
            if (
                !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
                file.size > 5 * 1024 * 1024
            ) {
                this.showImageFeedback(
                    "Use imagens JPG, PNG ou WEBP de até 5 MB.",
                    "error"
                );
                return;
            }

            const image = document.createElement("img");
            image.className = "location-image-thumbnail";
            image.alt = file.name;
            image.src = URL.createObjectURL(file);

            image.onload = () => URL.revokeObjectURL(image.src);

            container.appendChild(image);
        }

        this.showImageFeedback("");
    }

    async uploadLocationImages(event) {
        event.preventDefault();

        if (!this.selectedLocationId) return;

        const form = event.currentTarget;
        const input = form.querySelector("#location-image-input");
        const button = form.querySelector('button[type="submit"]');
        const files = [...(input?.files || [])];

        if (!files.length) {
            this.showImageFeedback(
                "Selecione pelo menos uma imagem.",
                "error"
            );
            return;
        }

        if (
            files.some((file) =>
                !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
                file.size > 5 * 1024 * 1024
            )
        ) {
            this.showImageFeedback(
                "Use imagens JPG, PNG ou WEBP de até 5 MB.",
                "error"
            );
            return;
        }

        button.disabled = true;
        this.showImageFeedback("Enviando imagens…");

        const locationId = this.selectedLocationId;

        try {
            for (const file of files) {
                const response = await this.locationImagesApi.insert(
                    locationId,
                    file
                );

                if (response?.status !== "success") {
                    throw new Error(
                        response?.message || "Não foi possível enviar a imagem."
                    );
                }
            }

            form.reset();

            document.querySelector("#location-image-previews").innerHTML = "";

            this.showImageFeedback(
                "Imagens enviadas com sucesso.",
                "success"
            );
        } catch (error) {
            console.error(error);

            this.showImageFeedback(
                error.message || "Falha ao enviar imagens.",
                "error"
            );
        } finally {
            button.disabled = false;

            if (locationId === this.selectedLocationId) {
                await this.loadLocationImages();
            }
        }
    }

    async deleteLocationImage(id) {
        if (
            !this.selectedLocationId ||
            !window.confirm("Excluir esta foto do local?")
        ) {
            return;
        }

        const locationId = this.selectedLocationId;

        try {
            const response = await this.locationImagesApi.remove(
                locationId,
                id
            );

            if (response?.status !== "success") {
                throw new Error(
                    response?.message || "Não foi possível excluir a imagem."
                );
            }

            this.showImageFeedback(
                "Imagem excluída com sucesso.",
                "success"
            );

            if (locationId === this.selectedLocationId) {
                await this.loadLocationImages();
            }
        } catch (error) {
            console.error(error);

            this.showImageFeedback(
                error.message || "Falha ao excluir a imagem.",
                "error"
            );
        }
    }

    showImageFeedback(message, state = "") {
        const feedback = document.querySelector("#location-image-feedback");

        if (!feedback) return;

        feedback.textContent = message;
        feedback.hidden = !message;
        feedback.dataset.state = state;
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
