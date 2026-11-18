export default class FaqCategory {

    #id;
    #name;
    #active;

    constructor({ id = null,  name = "", active = 1} = {}) {
        
        this.id = id;
        this.name = name;
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
            throw new TypeError("O nome da categoria é obrigatório");
        }

        this.#name = value.trim();
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }
}