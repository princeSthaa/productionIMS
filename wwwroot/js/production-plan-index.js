(function () {
    "use strict";

    let plans = [];

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        plans = App.getData("mockProductionPlans", "productionPlans", "plans");

        bindFilters();
        render();
    }

    function bindFilters() {
        [
            "demandTypeFilter",
            "statusFilter",
            "fromDateFilter",
            "toDateFilter",
            "productSearch",
            "sourceSearch"
        ].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", render);
                el.addEventListener("change", render);
            }
        });

        const reset = document.getElementById("resetFiltersBtn");
        if (reset) {
            reset.addEventListener("click", function () {
                App.setValue("#demandTypeFilter", "");
                App.setValue("#statusFilter", "");
                App.setValue("#fromDateFilter", "");
                App.setValue("#toDateFilter", "");
                App.setValue("#productSearch", "");
                App.setValue("#sourceSearch", "");
                render();
            });
        }
    }

    function getFilteredPlans() {
        const demandType = App.value("#demandTypeFilter");
        const status = App.value("#statusFilter");
        const fromDate = App.value("#fromDateFilter");
        const toDate = App.value("#toDateFilter");
        const productSearch = App.value("#productSearch").toLowerCase();
        const sourceSearch = App.value("#sourceSearch").toLowerCase();

        return plans.filter(function (plan) {
            const planDemandType = plan.demandType || "";
            const planStatus = plan.status || "";
            const productName = plan.productName || plan.product || "";
            const sourceName = plan.sourceName || plan.customerName || plan.outletName || plan.warehouseName || "";

            if (demandType && planDemandType !== demandType) return false;
            if (status && planStatus !== status) return false;

            if (productSearch && !productName.toLowerCase().includes(productSearch)) return false;
            if (sourceSearch && !sourceName.toLowerCase().includes(sourceSearch)) return false;

            const start = plan.plannedStartDate ? new Date(plan.plannedStartDate) : null;

            if (fromDate && start && start < new Date(fromDate)) return false;
            if (toDate && start && start > new Date(toDate)) return false;

            return true;
        });
    }

    function render() {
        const filtered = getFilteredPlans();

        renderSummary();
        renderTable(filtered);

        const info = document.getElementById("tableInfoText");
        if (info) {
            info.textContent = `Showing ${filtered.length} of ${plans.length} production plans.`;
        }
    }

    function renderSummary() {
        App.setText("#totalPlans", plans.length);

        App.setText("#draftPlans", plans.filter(function (x) {
            return String(x.status).toLowerCase() === "draft";
        }).length);

        App.setText("#completedPlans", plans.filter(function (x) {
            return String(x.status).toLowerCase() === "completed";
        }).length);

        App.setText("#inProgressPlans", plans.filter(function (x) {
            const status = String(x.status || "").toLowerCase();
            return status !== "draft" && status !== "completed" && status !== "cancelled";
        }).length);
    }

    function renderTable(items) {
        const body = document.getElementById("productionPlansTableBody");
        if (!body) return;

        if (!items.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-cell">
                        No production plans match your filters.
                    </td>
                </tr>
            `;
            return;
        }

        body.innerHTML = items.map(function (plan) {
            const id = plan.planId || plan.planNo;
            const product = plan.productName || plan.product || "-";
            const source = plan.sourceName || plan.customerName || plan.outletName || plan.warehouseName || "-";
            const quantity = plan.quantity || plan.totalQuantity || 0;

            return `
                <tr>
                    <td><strong>${App.escapeHtml(plan.planNo || id)}</strong></td>
                    <td>${App.escapeHtml(plan.demandType || "-")}</td>
                    <td>${App.escapeHtml(source)}</td>
                    <td>${App.escapeHtml(product)}</td>
                    <td>${Number(quantity).toLocaleString()}</td>
                    <td>${App.formatDate(plan.plannedStartDate)}</td>
                    <td>${App.formatDate(plan.plannedCompletionDate)}</td>
                    <td>${App.formatDate(plan.requiredDate)}</td>
                    <td>${App.badge(plan.status)}</td>
                    <td class="text-right">
                        <a class="btn btn-sm btn-light" href="/Production/Details/${encodeURIComponent(id)}">View</a>
                        <a class="btn btn-sm btn-primary" href="/Production/Edit/${encodeURIComponent(id)}">Edit</a>
                    </td>
                </tr>
            `;
        }).join("");
    }
})();