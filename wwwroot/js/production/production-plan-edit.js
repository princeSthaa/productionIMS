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
        planProducts: [],
        selectedProductIndex: 0,
        productSearch: ""
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
        state.selectedProductIndex = 0;
        state.productSearch = "";
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

        if (dropdown.tagName !== "SELECT") {
            dropdown.value = product?.variant || "";
            renderPalettePreview("#mainVariantPalettePreview", dropdown.value);
            return;
        }

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

        renderPalettePreview("#mainVariantPalettePreview", dropdown.value);
    }

    function bindEvents() {
        const demandType = document.getElementById("demandType");
        if (demandType) {
            demandType.addEventListener("change", renderSourceSections);
        }

        const productDropdown = document.getElementById("productDropdown");
        if (productDropdown) {
            productDropdown.addEventListener("change", function () {
                const selectedIndex = state.planProducts.findIndex(function (item) {
                    return String(item.productId) === String(productDropdown.value)
                        || String(item.productCode) === String(productDropdown.value);
                });

                const product = selectedIndex >= 0
                    ? state.planProducts[selectedIndex]
                    : state.planProducts[0] || {};

                populateVariantDropdown(product);

                if (selectedIndex >= 0) {
                    state.selectedProductIndex = selectedIndex;
                    renderProductLines();
                }
            });
        }

        const variantInput = document.getElementById("variantDropdown");
        if (variantInput) {
            variantInput.addEventListener("input", function () {
                const product = state.planProducts[state.selectedProductIndex] || state.planProducts[0];
                if (product) product.variant = variantInput.value;
                renderPalettePreview("#mainVariantPalettePreview", variantInput.value);
                refreshProductListVariant(state.selectedProductIndex, variantInput.value);
                refreshProductColorCells(state.selectedProductIndex);
            });
        }

        const mainVariantPaletteBtn = document.getElementById("mainVariantPaletteBtn");
        if (mainVariantPaletteBtn && variantInput) {
            mainVariantPaletteBtn.addEventListener("click", function () {
                openPalettePickerForField(variantInput, "#mainVariantPalettePreview");
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
        const host = document.getElementById("editProductList");
        if (!host) return;

        if (!state.planProducts.length) {
            host.innerHTML = `<div class="empty-cell">No products found for this plan.</div>`;
            return;
        }

        const filteredEntries = getFilteredProductEntries();
        ensureSelectedProductForEntries(filteredEntries);

        const selectedProduct = state.planProducts[state.selectedProductIndex] || null;
        const selectedEntryIndex = filteredEntries.findIndex(function (entry) {
            return entry.index === state.selectedProductIndex;
        });
        const selectedRows = selectedProduct ? getSizeColorRows(selectedProduct) : [];
        const selectedSizeTotal = selectedRows.reduce(function (sum, row) {
            return sum + Number(row.quantity || 0);
        }, 0);
        const selectedImage = selectedProduct?.productImage || fallbackProductImage;
        const variantPreview = renderPalettePreviewHtml(selectedProduct?.variant);

        host.innerHTML = `
            <div class="product-editor-workspace">
                <div class="product-editor-summary-strip">
                    <div>
                        <span>Products</span>
                        <strong id="productWorkspaceCount">${formatNumber(state.planProducts.length)}</strong>
                    </div>
                    <div>
                        <span>Total Quantity</span>
                        <strong id="productWorkspaceQty">${formatNumber(getPlanQuantity())} pcs</strong>
                    </div>
                    <div>
                        <span>Size Quantity</span>
                        <strong id="productWorkspaceSizeQty">${formatNumber(getProductWorkspaceSizeTotal())} pcs</strong>
                    </div>
                </div>

                <div class="product-editor-layout">
                    <aside class="product-editor-sidebar">
                        <div class="product-editor-search">
                            <span class="material-symbols-outlined">search</span>
                            <input type="text"
                                   id="editProductSearch"
                                   value="${App.escapeHtml(state.productSearch)}"
                                   placeholder="Search products, code, source, variant" />
                            <button type="button"
                                    id="clearProductSearchBtn"
                                    class="${state.productSearch ? "" : "hidden"}"
                                    aria-label="Clear product search">
                                &times;
                            </button>
                        </div>

                        <div class="product-editor-list-meta">
                            <span>${formatNumber(filteredEntries.length)} of ${formatNumber(state.planProducts.length)} shown</span>
                        </div>

                        <div class="product-editor-list" role="listbox" aria-label="Products in this plan">
                            ${filteredEntries.length ? filteredEntries.map(function (entry, visibleIndex) {
                                return renderProductListRow(entry.product, entry.index, visibleIndex);
                            }).join("") : `<div class="product-editor-empty">No matching products.</div>`}
                        </div>
                    </aside>

                    <section class="product-editor-detail">
                        ${selectedProduct && filteredEntries.length ? `
                            <div class="product-editor-detail-head">
                                <img src="${App.escapeHtml(selectedImage)}"
                                     alt="${App.escapeHtml(selectedProduct.productName)}"
                                     onerror="this.src='${fallbackProductImage}'" />

                                <div>
                                    <span>Product ${formatNumber(selectedEntryIndex + 1)} of ${formatNumber(filteredEntries.length)}</span>
                                    <h4>${App.escapeHtml(selectedProduct.productName)}</h4>
                                    <p>${App.escapeHtml(selectedProduct.productCode || selectedProduct.productId || "-")} | ${App.escapeHtml(selectedProduct.sourceName || getSourceName())}</p>
                                </div>

                                <div class="product-editor-nav">
                                    <button type="button"
                                            class="icon-only-btn"
                                            data-product-step="-1"
                                            ${selectedEntryIndex <= 0 ? "disabled" : ""}
                                            aria-label="Previous product">
                                        <span class="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    <button type="button"
                                            class="icon-only-btn"
                                            data-product-step="1"
                                            ${selectedEntryIndex >= filteredEntries.length - 1 ? "disabled" : ""}
                                            aria-label="Next product">
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            <div class="product-editor-metrics">
                                <div>
                                    <span>Product Qty</span>
                                    <strong id="activeProductQuantityMetric">${formatNumber(selectedProduct.quantity)} pcs</strong>
                                </div>
                                <div>
                                    <span>Size Qty</span>
                                    <strong id="activeProductSizeMetric">${formatNumber(selectedSizeTotal)} pcs</strong>
                                </div>
                                <div>
                                    <span>Status</span>
                                    ${App.badge(selectedProduct.status || state.plan.status)}
                                </div>
                            </div>

                            <div class="form-grid four-col edit-product-field-grid focused-product-fields">
                                <div class="form-group">
                                    <label>Variant</label>
                                    <div class="production-palette-picker-field">
                                        <input type="text"
                                               class="form-control editable-field edit-product-variant"
                                               data-product-index="${state.selectedProductIndex}"
                                               value="${App.escapeHtml(selectedProduct.variant || "")}" />
                                        <button type="button"
                                                class="btn btn-light editable-action edit-product-palette-btn"
                                                data-product-index="${state.selectedProductIndex}">
                                            <span class="material-symbols-outlined">palette</span>
                                            Palette
                                        </button>
                                    </div>
                                    <div class="palette-preview-host edit-product-palette-preview"
                                         data-product-index="${state.selectedProductIndex}"
                                         ${variantPreview ? "" : "hidden"}>
                                        ${variantPreview}
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Quantity</label>
                                    <input type="number"
                                           min="0"
                                           class="form-control editable-field edit-product-quantity"
                                           data-product-index="${state.selectedProductIndex}"
                                           value="${Number(selectedProduct.quantity || 0)}" />
                                </div>

                                <div class="form-group">
                                    <label>Required Date</label>
                                    <input type="date"
                                           class="form-control editable-field edit-product-required"
                                           data-product-index="${state.selectedProductIndex}"
                                           value="${App.toInputDate(selectedProduct.requiredDate)}" />
                                </div>

                                <div class="form-group">
                                    <label>Planned Finish</label>
                                    <input type="date"
                                           class="form-control editable-field edit-product-finish"
                                           data-product-index="${state.selectedProductIndex}"
                                           value="${App.toInputDate(selectedProduct.plannedCompletionDate)}" />
                                </div>
                            </div>

                            <div class="product-size-editor-panel">
                                <div class="product-size-editor-head">
                                    <div>
                                        <h5>Size / Color Quantities</h5>
                                        <p>Edit this product only. Totals update the plan automatically.</p>
                                    </div>
                                    <strong>${formatNumber(selectedRows.length)} rows</strong>
                                </div>

                                <div class="product-size-table-scroll">
                                    <table class="variant-breakdown-table editable-variant-table">
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                <th>Palette / Variant</th>
                                                <th>Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${selectedRows.map(function (row, rowIndex) {
                                                return `
                                                    <tr>
                                                        <td>${App.escapeHtml(row.size)}</td>
                                                        <td data-product-color-cell="${state.selectedProductIndex}"
                                                            data-size-row-index="${rowIndex}">
                                                            ${renderRowPaletteEditor(selectedProduct, row, rowIndex)}
                                                        </td>
                                                        <td>
                                                            <input type="number"
                                                                   min="0"
                                                                   class="form-control editable-field edit-product-size-qty"
                                                                   data-product-index="${state.selectedProductIndex}"
                                                                   data-size-row-index="${rowIndex}"
                                                                   value="${Number(row.quantity || 0)}" />
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join("") || `<tr><td colspan="3" class="empty-cell">No size/color variants.</td></tr>`}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ` : `
                            <div class="product-editor-empty detail">
                                Select a product from the list.
                            </div>
                        `}
                    </section>
                </div>
            </div>
        `;

        bindProductLineEvents();

        if (!isEditable()) {
            applyEditability();
        }
    }

    function bindProductLineEvents() {
        const searchInput = document.getElementById("editProductSearch");
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                const cursor = searchInput.selectionStart || searchInput.value.length;
                state.productSearch = searchInput.value;
                renderProductLines();
                focusProductSearch(cursor);
            });
        }

        const clearSearchBtn = document.getElementById("clearProductSearchBtn");
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener("click", function () {
                state.productSearch = "";
                renderProductLines();
                focusProductSearch(0);
            });
        }

        App.qsa("[data-product-select-index]").forEach(function (button) {
            button.addEventListener("click", function () {
                selectProductForEditing(Number(button.dataset.productSelectIndex));
            });
        });

        App.qsa("[data-product-step]").forEach(function (button) {
            button.addEventListener("click", function () {
                moveSelectedProduct(Number(button.dataset.productStep || 0));
            });
        });

        bindRowPaletteEvents();

        App.qsa(".edit-product-variant").forEach(function (input) {
            input.addEventListener("input", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.variant = input.value;
                renderProductPalettePreview(input.dataset.productIndex, input.value);
                refreshProductListVariant(Number(input.dataset.productIndex), input.value);
                refreshProductColorCells(Number(input.dataset.productIndex));
            });
        });

        App.qsa(".edit-product-palette-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const productIndex = button.dataset.productIndex;
                const input = document.querySelector(`.edit-product-variant[data-product-index="${productIndex}"]`);
                const preview = document.querySelector(`.edit-product-palette-preview[data-product-index="${productIndex}"]`);

                openPalettePickerForField(input, preview, function (palette) {
                    const product = state.planProducts[Number(productIndex)];
                    if (product) product.variant = palette.name;
                });
            });
        });

        App.qsa(".edit-product-quantity").forEach(function (input) {
            input.addEventListener("input", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) {
                    product.quantity = Number(input.value || 0);
                    refreshTotals();
                    renderMaterialRequirements();
                    refreshProductWorkspaceMetrics(Number(input.dataset.productIndex));
                }
            });
        });

        App.qsa(".edit-product-required").forEach(function (input) {
            input.addEventListener("change", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.requiredDate = input.value;
                syncPlanDateInputs();
                validateDates();
                refreshProductListDates(Number(input.dataset.productIndex));
            });
        });

        App.qsa(".edit-product-finish").forEach(function (input) {
            input.addEventListener("change", function () {
                const product = state.planProducts[Number(input.dataset.productIndex)];
                if (product) product.plannedCompletionDate = input.value;
                syncPlanDateInputs();
                validateDates();
                refreshProductListDates(Number(input.dataset.productIndex));
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
                refreshProductWorkspaceMetrics(Number(input.dataset.productIndex));
            });
        });
    }

    function renderProductListRow(product, productIndex, visibleIndex) {
        const activeClass = productIndex === state.selectedProductIndex ? " active" : "";
        const variant = getProductPaletteSummary(product);
        const variantPreview = renderPalettePreviewHtml(variant, { compact: true, inline: true });
        const hasPalettePreview = Boolean(variantPreview);

        return `
            <button type="button"
                    class="product-editor-list-row${activeClass}"
                    data-product-select-index="${productIndex}"
                    role="option"
                    aria-selected="${productIndex === state.selectedProductIndex}">
                <span class="product-editor-list-index">${visibleIndex + 1}</span>
                <span class="product-editor-list-main">
                    <strong>${App.escapeHtml(product.productName)}</strong>
                    <span>${App.escapeHtml(product.productCode || product.productId || "-")}</span>
                    <span class="product-editor-list-variant"
                          data-product-list-variant="${productIndex}"
                          ${hasPalettePreview ? "hidden" : ""}>
                        ${App.escapeHtml(variant)}
                    </span>
                    <span class="palette-preview-host product-editor-list-preview"
                          data-product-list-preview="${productIndex}"
                          ${variantPreview ? "" : "hidden"}>
                        ${variantPreview}
                    </span>
                </span>
                <span class="product-editor-list-side">
                    <strong data-product-list-qty="${productIndex}">${formatNumber(product.quantity)} pcs</strong>
                    <em data-product-list-date="${productIndex}">Req ${App.formatDate(product.requiredDate)}</em>
                </span>
            </button>
        `;
    }

    function getFilteredProductEntries() {
        const search = String(state.productSearch || "").trim().toLowerCase();

        return state.planProducts.map(function (product, index) {
            return {
                product: product,
                index: index
            };
        }).filter(function (entry) {
            if (!search) return true;

            const colorText = getSizeColorRows(entry.product).map(function (row) {
                return [row.color, row.palette].filter(Boolean).join(" ");
            }).join(" ");

            const haystack = [
                entry.product.productName,
                entry.product.productCode,
                entry.product.productId,
                entry.product.variant,
                entry.product.sourceName,
                colorText
            ].join(" ").toLowerCase();

            return haystack.includes(search);
        });
    }

    function ensureSelectedProductForEntries(entries) {
        if (!entries.length) return;

        const hasSelectedProduct = entries.some(function (entry) {
            return entry.index === state.selectedProductIndex;
        });

        if (!hasSelectedProduct) {
            state.selectedProductIndex = entries[0].index;
            syncMainProductFields(entries[0].product);
        }
    }

    function selectProductForEditing(productIndex) {
        const product = state.planProducts[productIndex];
        if (!product) return;

        state.selectedProductIndex = productIndex;
        syncMainProductFields(product);
        renderProductLines();
    }

    function moveSelectedProduct(step) {
        const entries = getFilteredProductEntries();
        if (!entries.length || !step) return;

        const currentIndex = entries.findIndex(function (entry) {
            return entry.index === state.selectedProductIndex;
        });

        const nextIndex = Math.min(Math.max(currentIndex + step, 0), entries.length - 1);
        selectProductForEditing(entries[nextIndex].index);
    }

    function syncMainProductFields(product) {
        if (!product) return;

        App.setValue("#productDropdown", product.productId || product.productCode || "");
        populateVariantDropdown(product);
    }

    function focusProductSearch(cursorPosition) {
        const input = document.getElementById("editProductSearch");
        if (!input) return;

        input.focus();

        const position = Math.min(Number(cursorPosition || 0), input.value.length);
        if (typeof input.setSelectionRange === "function") {
            input.setSelectionRange(position, position);
        }
    }

    function refreshProductWorkspaceMetrics(productIndex) {
        const product = state.planProducts[productIndex];
        if (!product) return;

        App.setText("#productWorkspaceQty", `${formatNumber(getPlanQuantity())} pcs`);
        App.setText("#productWorkspaceSizeQty", `${formatNumber(getProductWorkspaceSizeTotal())} pcs`);

        if (productIndex === state.selectedProductIndex) {
            App.setText("#activeProductQuantityMetric", `${formatNumber(product.quantity)} pcs`);
            App.setText("#activeProductSizeMetric", `${formatNumber(getProductSizeTotal(product))} pcs`);
        }

        const listQty = document.querySelector(`[data-product-list-qty="${productIndex}"]`);
        if (listQty) {
            listQty.textContent = `${formatNumber(product.quantity)} pcs`;
        }
    }

    function refreshProductListVariant(productIndex, value) {
        const product = state.planProducts[productIndex];
        const summary = product ? getProductPaletteSummary(product) : value;
        const variant = document.querySelector(`[data-product-list-variant="${productIndex}"]`);
        const preview = document.querySelector(`[data-product-list-preview="${productIndex}"]`);
        const previewHtml = renderPalettePreviewHtml(summary, { compact: true, inline: true });

        if (variant) {
            variant.textContent = summary || "-";
            variant.hidden = Boolean(previewHtml);
        }

        if (preview) {
            preview.innerHTML = previewHtml;
            preview.hidden = !previewHtml;
            preview.classList.toggle("hidden", !previewHtml);
        }
    }

    function refreshProductListDates(productIndex) {
        const product = state.planProducts[productIndex];
        const date = document.querySelector(`[data-product-list-date="${productIndex}"]`);

        if (product && date) {
            date.textContent = `Req ${App.formatDate(product.requiredDate)}`;
        }
    }

    function refreshProductColorCells(productIndex) {
        const product = state.planProducts[productIndex];
        if (!product) return;

        document.querySelectorAll(`[data-product-color-cell="${productIndex}"]`).forEach(function (cell) {
            const row = getSizeColorRows(product)[Number(cell.dataset.sizeRowIndex)];
            if (row) {
                cell.innerHTML = renderRowPaletteEditor(product, row, Number(cell.dataset.sizeRowIndex));
            }
        });

        bindRowPaletteEvents();
    }

    function bindRowPaletteEvents() {
        App.qsa(".edit-size-palette-btn").forEach(function (button) {
            if (button.dataset.paletteBound === "true") return;

            button.dataset.paletteBound = "true";
            button.addEventListener("click", function () {
                openPalettePickerForSizeRow(
                    Number(button.dataset.productIndex),
                    Number(button.dataset.sizeRowIndex)
                );
            });
        });

        App.qsa(".edit-size-palette-clear").forEach(function (button) {
            if (button.dataset.paletteBound === "true") return;

            button.dataset.paletteBound = "true";
            button.addEventListener("click", function () {
                const productIndex = Number(button.dataset.productIndex);
                const rowIndex = Number(button.dataset.sizeRowIndex);
                const product = state.planProducts[productIndex];
                if (!product) return;

                updateProductSizePalette(product, rowIndex, "");
                refreshProductColorCells(productIndex);
                refreshProductListVariant(productIndex);
            });
        });
    }

    function renderRowPaletteEditor(product, row, rowIndex) {
        const paletteValue = getEffectiveRowPalette(product, row);
        const isOverride = Boolean(row?.palette);

        return `
            <div class="product-row-palette-cell">
                <div class="product-row-palette-chip">
                    ${renderPaletteValueChip(paletteValue)}
                </div>

                <div class="product-row-palette-actions">
                    <button type="button"
                            class="btn btn-light btn-sm editable-action edit-size-palette-btn"
                            data-product-index="${state.selectedProductIndex}"
                            data-size-row-index="${rowIndex}">
                        <span class="material-symbols-outlined">palette</span>
                        Palette
                    </button>
                    <button type="button"
                            class="btn btn-light btn-sm editable-action edit-size-palette-clear ${isOverride ? "" : "hidden"}"
                            data-product-index="${state.selectedProductIndex}"
                            data-size-row-index="${rowIndex}">
                        Default
                    </button>
                </div>
            </div>
        `;
    }

    function openPalettePickerForSizeRow(productIndex, rowIndex) {
        const picker = window.ProductionPalettePicker;
        const product = state.planProducts[productIndex];
        const row = product ? getSizeColorRows(product)[rowIndex] : null;
        if (!picker || !product || !row) return;

        picker.open({
            value: getEffectiveRowPalette(product, row),
            onSelect: function (palette) {
                updateProductSizePalette(product, rowIndex, palette.name);
                refreshProductColorCells(productIndex);
                refreshProductListVariant(productIndex);
            }
        });
    }

    function getEffectiveRowPalette(product, row) {
        return row?.palette || product?.variant || "";
    }

    function getProductPaletteSummary(product) {
        const rowPalettes = getSizeColorRows(product).map(function (row) {
            return getEffectiveRowPalette(product, row);
        }).filter(Boolean);

        const uniquePalettes = Array.from(new Set(rowPalettes));

        if (uniquePalettes.length > 1) return "Mixed palettes";
        if (uniquePalettes.length === 1) return uniquePalettes[0];

        return product.variant || "-";
    }

    function getProductWorkspaceSizeTotal() {
        return state.planProducts.reduce(function (sum, product) {
            return sum + getProductSizeTotal(product);
        }, 0);
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
        const aggregated = {};

        function add(size, palette, qty, sizeIndex, colorIndex) {
            const key = `${size}|${palette}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    size: size,
                    palette: palette,
                    quantity: 0,
                    sizeIndex: sizeIndex,
                    colorIndex: colorIndex
                };
            }
            aggregated[key].quantity += Number(qty || 0);
        }

        if (!Array.isArray(sizes)) {
            Object.entries(sizes).forEach(function ([size, qty], index) {
                add(size, product.variant || "-", qty, index, null);
            });
        } else {
            sizes.forEach(function (sizeRow, sizeIndex) {
                const size = sizeRow.size || "-";
                const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
                const productPalette = product.variant || "-";

                if (colorRows.length) {
                    colorRows.forEach(function (colorRow, colorIndex) {
                        const palette = colorRow.palette || colorRow.paletteName || sizeRow.palette || productPalette;
                        add(size, palette, colorRow.quantity || colorRow.qty || 0, sizeIndex, colorIndex);
                    });
                } else {
                    const palette = sizeRow.palette || sizeRow.paletteName || productPalette;
                    add(size, palette, sizeRow.quantity || sizeRow.qty || 0, sizeIndex, null);
                }
            });
        }

        return Object.values(aggregated);
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

    function updateProductSizePalette(product, rowIndex, palette) {
        const row = getSizeColorRows(product)[rowIndex];
        if (!row || !Array.isArray(product.sizes)) return;

        const sizeRow = product.sizes[row.sizeIndex];
        if (!sizeRow) return;

        const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
        if (row.colorIndex !== null && colorRows[row.colorIndex]) {
            setPaletteValue(colorRows[row.colorIndex], palette);
            return;
        }

        setPaletteValue(sizeRow, palette);
    }

    function setPaletteValue(target, palette) {
        const value = String(palette || "").trim();

        if (value) {
            target.palette = value;
            return;
        }

        delete target.palette;
        delete target.paletteName;
        delete target.colorPalette;
    }

    function getProductSizeTotal(product) {
        return getSizeColorRows(product).reduce(function (sum, row) {
            return sum + Number(row.quantity || 0);
        }, 0);
    }

    function openPalettePickerForField(field, previewTarget, onSelect) {
        const picker = window.ProductionPalettePicker;
        if (!picker || !field) return;

        picker.open({
            value: field.value,
            onSelect: function (palette) {
                picker.setFieldValue(field, palette.name);
                renderPalettePreview(previewTarget, palette.name);

                if (typeof onSelect === "function") {
                    onSelect(palette);
                }
            }
        });
    }

    function renderProductPalettePreview(productIndex, value) {
        const preview = document.querySelector(`.edit-product-palette-preview[data-product-index="${productIndex}"]`);
        renderPalettePreview(preview, value);
    }

    function renderPalettePreview(target, value, options) {
        const host = typeof target === "string" ? document.querySelector(target) : target;
        const picker = window.ProductionPalettePicker;
        if (!host) return;

        if (!picker) {
            host.innerHTML = "";
            host.hidden = true;
            return;
        }

        picker.applyPreview(host, value, options);
    }

    function renderPalettePreviewHtml(value, options) {
        const picker = window.ProductionPalettePicker;
        return picker ? picker.renderPreview(value, options) : "";
    }

    function renderPaletteChip(value) {
        const picker = window.ProductionPalettePicker;
        return picker
            ? picker.renderChip(value)
            : `<span class="variant-chip">${App.escapeHtml(value || "-")}</span>`;
    }

    function renderPaletteValueChip(value) {
        const picker = window.ProductionPalettePicker;
        return picker
            ? picker.renderProductColorChip(value, "")
            : `<span class="variant-chip">${App.escapeHtml(value || "-")}</span>`;
    }

    function renderProductColorChip(product, row) {
        return renderPaletteValueChip(getEffectiveRowPalette(product, row));
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
