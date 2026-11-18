export default class WasteType {
    
    #id;
    #name;
    #description;
    #estimatedYield;
    #active;

    constructor({ id = null, name = "",  description = "", estimatedYield = 0,  active = 1 } = {}) {
        
        this.id = id;
        this.name = name;
        this.description = description;
        this.estimatedYield = estimatedYield;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("O nome é obrigatório");
        }

        this.#name = value.trim();
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = String(value ?? "").trim();
    }

    get estimatedYield() {
        return this.#estimatedYield;
    }

    set estimatedYield(value) {
        const number = Number(value);

        if (!Number.isFinite(number) || number < 0) {
            throw new RangeError("O rendimento estimado deve ser um número não negativo");
        }

        this.#estimatedYield = number;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }
}