import Faqs from "../../_common/classes/Faqs.js";
import FaqsCategories from "../../_common/classes/FaqsCategories.js";

const faqsApi = new Faqs();
const categoriesApi = new FaqsCategories();

let faqs = [];
let selectedCategory = "all";

async function fetchCategories() {
    const categories = await categoriesApi.listAll();

    const listCategories = document.querySelector("#faq-categories");

    categories.data.forEach(category => {
        const button = document.createElement("button");

        button.classList.add("category-tab");
        button.setAttribute("data-category", category.id);
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", "false");

        button.innerHTML = category.name;

        listCategories.appendChild(button);
    });
}

async function fetchFAQs() {
    const response = await faqsApi.listAll();

    faqs = response.data;

    showFAQs(faqs);
}

function showFAQs(list) {
    const listFaqs = document.querySelector("#faq-list");

    listFaqs.innerHTML = "";

    list.forEach(faq => {
        const itemFaq = document.createElement("li");

        itemFaq.classList.add("faq-item");
        itemFaq.setAttribute("data-category", faq.faqs_category_id);

        itemFaq.innerHTML = `
            <button class="faq-toggle" aria-expanded="false" aria-controls="faq-answer-${faq.id}">
                <span class="faq-question">${faq.question}</span>
                <span class="faq-icon">+</span>
            </button>

            <article id="faq-answer-${faq.id}" class="faq-answer hidden">
                <p>${faq.answer}</p>
            </article>
        `;

        listFaqs.appendChild(itemFaq);

        const button = itemFaq.querySelector(".faq-toggle");
        const answer = itemFaq.querySelector(".faq-answer");

        button.addEventListener("click", () => {
            answer.classList.toggle("hidden");

            if (answer.classList.contains("hidden")) {
                button.setAttribute("aria-expanded", "false");
                button.querySelector(".faq-icon").textContent = "+";
            } else {
                button.setAttribute("aria-expanded", "true");
                button.querySelector(".faq-icon").textContent = "-";
            }
        });
    });
}

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function filterFAQs() {
    const search = normalizarTexto(document.querySelector("#faq-search").value);

    let result = faqs;

    if (selectedCategory !== "all") {
        result = result.filter(faq =>
            faq.faqs_category_id == selectedCategory
        );
    }

    if (search !== "") {
    result = result.filter(faq =>
        normalizarTexto(faq.question).includes(search)
    );
}

    showFAQs(result);

    const noResults = document.querySelector("#no-results");

    if (result.length === 0) {
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetchCategories();
    await fetchFAQs();

    const categoryButtons = document.querySelectorAll(".category-tab");

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(button => {
                button.classList.remove("active");
                button.setAttribute("aria-selected", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-selected", "true");

            selectedCategory = button.getAttribute("data-category");

            filterFAQs();
        });
    });

    const searchForm = document.querySelector("#faq-search-form");

    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        filterFAQs();
    });
});