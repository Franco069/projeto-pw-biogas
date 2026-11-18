async function fetchFAQs() {
    const response = await fetch("http://localhost/projeto-pw-biogas/api/faqs/list");
    const faqs = await response.json();

    const listFaqs = document.querySelector("#home-faq-list");

    faqs.data.slice(0, 10).forEach(faq => {
        const faqItem = document.createElement("li");

        faqItem.classList.add("faq-item");

        faqItem.innerHTML = `
            <button class="faq-toggle" aria-expanded="false">
                ${faq.question}
                <span class="faq-icon">+</span>
            </button>

            <article class="faq-answer hidden">
                <p>${faq.answer}</p>
            </article>
        `;

        listFaqs.appendChild(faqItem);

        const button = faqItem.querySelector(".faq-toggle");
        const answer = faqItem.querySelector(".faq-answer");

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

fetchFAQs();