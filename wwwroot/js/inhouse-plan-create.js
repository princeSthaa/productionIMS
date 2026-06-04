document.addEventListener("DOMContentLoaded", function () {
    const pageRoot = document.getElementById("inHousePlanPage");
    if (!pageRoot) return;

    const products = window.productMasterData || window.products || window.productsData || [];
    const warehouses = window.warehouses || window.warehouseMasterData || window.warehouseData || [];
    const materials = window.materialMasterData || window.materials || window.materialsData || [];
    const bomData = window.bomMasterData || window.bomData || window.boms || [];

    const productDropdown = document.getElementById("productDropdown");
    const warehouseDropdown = document.getElementById("warehouseDropdown");
    const variantDropdown = document.getElementById("variantDropdown");
    const variantQtyInput = document.getElementById("inhouseVariantQty");
    const addVariantBtn = document.getElementById("addInhouseVariantBtn");
    const variantRowsHost = document.getElementById("inhouseVariantRows");
    const variantSummaryInput = document.getElementById("variantSummaryInput");
    const variantBreakdownJson = document.getElementById("variantBreakdownJson");
    const totalQuantityInput = document.getElementById("totalQuantity");
    const measurementBody = document.getElementById("inhouseMeasurementBody");
    const materialRequirementBody = document.getElementById("materialRequirementBody");
    const form = document.getElementById("productionPlanForm");

    let selectedVariantRows = [];

    initialize();

    function initialize() {
        populateProductDropdown();
        populateWarehouseDropdown();
        renderMeasurementChart(null);
        renderVariantRows();
        resetMaterialTable();
        bindEvents();
        setupNepaliDateFields();
        validateSizes();
        validateDates();
    }

    function populateProductDropdown() {
        if (!productDropdown) return;

        productDropdown.innerHTML = `<option value="">Select Product</option>` + products.map(function (product) {
            const row = normalizeProduct(product);
            return `<option value="${escapeHtml(row.id)}">${escapeHtml(row.name)}</option>`;
        }).join("");
    }

    function populateWarehouseDropdown() {
        if (!warehouseDropdown) return;

        warehouseDropdown.innerHTML = `<option value="">Select Warehouse</option>` + warehouses.map(function (warehouse) {
            const id = warehouse.warehouseId || warehouse.id || warehouse.warehouseCode || "";
            const name = warehouse.warehouseName || warehouse.name || warehouse.warehouseCode || id;
            return `<option value="${escapeHtml(id)}">${escapeHtml(name)}</option>`;
        }).join("");
    }

    function bindEvents() {
        if (productDropdown) {
            productDropdown.addEventListener("change", function () {
                selectedVariantRows = [];
                populateVariantDropdown(getSelectedProduct());
                renderMeasurementChart(getSelectedProduct());
                renderVariantRows();
                resetMaterialTable();
                validateSizes();
            });
        }

        if (addVariantBtn) {
            addVariantBtn.addEventListener("click", addOrUpdateVariantQuantity);
        }

        if (variantRowsHost) {
            variantRowsHost.addEventListener("click", function (event) {
                const button = event.target.closest("[data-remove-inhouse-variant]");
                if (!button) return;

                const variant = button.getAttribute("data-remove-inhouse-variant");
                selectedVariantRows = selectedVariantRows.filter(function (row) {
                    return row.variant !== variant;
                });

                renderVariantRows();
                resetMaterialTable();
                validateSizes();
            });
        }

        document.querySelectorAll(".size-input").forEach(function (input) {
            input.addEventListener("input", validateSizes);
        });

        ["requiredDate", "plannedStartDate", "plannedCompletionDate"].forEach(function (id) {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener("change", validateDates);
            }
        });

        ["checkMaterialBtn", "checkMaterialBottomBtn"].forEach(function (id) {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener("click", renderMaterialRequirements);
            }
        });

        if (form) {
            form.addEventListener("submit", function (event) {
                syncVariantState();

                if (!selectedVariantRows.length) {
                    event.preventDefault();
                    alert("Please add at least one color variant quantity.");
                    return;
                }

                if (!validateSizes() || !validateDates()) {
                    event.preventDefault();
                }
            });
        }
    }

    function addOrUpdateVariantQuantity() {
        const product = getSelectedProduct();
        const variant = variantDropdown ? String(variantDropdown.value || "").trim() : "";
        const quantity = Number(variantQtyInput ? variantQtyInput.value : 0);

        if (!product) {
            alert("Please select a product first.");
            return;
        }

        if (!variant) {
            alert("Please select a color variant.");
            return;
        }

        if (quantity <= 0) {
            alert("Variant quantity must be greater than zero.");
            return;
        }

        const existing = selectedVariantRows.find(function (row) {
            return row.variant === variant;
        });

        if (existing) {
            existing.quantity = quantity;
        } else {
            selectedVariantRows.push({ variant: variant, quantity: quantity });
        }

        if (variantQtyInput) {
            variantQtyInput.value = "";
            variantQtyInput.focus();
        }

        renderVariantRows();
        resetMaterialTable();
        validateSizes();
    }

    function populateVariantDropdown(product) {
        if (!variantDropdown) return;

        const variants = product ? product.colors : [];

        variantDropdown.innerHTML = `<option value="">Select Color / Variant</option>` + variants.map(function (variant) {
            return `<option value="${escapeHtml(variant)}">${escapeHtml(variant)}</option>`;
        }).join("");
    }

    function renderVariantRows() {
        if (!variantRowsHost) return;

        if (!selectedVariantRows.length) {
            variantRowsHost.innerHTML = `<div class="basket-empty-state">No color variant quantity added.</div>`;
        } else {
            variantRowsHost.innerHTML = selectedVariantRows.map(function (row) {
                return `
                    <div class="variant-breakdown-row">
                        <span class="color-variant-chip">${escapeHtml(row.variant)}</span>
                        <strong>${formatNumber(row.quantity)} pcs</strong>
                        <button type="button"
                                class="basket-remove-btn"
                                data-remove-inhouse-variant="${escapeHtml(row.variant)}"
                                aria-label="Remove ${escapeHtml(row.variant)}">
                            &times;
                        </button>
                    </div>
                `;
            }).join("");
        }

        syncVariantState();
    }

    function syncVariantState() {
        const totalQty = selectedVariantRows.reduce(function (sum, row) {
            return sum + Number(row.quantity || 0);
        }, 0);

        const summary = selectedVariantRows.map(function (row) {
            return row.variant;
        }).join(" / ");

        if (totalQuantityInput) {
            totalQuantityInput.value = totalQty || "";
        }

        if (variantSummaryInput) {
            variantSummaryInput.value = summary;
        }

        if (variantBreakdownJson) {
            variantBreakdownJson.value = JSON.stringify(selectedVariantRows);
        }
    }

    function renderMeasurementChart(product) {
        if (!measurementBody) return;

        if (!product) {
            measurementBody.innerHTML = `<tr><td colspan="6" class="empty-cell">Select product to view measurement data.</td></tr>`;
            return;
        }

        const measurements = product.measurementChart || product.measurements || product.sizeMeasurements || [];

        if (!measurements.length) {
            measurementBody.innerHTML = `<tr><td colspan="6" class="empty-cell">No measurement data found for this product.</td></tr>`;
            return;
        }

        measurementBody.innerHTML = measurements.map(function (row) {
            return `
                <tr>
                    <td><strong>${escapeHtml(row.size || row.Size || "-")}</strong></td>
                    <td>${escapeHtml(row.chest || row.Chest || "-")}</td>
                    <td>${escapeHtml(row.shoulder || row.Shoulder || "-")}</td>
                    <td>${escapeHtml(row.sleeve || row.Sleeve || "-")}</td>
                    <td>${escapeHtml(row.length || row.Length || "-")}</td>
                    <td>${escapeHtml(row.unit || row.Unit || "inch")}</td>
                </tr>
            `;
        }).join("");
    }

    function renderMaterialRequirements() {
        if (!materialRequirementBody) return;

        const product = getSelectedProduct();
        const totalQty = getTotalQuantity();

        if (!product || totalQty <= 0) {
            materialRequirementBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        Select product and add color variant quantities to preview material requirement.
                    </td>
                </tr>
            `;
            return;
        }

        const rows = calculateMaterialRequirements(product, totalQty);

        if (!rows.length) {
            materialRequirementBody.innerHTML = `<tr><td colspan="8" class="empty-cell">No BOM/material data found for selected product.</td></tr>`;
            return;
        }

        materialRequirementBody.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.materialCode)}</td>
                    <td>${escapeHtml(row.materialName)}</td>
                    <td>${escapeHtml(row.materialType)}</td>
                    <td>${formatNumber(row.requiredQty)}</td>
                    <td>${formatNumber(row.availableQty)}</td>
                    <td>${formatNumber(row.shortageQty)}</td>
                    <td>${escapeHtml(row.unit)}</td>
                    <td>
                        <span class="${row.shortageQty > 0 ? "badge badge-danger" : "badge badge-success"}">
                            ${row.shortageQty > 0 ? "Shortage" : "Available"}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function calculateMaterialRequirements(product, totalQty) {
        const grouped = {};

        getBomRowsForProduct(product).forEach(function (bom) {
            const material = getMaterialById(bom.materialId);
            const requiredQty = totalQty * Number(bom.qtyPerUnit || 0) * (1 + Number(bom.wastagePercent || 0) / 100);
            const key = material.id || bom.materialId;

            if (!grouped[key]) {
                grouped[key] = {
                    materialCode: material.code,
                    materialName: material.name,
                    materialType: material.type,
                    requiredQty: 0,
                    availableQty: Number(material.availableQty || 0),
                    shortageQty: 0,
                    unit: material.unit
                };
            }

            grouped[key].requiredQty += requiredQty;
        });

        return Object.values(grouped).map(function (row) {
            row.shortageQty = Math.max(row.requiredQty - row.availableQty, 0);
            return row;
        });
    }

    function resetMaterialTable() {
        if (!materialRequirementBody) return;

        materialRequirementBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cell">
                    Select product and quantity to preview material requirement.
                </td>
            </tr>
        `;
    }

    function validateSizes() {
        const totalQty = getTotalQuantity();
        const sizeTotal = Array.from(document.querySelectorAll(".size-input")).reduce(function (sum, input) {
            return sum + Number(input.value || 0);
        }, 0);

        setText("sizeTotal", formatNumber(sizeTotal));
        setText("sizeDifference", formatNumber(totalQty - sizeTotal));

        const message = document.getElementById("sizeValidationMessage");
        if (!message) return true;

        message.classList.remove("success", "warning", "danger");

        if (totalQty <= 0) {
            message.textContent = "Add color variant quantities before size validation.";
            message.classList.add("warning");
            return false;
        }

        if (totalQty === sizeTotal) {
            message.textContent = "Size breakdown matches total production quantity.";
            message.classList.add("success");
            return true;
        }

        message.textContent = `Size total differs from total quantity by ${formatNumber(totalQty - sizeTotal)}.`;
        message.classList.add("danger");
        return false;
    }

    function validateDates() {
        const planDate = getInputValue("PlanDate") || getInputValue("planDate");
        const requiredDate = getInputValue("requiredDate");
        const startDate = getInputValue("plannedStartDate");
        const completionDate = getInputValue("plannedCompletionDate");
        const bufferDays = requiredDate && completionDate
            ? Math.max(daysBetween(completionDate, requiredDate), 0)
            : 0;

        const bufferInput = document.getElementById("bufferDays");
        if (bufferInput) {
            bufferInput.value = `${bufferDays} days`;
        }

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

    function setupNepaliDateFields() {
        const datePairs = [
            { bsId: "planDateBs", adId: "planDate" },
            { bsId: "requiredDateBs", adId: "requiredDate" },
            { bsId: "plannedStartDateBs", adId: "plannedStartDate" },
            { bsId: "plannedCompletionDateBs", adId: "plannedCompletionDate" }
        ];

        datePairs.forEach(function (pair) {
            const bsInput = document.getElementById(pair.bsId);
            const adInput = document.getElementById(pair.adId);

            if (!bsInput || !adInput) return;

            syncAdDateToBs(adInput, bsInput);

            if (typeof bsInput.nepaliDatePicker === "function") {
                bsInput.nepaliDatePicker({
                    dateFormat: "YYYY-MM-DD",
                    miniEnglishDates: true,
                    onChange: function () {
                        window.setTimeout(function () {
                            syncBsDateToAd(bsInput, adInput);
                        }, 0);
                    }
                });
            }

            ["change", "input", "blur"].forEach(function (eventName) {
                bsInput.addEventListener(eventName, function () {
                    syncBsDateToAd(bsInput, adInput);
                });
            });
        });
    }

    function syncAdDateToBs(adInput, bsInput) {
        if (!adInput.value || !window.NepaliFunctions || typeof window.NepaliFunctions.AD2BS !== "function") {
            return;
        }

        const bsValue = window.NepaliFunctions.AD2BS(adInput.value, "YYYY-MM-DD", "YYYY-MM-DD");
        bsInput.value = typeof bsValue === "string" ? bsValue : formatDateObject(bsValue);
    }

    function syncBsDateToAd(bsInput, adInput) {
        if (!bsInput.value || !window.NepaliFunctions || typeof window.NepaliFunctions.BS2AD !== "function") {
            return;
        }

        const parsed = parseNepaliDateValue(bsInput.value);
        if (!parsed.value) return;

        const adValue = window.NepaliFunctions.BS2AD(parsed.value, parsed.format, "YYYY-MM-DD");
        adInput.value = typeof adValue === "string" ? adValue : formatDateObject(adValue);
        adInput.dispatchEvent(new Event("change", { bubbles: true }));
        validateDates();
    }

    function parseNepaliDateValue(value) {
        const normalized = String(value || "").trim().replaceAll("/", "-");

        if (/^\d{2}-\d{2}-\d{4}$/.test(normalized)) {
            return {
                value: normalized,
                format: "DD-MM-YYYY"
            };
        }

        return {
            value: normalized,
            format: "YYYY-MM-DD"
        };
    }

    function formatDateObject(value) {
        if (!value || typeof value !== "object") return "";

        return [
            value.year,
            String(value.month).padStart(2, "0"),
            String(value.day).padStart(2, "0")
        ].join("-");
    }

    function getSelectedProduct() {
        if (!productDropdown || !productDropdown.value) return null;

        const selectedValue = String(productDropdown.value);

        return products.map(normalizeProduct).find(function (product) {
            return String(product.id) === selectedValue ||
                String(product.productId) === selectedValue ||
                String(product.productCode) === selectedValue;
        }) || null;
    }

    function normalizeProduct(product) {
        return {
            id: product.productId || product.id || product.productCode || "",
            productId: product.productId || product.id || "",
            productCode: product.productCode || product.code || "",
            name: product.productName || product.name || product.productCode || "Product",
            colors: product.availableColors || product.colors || [],
            sizes: product.sizes || [],
            measurementChart: product.measurementChart || product.measurements || product.sizeMeasurements || []
        };
    }

    function getBomRowsForProduct(product) {
        const candidates = getProductBomCandidates(product);

        return bomData.map(normalizeBomRow).filter(function (row) {
            return candidates.includes(String(row.productId));
        });
    }

    function getProductBomCandidates(product) {
        const values = [
            product.id,
            product.productId,
            product.productCode,
            toBomProductId(product.id),
            toBomProductId(product.productId)
        ].filter(Boolean).map(String);

        return Array.from(new Set(values));
    }

    function toBomProductId(value) {
        const match = String(value || "").match(/^PROD-(\d+)$/i);
        return match ? `PRD-${match[1]}` : "";
    }

    function normalizeBomRow(row) {
        return {
            productId: row.productId || row.ProductId || row.productCode || row.ProductCode || "",
            materialId: row.materialId || row.MaterialId || row.materialCode || row.MaterialCode || "",
            qtyPerUnit: Number(row.qtyPerUnit || row.quantityPerUnit || row.requiredQty || row.RequiredQty || 0),
            wastagePercent: Number(row.wastagePercent || row.WastagePercent || 0)
        };
    }

    function getMaterialById(materialId) {
        const material = materials.map(normalizeMaterial).find(function (row) {
            return String(row.id) === String(materialId) || String(row.code) === String(materialId);
        });

        return material || {
            id: materialId,
            code: materialId,
            name: "Unknown Material",
            type: "Material",
            unit: "pcs",
            availableQty: 0
        };
    }

    function normalizeMaterial(material) {
        return {
            id: material.id || material.materialId || material.MaterialId || material.code || material.materialCode || "",
            code: material.code || material.materialCode || material.MaterialCode || "",
            name: material.name || material.materialName || material.MaterialName || "Material",
            type: material.type || material.materialType || material.MaterialType || "Material",
            unit: material.unit || material.uom || material.Unit || "pcs",
            availableQty: Number(material.availableQty || material.currentStock || material.stock || material.AvailableQty || 0)
        };
    }

    function getTotalQuantity() {
        syncVariantState();
        return Number(totalQuantityInput ? totalQuantityInput.value || 0 : 0);
    }

    function getInputValue(id) {
        const input = document.getElementById(id);
        return input ? input.value : "";
    }

    function daysBetween(startValue, endValue) {
        const start = new Date(startValue);
        const end = new Date(endValue);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return 0;
        }

        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});
