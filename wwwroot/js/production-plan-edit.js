(function () {
    "use strict";

    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=640&q=80";

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
        planProducts: []
    };

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        state.plans = App.getData("mockProductionPlans", "productionPlans", "plans");
        state.products = App.getData("products", "mockProducts", "productData");
        state.customers = App.getData("customers", "mockCustomers", "customerData", "customerMasterData", "customerOrderCatalogData");
        state.outlets = App.getData("outlets", "mockOutlets", "outletData");
        state.warehouses = App.getData("warehouses", "mockWarehouses", "warehouseData");
        state.materials = App.getData("materials", "mockMaterials", "materialData");
        state.bom = App.getData("bomMasterData", "bomData", "boms", "bom", "mockBom", "billOfMaterials", "bomItems");
        state.stages = App.getData("productionStages", "mockProductionStages", "stages");

        loadPlan();
        populateDropdowns();
        fillForm();
        bindEvents();
        renderSourceSections();
        renderProductLines();
        renderStages();
        refreshTotals();
        renderMaterialRequirements();
        applyEditability();
    }

    function loadPlan() {
        const id = App.value("#selectedPlanId");
        state.plan = App.findById(state.plans, id) || state.plans[0] || null;
        state.planProducts = state.plan ? normalizePlanProducts(state.plan) : [];
    }

    function populateDropdowns() {
        populateProductDropdown();
        populateWarehouseDropdown();
    }

    function populateProductDropdown() {
        const dropdown = document.getElementById("productDropdown");
        if (!dropdown) return;

        const options = [];

        state.planProducts.forEach(function (product) {
            options.push({
                id: product.productId || product.productCode,
                name: product.productName
            });
        });

        state.products.forEach(function (product) {
            options.push({
                id: product.productId || product.id || product.productCode,
                name: product.productName || product.name
            });
        });

        const seen = new Set();
        dropdown.innerHTML = `<option value="">Select Product</option>` + options.filter(function (item) {
            const key = String(item.id || "");
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).map(function (item) {
            return `<option value="${App.escapeHtml(item.id)}">${App.escapeHtml(item.name || item.id)}</option>`;
        }).join("");
    }

    function populateWarehouseDropdown() {
        const dropdown = document.getElementById("warehouseDropdown");
        if (!dropdown) return;

        dropdown.innerHTML = `<option value="">Select Warehouse</option>` + state.warehouses.map(function (warehouse) {
            const id = warehouse.warehouseId || warehouse.id;
            const name = warehouse.warehouseName || warehouse.name || id;
            return `<option value="${App.escapeHtml(id)}">${App.escapeHtml(name)}</option>`;
        }).join("");
    }

    function fillForm() {
        if (!state.plan) {
            App.setText("#editStatusBadge", "Not Found");
            return;
        }

        const plan = state.plan;
        const firstProduct = state.planProducts[0] || {};

        App.setValue("#PlanId", plan.planId || plan.planNo || plan.id || "");
        App.setValue("#planNo", plan.planNo || plan.planId || "");
        App.setValue("#planDate", App.toInputDate(plan.planDate));
        App.setValue("#demandType", plan.demandType || "");
        App.setValue("#customerId", plan.customerId || "");
        App.setValue("#outletId", plan.outletId || "");
        App.setValue("#inHouseReason", plan.inHouseReason || plan.reason || "");
        App.setValue("#warehouseDropdown", plan.warehouseId || plan.sourceId || "");
        App.setValue("#productDropdown", firstProduct.productId || firstProduct.productCode || "");
        App.setValue("#variantDropdown", firstProduct.variant || "");
        App.setValue("#totalQuantity", getPlanQuantity());
        App.setValue("#priority", plan.priority || "Normal");
        App.setValue("#outputDestination", plan.outputDestination || "");
        App.setValue("#requiredDate", App.toInputDate(plan.requiredDate || getMaxProductDate("requiredDate")));
        App.setValue("#plannedStartDate", App.toInputDate(plan.plannedStartDate || getMinProductDate("plannedStartDate")));
        App.setValue("#plannedCompletionDate", App.toInputDate(plan.plannedCompletionDate || getMaxProductDate("plannedCompletionDate")));
        App.setValue("#planStatus", plan.status || "Draft");

        populateVariantDropdown(firstProduct);

        const badge = document.getElementById("editStatusBadge");
        if (badge) badge.outerHTML = App.badge(plan.status || "Draft");
    }

    function populateVariantDropdown(product) {
        const dropdown = document.getElementById("variantDropdown");
        if (!dropdown) return;

        const variants = new Set();

        if (product?.variant) variants.add(product.variant);

        String(product?.variant || "")
            .split("/")
            .map(function (item) { return item.trim(); })
            .filter(Boolean)
            .forEach(function (variant) { variants.add(variant); });

        getSizeColorRows(product || {}).forEach(function (row) {
            if (row.color && row.color !== "-") variants.add(row.color);
        });

        dropdown.innerHTML = `<option value="">Select Color / Variant</option>` + Array.from(variants).map(function (variant) {
            return `<option value="${App.escapeHtml(variant)}">${App.escapeHtml(variant)}</option>`;
        }).join("");

        if (product?.variant) {
            dropdown.value = product.variant;
        }
    }

    function bindEvents() {
        const demandType = document.getElementById("demandType");
        if (demandType) {
            demandType.addEventListener("change", renderSourceSections);
        }

        const productDropdown = document.getElementById("productDropdown");
        if (productDropdown) {
            productDropdown.addEventListener("change", function () {
                const product = state.planProducts.find(function (item) {
                    return String(item.productId) === String(productDropdown.value)
                        || String(item.productCode) === String(productDropdown.value);
                }) || state.planProducts[0] || {};

                populateVariantDropdown(product);
            });
        }

        ["requiredDate", "plannedStartDate", "plannedCompletionDate"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) input.addEventListener("change", validateDates);
        });

        ["checkMaterialBtn", "checkMaterialBottomBtn"].forEach(function (id) {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener("click", renderMaterialRequirements);
            }
        });

        const form = document.getElementById("editProductionPlanForm");
        if (form) {
            form.addEventListener("submit", function (event) {
                if (!isEditable()) {
                    event.preventDefault();
                    App.toast("Only Draft plans can be edited.", "warning");
                    return;
                }

                refreshTotals();

                if (!validateDates() || !validateSizes()) {
                    event.preventDefault();
                }
            });
        }
    }

    function renderSourceSections() {
        const demandType = App.value("#demandType");

        App.hide("#customerSection");
        App.hide("#outletSection");
        App.hide("#inHouseSection");

        if (demandType === "Customer Order") {
            App.show("#customerSection");
            renderCustomerCard();
            return;
        }

        if (demandType === "Outlet Replenishment") {
            App.show("#outletSection");
            renderOutletCard();
            return;
        }

        if (demandType === "In-house Stock") {
            App.show("#inHouseSection");
        }
    }

    function renderCustomerCard() {
        const customer = getSourceObject() || {};
        App.show("#selectedCustomerCard");
        App.setText("#selectedCustomerCode", customer.customerCode || customer.code || state.plan?.sourceId || "-");
        App.setText("#selectedCustomerName", customer.customerName || customer.name || state.plan?.sourceName || "-");
        App.setText("#selectedCustomerPhone", customer.phone || "-");
        App.setText("#selectedCustomerAddress", customer.address || "-");
        App.setText("#selectedCustomerPaymentTerms", customer.paymentTerms || "-");
        App.setText("#selectedCustomerDeliveryLocation", customer.deliveryLocation || customer.address || "-");
    }

    function renderOutletCard() {
        const outlet = getSourceObject() || {};
        App.show("#selectedOutletCard");
        App.setText("#selectedOutletCode", outlet.outletCode || outlet.code || state.plan?.sourceId || "-");
        App.setText("#selectedOutletName", outlet.outletName || outlet.name || state.plan?.sourceName || "-");
        App.setText("#selectedOutletLocation", outlet.location || "-");
        App.setText("#selectedOutletManager", outlet.manager || "-");
        App.setText("#selectedOutletPhone", outlet.phone || "-");
    }

    function renderProductLines() {
        const list = document.getElementById("editProductList");
        if (!list) return;

        if (!state.planProducts.length) {
            list.innerHTML = `<div class="empty-cell">No products found for this plan.</div>`;
            return;
        }

        list.innerHTML = state.planProducts.map(function (product, productIndex) {
            const image = product.productImage || fallbackProductImage;
            const sizeRows = getSizeColorRows(product);

            return `
                <article class="edit-product-card">
                    <div class="edit-product-head">
                        <img src="${App.escapeHtml(image)}"
                             alt="${App.escapeHtml(product.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />

                        <div>
                            <span>${App.escapeHtml(product.productCode || product.productId || "-")}</span>
                            <h4>${App.escapeHtml(product.productName)}</h4>
                            <p>${App.escapeHtml(product.sourceName || getSourceName())}</p>
                        </div>

                        ${App.badge(product.status || state.plan.status)}
                    </div>

                    <div class="form-grid four-col edit-product-field-grid">
                        <div class="form-group">
                            <label>Variant</label>
                            <input type="text"
                                   class="form-control editable-field edit-product-variant"
                                   data-product-index="${productIndex}"
                                   value="${App.escapeHtml(product.variant || "")}" />
                        </div>

                        <div class="form-group">
                            <label>Quantity</label>
                            <input type="number"
                                   min="0"
                                   class="form-control editable-field edit-product-quantity"
                                   data-product-index="${productIndex}"
                                   value="${Number(product.quantity || 0)}" />
                        </div>

                        <div class="form-group">
                            <label>Required Date</label>
                            <input type="date"
                                   class="form-control editable-field edit-product-required"
                                   data-product-index="${productIndex}"
                                   value="${App.toInputDate(product.requiredDate)}" />
                        </div>

                        <div class="form-group">
                            <label>Planned Finish</label>
                            <input type="date"
                                   class="form-control editable-field edit-product-finish"
                                   data-product-index="${productIndex}"
                                   value="${App.toInputDate(product.plannedCompletionDate)}" />
                        </div>
                    </div>

                    <div class="edit-product-size-table-wrap">
                        <table class="variant-breakdown-table editable-variant-table">
                            <thead>
                                <tr>
                                    <th>Size</th>
                                    <th>Color</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sizeRows.map(function (row, rowIndex) {
                                    return `
                                        <tr>
                                            <td>${App.escapeHtml(row.size)}</td>
                                            <td><span class="variant-chip">${App.escapeHtml(row.color)}</span></td>
                                            <td>
                                                <input type="number"
                                                       min="0"
                                                       class="form-control editable-field edit-product-size-qty"
                                                       data-product-index="${productIndex}"
                                                       data-size-row-index="${rowIndex}"
                                                       value="${Number(row.quantity || 0)}" />
                                            </td>
                                        </tr>
                                    `;
                                }).join("") || `<tr><td colspan="3" class="empty-cell">No size/color variants.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </article>
            `;
        }).join("");

        bindProductLineEvents();
    }

    function bindProductLineEvents() {
        App.qsa(".edit-product-variant").forEach(function (input) {
            input.addEventListener("input", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.variant = input.value;
            });
        });

        App.qsa(".edit-product-quantity").forEach(function (input) {
            input.addEventListener("input", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) {
                    product.quantity = Number(input.value || 0);
                    refreshTotals();
                    renderMaterialRequirements();
                }
            });
        });

        App.qsa(".edit-product-required").forEach(function (input) {
            input.addEventListener("change", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.requiredDate = input.value;
                syncPlanDateInputs();
                validateDates();
            });
        });

        App.qsa(".edit-product-finish").forEach(function (input) {
            input.addEventListener("change", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.plannedCompletionDate = input.value;
                syncPlanDateInputs();
                validateDates();
            });
        });

        App.qsa(".edit-product-size-qty").forEach(function (input) {
            input.addEventListener("input", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                const rowIndex = Number(input.dataset.sizeRowIndex);

                if (product) {
                    updateProductSizeRow(product, rowIndex, Number(input.value || 0));
                    product.quantity = getProductSizeTotal(product);

                    const qtyInput = document.querySelector(`.edit-product-quantity[data-product-index="${input.dataset.productIndex}"]`);
                    if (qtyInput) qtyInput.value = product.quantity;
                }

                refreshTotals();
                renderMaterialRequirements();
            });
        });
    }

    function renderStages() {
        const body = document.getElementById("productionStagesBody");
        if (!body) return;

        const stages = state.plan?.stages && state.plan.stages.length
            ? state.plan.stages
            : state.stages;

        if (!stages.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No production stages found.</td></tr>`;
            return;
        }

        body.innerHTML = stages.map(function (stage) {
            return `
                <tr>
                    <td><strong>${App.escapeHtml(stage.stageName || stage.name)}</strong></td>
                    <td>${App.escapeHtml(stage.workCenter || stage.department || "-")}</td>
                    <td>${App.formatDate(stage.plannedStartDate || state.plan?.plannedStartDate)}</td>
                    <td>${App.formatDate(stage.plannedEndDate || state.plan?.plannedCompletionDate)}</td>
                    <td>${App.badge(stage.status || "Not Started")}</td>
                </tr>
            `;
        }).join("");
    }

    function renderMaterialRequirements() {
        const body = document.getElementById("materialRequirementBody");
        if (!body) return;

        const rows = calculateMaterialRequirements(state.planProducts);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="8" class="empty-cell">No BOM/material data found for this plan.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            const status = row.shortageQty > 0 ? "Shortage" : "Available";

            return `
                <tr>
                    <td>${App.escapeHtml(row.materialCode)}</td>
                    <td><strong>${App.escapeHtml(row.materialName)}</strong></td>
                    <td>${App.escapeHtml(row.materialType)}</td>
                    <td>${formatNumber(row.requiredQty)}</td>
                    <td>${formatNumber(row.availableQty)}</td>
                    <td>${formatNumber(row.shortageQty)}</td>
                    <td>${App.escapeHtml(row.unit)}</td>
                    <td>${App.badge(status)}</td>
                </tr>
            `;
        }).join("");
    }

    function refreshTotals() {
        const sizeTotals = getAggregateSizeTotals();
        const totalQty = getPlanQuantity();

        App.setValue("#totalQuantity", totalQty);
        App.setValue("#sizeXS", sizeTotals.XS || 0);
        App.setValue("#sizeS", sizeTotals.S || 0);
        App.setValue("#sizeM", sizeTotals.M || 0);
        App.setValue("#sizeL", sizeTotals.L || 0);
        App.setValue("#sizeXL", sizeTotals.XL || 0);
        App.setValue("#sizeXXL", sizeTotals.XXL || 0);

        validateSizes();
        validateDates();
    }

    function validateSizes() {
        const totalQty = Number(App.value("#totalQuantity") || 0);
        const sizeTotal = Object.values(getAggregateSizeTotals()).reduce(function (sum, qty) {
            return sum + Number(qty || 0);
        }, 0);

        App.setText("#sizeTotal", formatNumber(sizeTotal));
        App.setText("#sizeDifference", formatNumber(totalQty - sizeTotal));

        const message = document.getElementById("sizeValidationMessage");
        if (!message) return true;

        message.classList.remove("success", "warning", "danger");

        if (totalQty === sizeTotal) {
            message.textContent = "Aggregate size and color breakdown matches total plan quantity.";
            message.classList.add("success");
            return true;
        }

        message.textContent = `Aggregate size total differs from total plan quantity by ${formatNumber(totalQty - sizeTotal)}.`;
        message.classList.add("danger");
        return false;
    }

    function validateDates() {
        const planDate = App.value("#planDate");
        const requiredDate = App.value("#requiredDate");
        const startDate = App.value("#plannedStartDate");
        const completionDate = App.value("#plannedCompletionDate");
        const bufferDays = Math.max(App.dateDiffDays(completionDate, requiredDate), 0);

        App.setValue("#bufferDays", `${bufferDays} days`);

        const message = document.getElementById("dateValidationMessage");
        if (!message) return true;

        message.classList.remove("success", "warning", "danger");

        if (!requiredDate || !startDate || !completionDate) {
            message.textContent = "Select dates to validate production schedule.";
            message.classList.add("warning");
            return false;
        }

        if (planDate && new Date(startDate) < new Date(planDate)) {
            message.textContent = "Planned start date cannot be before plan date.";
            message.classList.add("danger");
            return false;
        }

        if (new Date(completionDate) < new Date(startDate)) {
            message.textContent = "Planned completion date cannot be before planned start date.";
            message.classList.add("danger");
            return false;
        }

        if (new Date(completionDate) > new Date(requiredDate)) {
            message.textContent = "Planned completion date cannot be after required date.";
            message.classList.add("danger");
            return false;
        }

        message.textContent = "Production dates look valid.";
        message.classList.add("success");
        return true;
    }

    function applyEditability() {
        if (isEditable()) {
            App.hide("#notEditableWarning");
            return;
        }

        App.show("#notEditableWarning");

        App.qsa(".editable-field, .editable-action").forEach(function (element) {
            element.disabled = true;
            element.classList.add("disabled");
        });
    }

    function isEditable() {
        return String(state.plan?.status || "Draft").toLowerCase() === "draft";
    }

    function normalizePlanProducts(plan) {
        const rawProducts = Array.isArray(plan.products) && plan.products.length
            ? plan.products
            : [plan];

        return rawProducts.map(function (product, index) {
            const catalogProduct = getCatalogProduct(product) || {};

            return {
                lineId: product.lineId || `${plan.planNo || plan.planId || "PLAN"}-${index + 1}`,
                productId: product.productId || plan.productId || catalogProduct.productId || catalogProduct.id || "",
                productCode: product.productCode || product.productId || plan.productId || catalogProduct.productCode || "",
                productName: product.productName || product.product || plan.productName || catalogProduct.productName || catalogProduct.name || "-",
                category: product.category || plan.category || catalogProduct.category || "-",
                variant: product.variant || product.color || plan.variant || plan.color || "-",
                quantity: Number(product.quantity || product.qty || plan.quantity || plan.totalQuantity || 0),
                sourceName: product.sourceName || product.source || plan.sourceName || getSourceName(),
                requiredDate: product.requiredDate || plan.requiredDate || "",
                plannedStartDate: product.plannedStartDate || product.plannedStart || plan.plannedStartDate || "",
                plannedCompletionDate: product.plannedCompletionDate || product.plannedFinish || plan.plannedCompletionDate || "",
                status: product.status || plan.status || "Draft",
                priority: product.priority || plan.priority || "Normal",
                productImage: product.productImage || product.imagePath || product.image || catalogProduct.productImage || catalogProduct.imagePath || fallbackProductImage,
                productionNotes: product.productionNotes || plan.productionNotes || "",
                sizes: cloneSizes(product.sizes || product.sizeBreakdown || plan.sizes || plan.sizeBreakdown || [])
            };
        });
    }

    function cloneSizes(sizes) {
        return JSON.parse(JSON.stringify(sizes || []));
    }

    function getSourceName() {
        const plan = state.plan || {};
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
        const plan = state.plan || {};

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

    function getCatalogProduct(product) {
        const candidates = [
            product.productId,
            product.productCode,
            product.id,
            product.code
        ].filter(Boolean).map(String);

        return state.products.find(function (item) {
            return candidates.includes(String(item.id))
                || candidates.includes(String(item.productId))
                || candidates.includes(String(item.productCode))
                || candidates.includes(String(item.code));
        });
    }

    function calculateMaterialRequirements(products) {
        const grouped = {};

        products.forEach(function (product) {
            getBomItemsForProduct(product).forEach(function (bomItem) {
                const material = getMaterialById(bomItem.materialId);
                const baseQty = Number(product.quantity || 0) * Number(bomItem.qtyPerUnit || 0);
                const requiredQty = baseQty + (baseQty * Number(bomItem.wastagePercent || 0) / 100);
                const key = material.materialId || material.id || bomItem.materialId;

                if (!grouped[key]) {
                    grouped[key] = {
                        materialCode: material.materialCode || material.code || bomItem.materialId,
                        materialName: material.name || material.materialName || "Unknown Material",
                        materialType: material.type || material.materialType || "Material",
                        requiredQty: 0,
                        availableQty: Number(material.availableQty ?? material.availableStock ?? material.stock ?? 0),
                        shortageQty: 0,
                        unit: bomItem.unit || material.unit || "-"
                    };
                }

                grouped[key].requiredQty += requiredQty;
            });
        });

        return Object.values(grouped).map(function (row) {
            row.shortageQty = Math.max(row.requiredQty - row.availableQty, 0);
            return row;
        });
    }

    function getBomItemsForProduct(product) {
        const catalogProduct = getCatalogProduct(product) || {};
        const candidates = [
            product.productId,
            product.productCode,
            catalogProduct.id,
            catalogProduct.productId,
            catalogProduct.productCode
        ].filter(Boolean).map(String);

        return state.bom.filter(function (item) {
            return candidates.includes(String(item.productId))
                || candidates.includes(String(item.ProductId))
                || candidates.includes(String(item.productCode))
                || candidates.includes(String(item.ProductCode));
        });
    }

    function getMaterialById(materialId) {
        return state.materials.find(function (material) {
            return String(material.id) === String(materialId)
                || String(material.materialId) === String(materialId)
                || String(material.materialCode) === String(materialId)
                || String(material.code) === String(materialId);
        }) || {
            id: materialId,
            materialId: materialId,
            materialCode: materialId,
            name: "Unknown Material",
            materialName: "Unknown Material",
            type: "Material",
            materialType: "Material",
            unit: "pcs",
            availableQty: 0
        };
    }

    function getAggregateSizeTotals() {
        const totals = {};

        state.planProducts.forEach(function (product) {
            getSizeColorRows(product).forEach(function (row) {
                totals[row.size] = (totals[row.size] || 0) + Number(row.quantity || 0);
            });
        });

        return totals;
    }

    function getSizeColorRows(product) {
        const sizes = product.sizes || [];

        if (!Array.isArray(sizes)) {
            return Object.entries(sizes).map(function ([size, qty]) {
                return {
                    size: size,
                    color: product.variant || "-",
                    quantity: Number(qty || 0)
                };
            });
        }

        const rows = [];

        sizes.forEach(function (sizeRow, sizeIndex) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            if (colorRows.length) {
                colorRows.forEach(function (colorRow, colorIndex) {
                    rows.push({
                        size: sizeRow.size || "-",
                        color: colorRow.color || colorRow.variant || colorRow.name || product.variant || "-",
                        quantity: Number(colorRow.quantity || colorRow.qty || 0),
                        sizeIndex: sizeIndex,
                        colorIndex: colorIndex
                    });
                });

                return;
            }

            rows.push({
                size: sizeRow.size || "-",
                color: sizeRow.color || product.variant || "-",
                quantity: Number(sizeRow.quantity || sizeRow.qty || 0),
                sizeIndex: sizeIndex,
                colorIndex: null
            });
        });

        return rows;
    }

    function updateProductSizeRow(product, rowIndex, value) {
        const row = getSizeColorRows(product)[rowIndex];
        if (!row) return;

        const sizeRow = product.sizes[row.sizeIndex];
        if (!sizeRow) return;

        if (row.colorIndex !== null && sizeRow.colors && sizeRow.colors[row.colorIndex]) {
            sizeRow.colors[row.colorIndex].quantity = value;
            sizeRow.quantity = sizeRow.colors.reduce(function (sum, color) {
                return sum + Number(color.quantity || color.qty || 0);
            }, 0);
            return;
        }

        sizeRow.quantity = value;
    }

    function getProductSizeTotal(product) {
        return getSizeColorRows(product).reduce(function (sum, row) {
            return sum + Number(row.quantity || 0);
        }, 0);
    }

    function getPlanQuantity() {
        return state.planProducts.reduce(function (sum, product) {
            return sum + Number(product.quantity || 0);
        }, 0) || Number(state.plan?.quantity || state.plan?.totalQuantity || 0);
    }

    function syncPlanDateInputs() {
        App.setValue("#requiredDate", App.toInputDate(getMaxProductDate("requiredDate")));
        App.setValue("#plannedStartDate", App.toInputDate(getMinProductDate("plannedStartDate")));
        App.setValue("#plannedCompletionDate", App.toInputDate(getMaxProductDate("plannedCompletionDate")));
    }

    function getMinProductDate(field) {
        return state.planProducts.map(function (product) {
            return product[field];
        }).filter(Boolean).sort()[0] || "";
    }

    function getMaxProductDate(field) {
        const dates = state.planProducts.map(function (product) {
            return product[field];
        }).filter(Boolean).sort();

        return dates[dates.length - 1] || "";
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }
})();
