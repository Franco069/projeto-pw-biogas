
import AuthGuard from "../../_common/scripts/AuthGuard.js";
import SessionStorage from "../../_common/scripts/storage.js";

import Profile from "./profile.js";
import Dashboard from "./dashboard.js";
import SimulationsPage from "./simulations.js";
import History from "./history.js";
import Compare from "./compare.js";
import Reports from "./reports.js";

class App {
    constructor() {
        this.storage = new SessionStorage();

        this.profile = new Profile(this.storage);
        this.dashboard = new Dashboard();
        this.simulations = new SimulationsPage();
        this.history = new History();
        this.compare = new Compare();
        this.reports = new Reports();
    }

    init() {
        this.syncShell();

        const page = window.location.pathname.split("/").pop();

        switch (page) {
            case "dashboard.html":
                this.dashboard.render();
                break;

            case "new-simulation.html":
                this.simulations.init();
                break;

            case "history.html":
                this.history.init();
                break;

            case "compare.html":
                this.compare.init();
                break;

            case "reports.html":
                this.reports.init();
                break;

            case "profile.html":
                this.profile.init();
                break;
        }
    }

    syncShell() {
        const currentPage = window.location.pathname.split("/").pop();

        let label = "Dashboard";

        document.querySelectorAll(".sidebar-list a[href]").forEach((link) => {
            const active = link.getAttribute("href") === currentPage;

            link.classList.toggle("active", active);

            if (active) {
                label = link.textContent.trim();
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        const meta = document.querySelector(".app-brand-meta");

        if (meta) {
            meta.textContent = `Área de Aplicação / ${label}`;
        }

        this.renderUser();
        this.bindLogout();
    }

    renderUser() {
        const user = this.storage.getUser() || {};

        const initials = (user.name || "BioGas")
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toLocaleUpperCase("pt-BR");

        document.querySelectorAll("[data-user-name]").forEach((element) => {
            element.textContent = user.name || "Minha Conta";
        });

        document.querySelectorAll("[data-user-avatar]").forEach((avatar) => {
            const image = avatar.querySelector("[data-user-photo]");
            const fallback = avatar.querySelector("[data-user-initials]");

            if (!image || !fallback) return;

            fallback.textContent = initials;
            fallback.hidden = false;
            image.hidden = true;

            image.onload = () => {
                image.hidden = false;
                fallback.hidden = true;
            };

            image.onerror = () => {
                image.hidden = true;
                fallback.hidden = false;
            };

            if (user.photo) {
                const photoUrl = this.getSafePhotoUrl(user.photo);

                if (photoUrl) {
                    image.src = photoUrl;
                }
            } else {
                image.removeAttribute("src");
            }
        });
    }

    getSafePhotoUrl(photo) {
        if (typeof photo !== "string" || !photo.trim()) {
            return null;
        }

        try {
            const rootUrl = new URL("../../../../", import.meta.url);
            const url = new URL(photo, rootUrl);

            return ["http:", "https:"].includes(url.protocol)
                ? url.href
                : null;
        } catch {
            return null;
        }
    }

    bindLogout() {
        document.querySelector("#app-logout")?.addEventListener("click", () => {
            this.storage.clearSession();
        });
    }
}

const guard = new AuthGuard(
    "../../public/pages/login.html",
    "user",
    2
);

if (guard.protect()) {
    new App().init();
}
