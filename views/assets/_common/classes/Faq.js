export default class Faq {
    #id;
    #question;
    #answer;
    #faqsCategoryId;
    #active;

    constructor({ id = null, question = "", answer = "", faqsCategoryId = null, active = 1 } = {}) {
        
        this.id = id;
        this.question = question;
        this.answer = answer;
        this.faqsCategoryId = faqsCategoryId;
        this.active = active;
    }

    get id() {
        return this.#id;
    }

    set id(value) {
        this.#id = value === null ? null : Number(value);
    }

    get question() {
        return this.#question;
    }

    set question(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A pergunta é obrigatória");
        }

        this.#question = value.trim();
    }

    get answer() {
        return this.#answer;
    }

    set answer(value) {
        if (typeof value !== "string" || value.trim() === "") {
            throw new TypeError("A resposta é obrigatória");
        }

        this.#answer = value.trim();
    }

    get faqsCategoryId() {
        return this.#faqsCategoryId;
    }

    set faqsCategoryId(value) {
        this.#faqsCategoryId = value === null ? null : Number(value);
    }

    get active() {
        return this.#active;
    }

    set active(value) {
        this.#active = Number(value);
    }
}