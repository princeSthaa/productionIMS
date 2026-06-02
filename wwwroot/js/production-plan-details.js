(function () {
    "use strict";

    const state = {
        plans: [],
        products: [],
        customers: [],
        outlets: [],
        warehouses: [],
        materials: [],
        bom: [],
        stages: [],
        plan: null,
        product: null
    };

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        state.plans = App.getData("mockProductionPlans", "productionPlans", "plans");
        state.products = App.getData("products", "mockProducts", "productData");
        state.customers = App.getData("customers", "mockCustomers", "customerData");
        state.outlets = App.getData("outlets", "mockOutlets", "outletData");
        state.warehouses = App.getData("warehouses", "mockWarehouses", "warehouseData");
        state.materials = App.getData("materials", "mockMaterials", "materialData");
        state.bom = App.getData("bom", "mockBom", "billOfMaterials", "bomItems");
        state.stages = App.getData("productionStages", "mockProductionStages", "stages");

        bindTabs();
        loadPlan();
        renderDetails();
    }

    function bindTabs() {
        App.qsa(".pp-tab").forEach(function (tab) {
            tab.addEventListener("click", function () {
                const target = tab.getAttribute("data-tab");

                App.qsa(".pp-tab").forEach(function (item) {
                    item.classList.remove("active");
                });

                App.qsa(".pp-tab-panel").forEach(function (panel) {
                    panel.classList.remove("active");
                });

                tab.classList.add("active");
                const panel = document.getElementById(target);
                if (panel) panel.classList.add("active");
            });
        });
    }

    function loadPlan() {
        const id = App.value("#selectedPlanId");
        state.plan = App.findById(state.plans, id) || state.plans[0] || null;

        if (state.plan) {
            state.product = App.findById(state.products, state.plan.productId);
        }
    }

    function renderDetails() {
        if (!state.plan) {
            App.setText("#detailsPlanNo", "Plan not found");
            App.setText("#detailsPlanSubtitle", "No matching mock production plan was found.");
            return;
        }

        renderSummary();
        renderOverview();
        renderSourceDetails();
        renderMaterials();
        renderStages();
        renderSizes();
        renderActivity();
    }

    function renderSummary() {
        const plan = state.plan;
        const productName = plan.productName || state.product?.name || state.product?.productName || "-";

        App.setText("#detailsPlanNo", plan.planNo || plan.planId);
        App.setText("#detailsPlanSubtitle", `${productName} • ${plan.demandType || "-"}`);

        const badge = document.getElementById("detailsStatusBadge");
        if (badge) badge.outerHTML = App.badge(plan.status);

        App.setText("#summaryDemandType", plan.demandType);
        App.setText("#summarySourceName", getSourceName());
        App.setText("#summaryProduct", productName);
        App.setText("#summaryQuantity", Number(plan.quantity || plan.totalQuantity || 0).toLocaleString());
        App.setText("#summaryStartDate", App.formatDate(plan.plannedStartDate));
        App.setText("#summaryCompletionDate", App.formatDate(plan.plannedCompletionDate));
        App.setText("#summaryRequiredDate", App.formatDate(plan.requiredDate));
        App.setText("#summaryPriority", plan.priority || "Normal");
    }

    function renderOverview() {
        const plan = state.plan;
        const product = state.product || {};
        const productName = plan.productName || product.name || product.productName || "-";

        App.setText("#overviewPlanNo", plan.planNo || plan.planId);
        App.setText("#overviewPlanDate", App.formatDate(plan.planDate));
        App.setText("#overviewDemandType", plan.demandType);
        App.setText("#overviewSourceName", getSourceName());
        App.setText("#overviewOutputDestination", plan.outputDestination || "-");
        App.setText("#overviewStatus", plan.status);

        App.setText("#productCode", product.productCode || product.code || plan.productId);
        App.setText("#productName", productName);
        App.setText("#productCategory", product.category || "-");
        App.setText("#productVariant", plan.variant || plan.color || "-");
        App.setText("#productQuantity", Number(plan.quantity || plan.totalQuantity || 0).toLocaleString());

        const img = document.getElementById("productImage");
        if (img) {
            img.src = product.imagePath || product.image || "/images/products/placeholder.png";
            img.alt = productName;
        }

        App.setText("#datePlanDate", App.formatDate(plan.planDate));
        App.setText("#dateStartDate", App.formatDate(plan.plannedStartDate));
        App.setText("#dateCompletionDate", App.formatDate(plan.plannedCompletionDate));
        App.setText("#dateRequiredDate", App.formatDate(plan.requiredDate));
        App.setText("#dateBufferDays", `${Math.max(App.dateDiffDays(plan.plannedCompletionDate, plan.requiredDate), 0)} days`);
    }

    function getSourceName() {
        const plan = state.plan;
        return plan.sourceName
            || plan.customerName
            || plan.outletName
            || plan.warehouseName
            || getSourceObject()?.name
            || getSourceObject()?.customerName
            || getSourceObject()?.outletName
            || getSourceObject()?.warehouseName
            || "-";
    }

    function getSourceObject() {
        const plan = state.plan;

        if (plan.demandType === "Customer Order") {
            return App.findById(state.customers, plan.customerId || plan.sourceId);
        }

        if (plan.demandType === "Outlet Replenishment") {
            return App.findById(state.outlets, plan.outletId || plan.sourceId);
        }

        if (plan.demandType === "In-house Stock") {
            return App.findById(state.warehouses, plan.warehouseId || plan.sourceId);
        }

        return null;
    }

    function renderSourceDetails() {
        const source = getSourceObject() || {};
        const plan = state.plan;

        if (plan.demandType === "Customer Order") {
            App.setText("#sourceDetailTitle", "Customer Details");
            App.setText("#sourceCode", source.customerCode || source.code || plan.sourceId);
            App.setText("#sourceDetailName", source.name || source.customerName || plan.sourceName);
            App.setText("#sourcePhone", source.phone);
            App.setText("#sourceLocation", source.deliveryLocation || source.address);
            App.setText("#sourceExtra", source.paymentTerms || "Payment terms not set");
            return;
        }

        if (plan.demandType === "Outlet Replenishment") {
            App.setText("#sourceDetailTitle", "Outlet Details");
            App.setText("#sourceCode", source.outletCode || source.code || plan.sourceId);
            App.setText("#sourceDetailName", source.name || source.outletName || plan.sourceName);
            App.setText("#sourcePhone", source.phone);
            App.setText("#sourceLocation", source.location);
            App.setText("#sourceExtra", source.manager ? `Manager: ${source.manager}` : "-");
            return;
        }

        App.setText("#sourceDetailTitle", "In-house Stock Details");
        App.setText("#sourceCode", source.warehouseCode || source.code || plan.warehouseId);
        App.setText("#sourceDetailName", source.name || source.warehouseName || plan.sourceName || "Internal Stock");
        App.setText("#sourcePhone", source.phone || "-");
        App.setText("#sourceLocation", source.location || "-");
        App.setText("#sourceExtra", plan.inHouseReason || plan.reason || "Stock Replenishment");
    }

    function renderMaterials() {
        const body = document.getElementById("detailsMaterialBody");
        if (!body) return;

        const plan = state.plan;
        const quantity = Number(plan.quantity || plan.totalQuantity || 0);

        const bomItems = state.bom.filter(function (item) {
            return String(item.productId) === String(plan.productId);
        });

        if (!bomItems.length) {
            body.innerHTML = `<tr><td colspan="8" class="empty-cell">No BOM found for this product.</td></tr>`;
            return;
        }

        body.innerHTML = bomItems.map(function (bomItem) {
            const material = App.findById(state.materials, bomItem.materialId);
            const baseQty = quantity * Number(bomItem.qtyPerUnit || 0);
            const requiredQty = baseQty + (baseQty * Number(bomItem.wastagePercent || 0) / 100);
            const availableQty = Number(material?.availableQty ?? material?.availableStock ?? material?.stock ?? 0);
            const shortageQty = Math.max(requiredQty - availableQty, 0);
            const status = shortageQty > 0 ? "Shortage" : "OK";

            return `
                <tr>
                    <td>${App.escapeHtml(material?.materialCode || material?.code || bomItem.materialId)}</td>
                    <td><strong>${App.escapeHtml(material?.name || material?.materialName || "-")}</strong></td>
                    <td>${App.escapeHtml(material?.type || material?.materialType || "-")}</td>
                    <td>${requiredQty.toFixed(2)}</td>
                    <td>${availableQty.toFixed(2)}</td>
                    <td>${shortageQty.toFixed(2)}</td>
                    <td>${App.escapeHtml(bomItem.unit || material?.unit || "-")}</td>
                    <td>${App.badge(status)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderStages() {
        const body = document.getElementById("detailsStagesBody");
        const strip = document.getElementById("stageProgressStrip");
        if (!body || !strip) return;

        const planStages = state.plan.stages && state.plan.stages.length
            ? state.plan.stages
            : state.stages;

        strip.innerHTML = planStages.map(function (stage) {
            const status = stage.status || "Not Started";
            const cls = status === "Completed"
                ? "completed"
                : status === state.plan.status || status === "In Progress"
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

        body.innerHTML = planStages.map(function (stage) {
            return `
                <tr>
                    <td><strong>${App.escapeHtml(stage.stageName || stage.name)}</strong></td>
                    <td>${App.escapeHtml(stage.workCenter || stage.department || "-")}</td>
                    <td>${App.formatDate(stage.plannedStartDate || state.plan.plannedStartDate)}</td>
                    <td>${App.formatDate(stage.plannedEndDate || state.plan.plannedCompletionDate)}</td>
                    <td>${App.formatDate(stage.actualStartDate)}</td>
                    <td>${App.formatDate(stage.actualEndDate)}</td>
                    <td>${Number(stage.completedQty || 0).toLocaleString()}</td>
                    <td>${Number(stage.rejectedQty || 0).toLocaleString()}</td>
                    <td>${App.badge(stage.status || "Not Started")}</td>
                </tr>
            `;
        }).join("");
    }

    function renderSizes() {
        const sizes = state.plan.sizes || state.plan.sizeBreakdown || {};
        const quantity = Number(state.plan.quantity || state.plan.totalQuantity || 0);

        const xs = Number(sizes.XS || sizes.xs || 0);
        const s = Number(sizes.S || sizes.s || 0);
        const m = Number(sizes.M || sizes.m || 0);
        const l = Number(sizes.L || sizes.l || 0);
        const xl = Number(sizes.XL || sizes.xl || 0);
        const xxl = Number(sizes.XXL || sizes.xxl || 0);

        const total = xs + s + m + l + xl + xxl;

        App.setText("#sizeXS", xs);
        App.setText("#sizeS", s);
        App.setText("#sizeM", m);
        App.setText("#sizeL", l);
        App.setText("#sizeXL", xl);
        App.setText("#sizeXXL", xxl);
        App.setText("#detailsSizeTotal", total);
        App.setText("#detailsPlanQuantity", quantity);

        const msg = document.getElementById("detailsSizeMessage");
        if (msg) {
            msg.classList.remove("success", "warning", "danger");

            if (total === quantity) {
                msg.textContent = "Size breakdown matches plan quantity.";
                msg.classList.add("success");
            } else {
                msg.textContent = `Size total does not match plan quantity. Difference: ${quantity - total}`;
                msg.classList.add("danger");
            }
        }
    }

    function renderActivity() {
        const timeline = document.getElementById("activityTimeline");
        if (!timeline) return;

        const activities = state.plan.activities || [
            {
                title: "Plan created",
                text: `${state.plan.planNo || state.plan.planId} was created as a mock production plan.`
            },
            {
                title: "Material requirement calculated",
                text: "BOM and material master data were used for material preview."
            },
            {
                title: "Stage plan generated",
                text: "Default garment production stages were loaded for this plan."
            }
        ];

        timeline.innerHTML = activities.map(function (item) {
            return `
                <div class="activity-item">
                    <span class="activity-dot"></span>
                    <div>
                        <strong>${App.escapeHtml(item.title)}</strong>
                        <p>${App.escapeHtml(item.text || item.description || "")}</p>
                    </div>
                </div>
            `;
        }).join("");
    }
})();