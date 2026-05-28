import { warehouseData } from "./data.js";
import { renderKpis, renderModuleNav, renderPanel } from "./renderers.js";

const app = document.querySelector("[data-warehouse-app]");

const state = {
    activeModuleId: "stock",
    search: "",
    stockType: "all"
};

async function loadTemplate(url) {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`Unable to load warehouse template: ${response.status}`);
    }

    const html = await response.text();
    const templateHost = document.createElement("div");
    templateHost.innerHTML = html.trim();
    return templateHost.querySelector("#warehouse-module-panel-template");
}

function getActiveModule() {
    return warehouseData.modules.find((module) => module.id === state.activeModuleId) || warehouseData.modules[0];
}

function render(template) {
    renderKpis(app.querySelector("[data-kpi-grid]"), warehouseData.kpis);
    renderModuleNav(app.querySelector("[data-module-nav]"), warehouseData.modules, state.activeModuleId);
    renderPanel(app.querySelector("[data-module-panel]"), template, getActiveModule(), warehouseData, state);
}

function bindEvents(template) {
    app.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action='open-module']");

        if (!button) {
            return;
        }

        state.activeModuleId = button.dataset.moduleId;
        render(template);
    });

    app.querySelector("[data-warehouse-search]").addEventListener("input", (event) => {
        state.search = event.target.value;

        if (state.activeModuleId !== "stock") {
            state.activeModuleId = "stock";
        }

        render(template);
    });

    app.querySelector("[data-stock-type-filter]").addEventListener("change", (event) => {
        state.stockType = event.target.value;
        state.activeModuleId = "stock";
        render(template);
    });
}

async function init() {
    if (!app) {
        return;
    }

    try {
        const template = await loadTemplate(app.dataset.templateUrl);
        bindEvents(template);
        render(template);
    } catch (error) {
        app.querySelector("[data-module-panel]").innerHTML = `
            <div class="alert alert-danger mb-0" role="alert">
                Warehouse screen could not load its template.
            </div>
        `;
        console.error(error);
    }
}

init();
