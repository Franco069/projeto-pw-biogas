export default class User {
    
    #id;
    #typeId;
    #name;
    #email;
    #password;
    #photo;
    #active;

    constructor({ id = null, typeId = null, name = "", email = "", password = "", photo = null,  active = 1} = {}) {

        this.id = id;
        this.typeId = typeId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.photo = photo;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get typeId() {
        return this.#typeId;
    }

    set typeId(value) {
        this.#typeId = value === null ? null : Number(value);
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

    get email() {
        return this.#email;
    }

    set email(value) {
        if (typeof value !== "string" || !value.includes("@")) {
            throw new TypeError("O e-mail é inválido");
        }

        this.#email = value.trim();
    }

    get password() {
        return this.#password;
    }

    set password(value) {
        this.#password = value;
    }

    get photo() {
        return this.#photo;
    }

    set photo(value) {
        this.#photo = value;
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }
}