import AuthGuard from "../../_common/scripts/AuthGuard.js";
import SessionStorage from "../../_common/scripts/storage.js";
import Dashboard from "./dashboard.js";
import UsersPage from "./users.js";
import Admins from "./admins.js";
import Wastes from "./wastes.js";
import Params from "./params.js";
import FaqsPage from "./faqs.js";
import AdminReports from "./reports.js";
import AdminProfile from "./profile.js";

class Admin {
    constructor() {
        this.storage = new SessionStorage();
        this.profile = new AdminProfile(this.storage);
    }

    init() {
        this.syncShell();
        document.querySelectorAll("[data-close]").forEach((button) => {
            button.addEventListener("click", () => {
                document.getElementById(button.dataset.close)?.classList.add("hidden");
            });
        });
        const page = window.location.pathname.split("/").pop();
        switch (page) {
            case "dashboard.html": new Dashboard().render(); break;
            case "users.html": new UsersPage().init(); break;
            case "admins.html": new Admins().init(); break;
            case "wastes.html": new Wastes().init(); break;
            case "params.html": new Params().init(); break;
            case "faqs.html": new FaqsPage().init(); break;
            case "reports.html": new AdminReports().init(); break;
            case "profile.html": this.profile.init(); break;
        }
    }

    syncShell() {
        const pages = [
            ["dashboard.html", "Dashboard"], ["users.html", "Usuários"],
            ["admins.html", "Administradores"], ["wastes.html", "Resíduos"],
            ["params.html", "Parâmetros"], ["faqs.html", "FAQs"],
            ["reports.html", "Relatórios"], ["profile.html", "Perfil"]
        ];
        const current = window.location.pathname.split("/").pop();
        const label = pages.find(([file]) => file === current)?.[1] || "Dashboard";
        const nav = document.querySelector(".admin-nav");
        nav.innerHTML = pages.map(([file, title]) => `<li><a href="${file}" ${file === current ? 'class="active" aria-current="page"' : ""}>${title}</a></li>`).join("") +
            '<li><a href="../../public/pages/login.html" id="admin-logout">Sair</a></li>';
        const brand = document.querySelector(".admin-brand");
        brand.href = "dashboard.html";
        brand.innerHTML = `<span class="admin-brand-copy"><strong class="logo">BioGas Analytics</strong><small class="admin-brand-meta">Admin / ${label}</small></span>`;
        const topbar = document.querySelector(".admin-topbar");
        let actions = topbar.querySelector(".topbar-actions");
        if (!actions) {
            actions = document.createElement("section");
            actions.className = "topbar-actions";
            topbar.appendChild(actions);
        }
        actions.innerHTML = `<a href="../../public/pages/home.html" class="btn btn-secondary btn-small">Ver Site Público</a>
            <a href="profile.html" class="btn btn-primary btn-small admin-account">
                <span class="admin-user-avatar" data-user-avatar><span data-user-initials>BG</span><img data-user-photo alt="" hidden></span>
                <span data-user-name>Minha Conta</span>
            </a>`;
        this.profile.refreshHeader(this.storage.getUser() || {});
        document.querySelector("#admin-logout")?.addEventListener("click", () => this.storage.clearSession());
    }
}

const guard = new AuthGuard("../../public/pages/login.html", "user", 1);
if (guard.protect()) new Admin().init();
