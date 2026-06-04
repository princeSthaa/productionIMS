(function () {
    "use strict";

    const state = {
        plans: [],
        products: [],
        customers: [],
        outlets: [],
        warehouses: [],
        stages: [],
        plan: null,
        selectedStage: null
    };

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        state.plans = App.getData("mockProductionPlans", "productionPlans", "plans");
        state.products = App.getData("products", "mockProducts", "productData");
        state.customers = App.getData("customers", "mockCustomers", "customerData");
        state.outlets = App.getData("outlets", "mockOutlets", "outletData");
        state.warehouses = App.getData("warehouses", "mockWarehouses", "warehouseData");
        state.stages = App.getData("productionStages", "mockProductionStages", "stages");

        loadPlan();
        bindEvents();
        renderPlanSummary();
        renderStageDropdown();
        renderStageProgress();
        renderStageTable();
    }

    function loadPlan() {
        const id = App.value("#selectedPlanId");
        state.plan = App.findById(state.plans, id) || state.plans[0] || null;
    }

    function bindEvents() {
        const stageDropdown = document.getElementById("stageDropdown");
        if (stageDropdown) {
            stageDropdown.addEventListener("change", function () {
                selectStage(stageDropdown.value);
            });
        }

        ["actualStartDate", "actualEndDate"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.addEventListener("change", calculateActualDuration);
        });

        ["completedQty", "rejectedQty", "stageStatus"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.addEventListener("input", validateStageForm);
            if (input) input.addEventListener("change", validateStageForm);
        });

        const clearBtn = document.getElementById("clearStageFormBtn");
        if (clearBtn) {
            clearBtn.addEventListener("click", clearForm);
        }

        const form = document.getElementById("stageUpdateForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                if (!validateStageForm()) {
                    event.preventDefault();
                }
            });
        }
    }

    function getPlanStages() {
        if (!state.plan) return state.stages;

        return state.plan.stages && state.plan.stages.length
            ? state.plan.stages
            : state.stages;
    }

    function renderPlanSummary() {
        if (!state.plan) {
            App.setText("#stagePlanNo", "Plan not found");
            App.setText("#stagePlanSubtitle", "No matching mock production plan was found.");
            return;
        }

        const product = App.findById(state.products, state.plan.productId) || {};
        const productName = state.plan.productName || product.name || product.productName || "-";

        App.setText("#stagePlanNo", state.plan.planNo || state.plan.planId);
        App.setValue("#planNoInput", state.plan.planNo || state.plan.planId);
        App.setText("#stagePlanSubtitle", `${productName} • ${state.plan.demandType || "-"}`);

        const badge = document.getElementById("stagePlanStatusBadge");
        if (badge) badge.outerHTML = App.badge(state.plan.status);

        App.setText("#stageDemandType", state.plan.demandType);
        App.setText("#stageSourceName", getSourceName());
        App.setText("#stageProductName", productName);
        App.setText("#stageTotalQuantity", Number(state.plan.quantity || state.plan.totalQuantity || 0).toLocaleString());
        App.setText("#stagePlannedStart", App.formatDate(state.plan.plannedStartDate));
        App.setText("#stagePlannedCompletion", App.formatDate(state.plan.plannedCompletionDate));
        App.setText("#stageRequiredDate", App.formatDate(state.plan.requiredDate));
        App.setText("#stageCurrentStage", state.plan.status || "-");
    }

    function getSourceName() {
        const plan = state.plan;
        if (!plan) return "-";

        if (plan.sourceName) return plan.sourceName;

        if (plan.demandType === "Customer Order") {
            const customer = App.findById(state.customers, plan.customerId || plan.sourceId);
            return customer?.name || customer?.customerName || "-";
        }

        if (plan.demandType === "Outlet Replenishment") {
            const outlet = App.findById(state.outlets, plan.outletId || plan.sourceId);
            return outlet?.name || outlet?.outletName || "-";
        }

        const warehouse = App.findById(state.warehouses, plan.warehouseId || plan.sourceId);
        return warehouse?.name || warehouse?.warehouseName || "Internal Stock";
    }

    function renderStageDropdown() {
        const dropdown = document.getElementById("stageDropdown");
        if (!dropdown) return;

        const stages = getPlanStages();

        dropdown.innerHTML = `<option value="">Select Stage</option>` + stages.map(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;
            const name = stage.stageName || stage.name;

            return `<option value="${App.escapeHtml(id)}">${App.escapeHtml(name)}</option>`;
        }).join("");
    }

    function renderStageProgress() {
        const strip = document.getElementById("stageProgressStrip");
        if (!strip) return;

        const stages = getPlanStages();

        strip.innerHTML = stages.map(function (stage) {
            const status = stage.status || "Not Started";

            const cls = status === "Completed"
                ? "completed"
                : status === "In Progress" || status === state.plan?.status
                    ? "active"
                    : status === "On Hold"
                        ? "hold"
                        : "";

            return `
                <div class="stage-step ${cls}">
                    <span>${App.escapeHtml(status)}</span>
                    <strong>${App.escapeHtml(stage.stageName || stage.name)}</strong>
                </div>
            `;
        }).join("");
    }

    function renderStageTable() {
        const body = document.getElementById("stageUpdateTableBody");
        if (!body) return;

        const stages = getPlanStages();

        if (!stages.length) {
            body.innerHTML = `<tr><td colspan="10" class="empty-cell">No production stages found.</td></tr>`;
            return;
        }

        body.innerHTML = stages.map(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;

            return `
                <tr>
                    <td><strong>${App.escapeHtml(stage.stageName || stage.name)}</strong></td>
                    <td>${App.escapeHtml(stage.workCenter || stage.department || "-")}</td>
                    <td>${App.formatDate(stage.plannedStartDate || state.plan?.plannedStartDate)}</td>
                    <td>${App.formatDate(stage.plannedEndDate || state.plan?.plannedCompletionDate)}</td>
                    <td>${App.formatDate(stage.actualStartDate)}</td>
                    <td>${App.formatDate(stage.actualEndDate)}</td>
                    <td>${Number(stage.completedQty || 0).toLocaleString()}</td>
                    <td>${Number(stage.rejectedQty || 0).toLocaleString()}</td>
                    <td>${App.badge(stage.status || "Not Started")}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary" data-edit-stage="${App.escapeHtml(id)}">
                            Update
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        App.qsa("[data-edit-stage]", body).forEach(function (btn) {
            btn.addEventListener("click", function () {
                const id = btn.getAttribute("data-edit-stage");
                App.setValue("#stageDropdown", id);
                selectStage(id);
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function selectStage(stageId) {
        const stages = getPlanStages();

        state.selectedStage = stages.find(function (stage, index) {
            const id = stage.stageId || stage.id || `stage-${index + 1}`;
            return String(id) === String(stageId);
        }) || null;

        if (!state.selectedStage) {
            clearForm(false);
            return;
        }

        App.setValue("#selectedStageNameInput", state.selectedStage.stageName || state.selectedStage.name);
        App.setValue("#stageStatus", state.selectedStage.status || "Not Started");
        App.setValue("#actualStartDate", App.toInputDate(state.selectedStage.actualStartDate));
        App.setValue("#actualEndDate", App.toInputDate(state.selectedStage.actualEndDate));
        App.setValue("#completedQty", state.selectedStage.completedQty || 0);
        App.setValue("#rejectedQty", state.selectedStage.rejectedQty || 0);
        App.setValue("#remarks", state.selectedStage.remarks || "");

        const plannedStart = state.selectedStage.plannedStartDate || state.plan?.plannedStartDate;
        const plannedEnd = state.selectedStage.plannedEndDate || state.plan?.plannedCompletionDate;

        App.setValue(
            "#stagePlannedDateRange",
            `${App.formatDate(plannedStart)} - ${App.formatDate(plannedEnd)}`
        );

        calculateActualDuration();
        validateStageForm();
    }

    function calculateActualDuration() {
        const start = App.value("#actualStartDate");
        const end = App.value("#actualEndDate");
        const days = Math.max(App.dateDiffDays(start, end), 0);

        App.setValue("#actualDuration", `${days} days`);
    }

    function validateStageForm() {
        const stageId = App.value("#stageDropdown");
        const status = App.value("#stageStatus");
        const actualStart = App.value("#actualStartDate");
        const actualEnd = App.value("#actualEndDate");
        const completedQty = App.number(App.value("#completedQty"));
        const rejectedQty = App.number(App.value("#rejectedQty"));
        const planQty = App.number(state.plan?.quantity || state.plan?.totalQuantity || 0);
        const totalProcessed = completedQty + rejectedQty;

        App.setValue("#totalProcessedQty", totalProcessed);

        const message = document.getElementById("stageValidationMessage");
        if (!message) return true;

        message.classList.remove("success", "warning", "danger");

        if (!stageId) {
            message.textContent = "Select a stage to update progress.";
            message.classList.add("warning");
            return false;
        }

        if (!status) {
            message.textContent = "Please select stage status.";
            message.classList.add("danger");
            return false;
        }

        if (actualStart && actualEnd && new Date(actualEnd) < new Date(actualStart)) {
            message.textContent = "Actual end date cannot be before actual start date.";
            message.classList.add("danger");
            return false;
        }

        if (status === "In Progress" && !actualStart) {
            message.textContent = "Actual start date is required when stage is in progress.";
            message.classList.add("danger");
            return false;
        }

        if (status === "Completed" && !actualEnd) {
            message.textContent = "Actual end date is required when stage is completed.";
            message.classList.add("danger");
            return false;
        }

        if (status === "Completed" && completedQty <= 0) {
            message.textContent = "Completed quantity must be greater than zero when stage is completed.";
            message.classList.add("danger");
            return false;
        }

        if (planQty > 0 && totalProcessed > planQty) {
            message.textContent = "Completed plus rejected quantity cannot exceed total plan quantity.";
            message.classList.add("danger");
            return false;
        }

        message.textContent = "Stage update looks valid.";
        message.classList.add("success");
        return true;
    }

    function clearForm(showToast) {
        App.setValue("#stageDropdown", "");
        App.setValue("#selectedStageNameInput", "");
        App.setValue("#stageStatus", "");
        App.setValue("#stagePlannedDateRange", "-");
        App.setValue("#actualStartDate", "");
        App.setValue("#actualEndDate", "");
        App.setValue("#actualDuration", "0 days");
        App.setValue("#completedQty", 0);
        App.setValue("#rejectedQty", 0);
        App.setValue("#totalProcessedQty", 0);
        App.setValue("#remarks", "");

        state.selectedStage = null;

        const message = document.getElementById("stageValidationMessage");
        if (message) {
            message.classList.remove("success", "danger");
            message.classList.add("warning");
            message.textContent = "Select a stage to update progress.";
        }

        if (showToast !== false) {
            App.toast("Stage form cleared.", "success");
        }
    }
})();