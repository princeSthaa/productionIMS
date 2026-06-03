document.addEventListener("DOMContentLoaded", function () {
    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=480&q=80";
    const pageRoot = document.getElementById("outletDemandPlanPage");
    const selectedOutletId = pageRoot ? String(pageRoot.dataset.selectedOutletId || "").trim() : "";
    const allCatalogItems = window.outletDemandCatalogData || window.outletDemands || [];
    const catalogItems = selectedOutletId
        ? allCatalogItems.filter(function (item) {
            const normalizedItem = normalizeOutletDemandItem(item);
            return String(normalizedItem.outletId) === selectedOutletId;
        })
        : allCatalogItems;
    const selectedOutlet = selectedOutletId
        ? catalogItems.map(normalizeOutletDemandItem)[0] || null
        : null;
    const materials = window.materialMasterData || window.materials || window.materialsData || [];
    const bomData = window.bomMasterData || window.bomData || window.boms || [];
    const products = window.productMasterData || window.products || window.productsData || [];

    let selectedPlanItems = [];
    let activeDetailItem = null;

    const catalogGrid = document.getElementById("outletDemandCatalogGrid");

    const selectedDraftJson = document.getElementById("selectedOutletDraftJson");

    const checkBulkMaterialBtn = document.getElementById("checkOutletBulkMaterialBtn");
    const clearBasketBtn = document.getElementById("clearOutletBasketBtn");
    const bulkMaterialBody = document.getElementById("outletBulkMaterialBody");
    const productionPlanForm = document.getElementById("outletProductionPlanForm");

    const outletDetailModal = document.getElementById("outletDetailModal");
    const addDetailToPlanBtn = document.getElementById("addOutletDetailToPlanBtn");

    initialize();

    function initialize() {
        renderSelectedOutletSummary();
        renderCatalog();
        renderBasket();

        document.querySelectorAll("[data-close-modal]").forEach(function (button) {
            button.addEventListener("click", function () {
                const modalId = this.getAttribute("data-close-modal");
                closeModal(modalId);
            });
        });

        if (addDetailToPlanBtn) {
            addDetailToPlanBtn.addEventListener("click", function () {
                if (activeDetailItem) {
                    addToPlan(activeDetailItem.id);
                    closeModal("outletDetailModal");
                }
            });
        }

        if (checkBulkMaterialBtn) {
            checkBulkMaterialBtn.addEventListener("click", checkBulkMaterials);
        }

        if (clearBasketBtn) {
            clearBasketBtn.addEventListener("click", function () {
                if (!selectedPlanItems.length) return;

                if (confirm("Clear all selected outlet demand items?")) {
                    selectedPlanItems = [];
                    renderBasket();
                    renderCatalog();
                    resetBulkMaterialTable();
                }
            });
        }

        if (productionPlanForm) {
            productionPlanForm.addEventListener("submit", function (event) {
                if (!selectedPlanItems.length) {
                    event.preventDefault();
                    alert("Please add at least one outlet demand item to the production plan.");
                    return;
                }

                if (selectedDraftJson) {
                    selectedDraftJson.value = JSON.stringify(selectedPlanItems);
                }
            });
        }
    }

    function renderSelectedOutletSummary() {
        const selectedOutletCard = document.getElementById("selectedOutletCard");
        const outletSelectionWarning = document.getElementById("outletSelectionWarning");

        if (!selectedOutletId) {
            if (outletSelectionWarning) {
                outletSelectionWarning.classList.remove("hidden");
            }

            setText("outletDemandHeaderText", "No outlet is selected yet. Choose an outlet to narrow the replenishment demand catalog.");
            setText("outletDemandCatalogTitle", "All Outlet Demand");
            setText("outletDemandItemsTitle", "All Outlet Demand Items");
            setText("outletDemandItemsText", "Choose an outlet first for the normal outlet-specific planning flow.");
            return;
        }

        if (!selectedOutlet) {
            if (outletSelectionWarning) {
                outletSelectionWarning.classList.remove("hidden");
                outletSelectionWarning.textContent = "The selected outlet was not found in the current outlet demand data.";
            }

            setText("outletDemandHeaderText", "The selected outlet was not found in the current outlet demand data.");
            setText("outletDemandCatalogTitle", "No Demand Found");
            setText("outletDemandItemsTitle", "No Outlet Demand Items");
            setText("outletDemandItemsText", "Go back to the outlet catalog and choose another outlet.");
            return;
        }

        if (outletSelectionWarning) {
            outletSelectionWarning.classList.add("hidden");
        }

        if (selectedOutletCard) {
            selectedOutletCard.classList.remove("hidden");
        }

        const normalizedItems = catalogItems.map(normalizeOutletDemandItem);
        const totalQty = normalizedItems.reduce(function (sum, item) {
            return sum + Number(item.suggestedQty || 0);
        }, 0);

        const earliestRequired = normalizedItems.length
            ? normalizedItems.map(function (item) {
                return item.requiredDate;
            }).sort()[0]
            : "";

        setText("outletDemandHeaderText", `Showing replenishment demand for ${selectedOutlet.outletName}. Add one or more demand items to the production plan basket.`);
        setText("outletDemandCatalogTitle", `${selectedOutlet.outletName} Demand`);
        setText("outletDemandItemsTitle", `${selectedOutlet.outletName} Demand Items`);
        setText("outletDemandItemsText", "Click View Details to inspect size/color stock gaps, measurements, and material requirements before adding to plan.");

        setText("selectedOutletAvatar", getInitials(selectedOutlet.outletName));
        setText("selectedOutletName", selectedOutlet.outletName);
        setText("selectedOutletMeta", `${selectedOutlet.outletCode} | ${selectedOutlet.phone || "Phone not set"}`);
        setText("selectedOutletManager", selectedOutlet.outletManager || "-");
        setText("selectedOutletLocation", selectedOutlet.outletLocation || "-");
        setText("selectedOutletDemandCount", normalizedItems.length);
        setText("selectedOutletQty", `${formatNumber(totalQty)} pcs`);
        setText("selectedOutletRequired", earliestRequired ? formatDate(earliestRequired) : "-");
    }

    function renderCatalog() {
        if (!catalogGrid) return;

        let filtered = catalogItems.map(normalizeOutletDemandItem);

        filtered.sort(function (a, b) {
            return new Date(a.requiredDate) - new Date(b.requiredDate);
        });

        if (!filtered.length) {
            const emptyText = selectedOutletId
                ? "No demand items found for the selected outlet."
                : "No outlet demand items found.";

            catalogGrid.innerHTML = `
                <div class="empty-cell">
                    ${emptyText}
                </div>
            `;
            return;
        }

        catalogGrid.innerHTML = filtered.map(function (item) {
            const isSelected = selectedPlanItems.some(function (selected) {
                return Number(selected.id) === Number(item.id);
            });

            const materialPreview = getItemMaterialPreview(item);
            const requiredClass = getDateBadgeClass(item.requiredDate);
            const stockClass = getStockStatusClass(item.stockStatus);
            const velocityClass = getVelocityClass(item.salesVelocity);

            return `
                <article class="customer-order-card outlet-demand-card ${isSelected ? "selected" : ""}">
                    <div class="customer-order-image-wrap">
                        <img src="${escapeHtml(item.productImage)}"
                             alt="${escapeHtml(item.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />

                        <span class="catalog-status-chip ${isSelected ? "added" : ""}">
                            ${isSelected ? "Added" : "Ready"}
                        </span>
                    </div>

                    <div class="customer-order-card-body">
                        <div class="catalog-card-top">
                            <span class="customer-code">${escapeHtml(item.demandNo)}</span>
                            <span class="${stockClass}">${escapeHtml(item.stockStatus)}</span>
                        </div>

                        <h3>${escapeHtml(item.productName)}</h3>

                        <p class="catalog-customer-name">
                            ${escapeHtml(item.outletName)}
                        </p>

                        <div class="catalog-meta-grid">
                            <div>
                                <span>Current Stock</span>
                                <strong>${formatNumber(item.currentStock)} pcs</strong>
                            </div>
                            <div>
                                <span>Suggested Qty</span>
                                <strong>${formatNumber(item.suggestedQty)} pcs</strong>
                            </div>
                            <div>
                                <span>Required</span>
                                <strong>${formatDate(item.requiredDate)}</strong>
                            </div>
                            <div>
                                <span>Color Sets</span>
                                <strong>${escapeHtml(getColorSummary(item))}</strong>
                            </div>
                        </div>

                        <div class="catalog-mini-status">
                            <span class="${requiredClass}">
                                ${getDateStatusText(item.requiredDate)}
                            </span>

                            <span class="${velocityClass}">
                                ${escapeHtml(item.salesVelocity)} moving
                            </span>

                            <span class="${materialPreview.hasShortage ? "material-shortage" : "material-ok"}">
                                ${materialPreview.label}
                            </span>
                        </div>

                        <div class="catalog-card-actions">
                            <button type="button"
                                    class="btn btn-light outlet-view-detail-btn"
                                    data-id="${item.id}">
                                View Details
                            </button>

                            <button type="button"
                                    class="btn btn-primary outlet-add-plan-btn"
                                    data-id="${item.id}"
                                    ${isSelected ? "disabled" : ""}>
                                ${isSelected ? "Added" : "Add to Plan"}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        document.querySelectorAll(".outlet-view-detail-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                openDetailModal(Number(this.getAttribute("data-id")));
            });
        });

        document.querySelectorAll(".outlet-add-plan-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                addToPlan(Number(this.getAttribute("data-id")));
            });
        });
    }

    function openDetailModal(id) {
        const item = catalogItems.map(normalizeOutletDemandItem).find(function (catalogItem) {
            return Number(catalogItem.id) === Number(id);
        });

        if (!item) return;

        activeDetailItem = item;

        setText("outletDetailProductName", item.productName);
        setText("outletDetailSubtitle", `${item.demandNo} • ${item.outletName}`);
        setText("outletDetailOutletName", item.outletName);
        setText("outletDetailDemandNo", item.demandNo);
        setText("outletDetailStockStatus", item.stockStatus);
        setText("outletDetailVelocity", `${item.salesVelocity} Moving`);
        setText("outletDetailRequiredBadge", getDateStatusText(item.requiredDate));
        setText("outletDetailItemName", item.productName);

        setText("outletDetailCurrentStock", `${formatNumber(item.currentStock)} pcs`);
        setText("outletDetailReorderLevel", `${formatNumber(item.reorderLevel)} pcs`);
        setText("outletDetailSuggestedQty", `${formatNumber(item.suggestedQty)} pcs`);
        setText("outletDetailRequiredDate", formatDate(item.requiredDate));
        setText("outletDetailLast30Sales", `${formatNumber(item.last30DaysSales)} pcs`);
        setText("outletDetailLocation", item.outletLocation);
        setText("outletDetailNotes", item.planningNotes);

        setText("outletDetailLast7Sales", `${formatNumber(item.last7DaysSales)} pcs`);
        setText("outletDetailSales30Box", `${formatNumber(item.last30DaysSales)} pcs`);
        setText("outletDetailAvgDailySales", `${formatNumber(item.avgDailySales)} pcs/day`);

        const image = document.getElementById("outletDetailProductImage");
        if (image) {
            image.src = item.productImage;
            image.alt = item.productName;
        }

        const stockElement = document.getElementById("outletDetailStockStatus");
        if (stockElement) {
            stockElement.className = getStockStatusClass(item.stockStatus);
        }

        const velocityElement = document.getElementById("outletDetailVelocity");
        if (velocityElement) {
            velocityElement.className = getVelocityClass(item.salesVelocity);
        }

        const requiredElement = document.getElementById("outletDetailRequiredBadge");
        if (requiredElement) {
            requiredElement.className = getDateBadgeClass(item.requiredDate);
        }

        renderDetailSizeGaps(item);
        renderOutletMeasurementChart(item);
        renderDetailMaterials(item);

        if (outletDetailModal) {
            outletDetailModal.classList.remove("hidden");
        }
    }

    function renderDetailSizeGaps(item) {
        const body = document.getElementById("outletDetailSizeGapBody");
        if (!body) return;

        if (!item.sizeGaps.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No size gap data.</td></tr>`;
            return;
        }

        const rows = getSizeColorGapRows(item);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No size/color gap data.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.size)}</td>
                    <td><span class="color-variant-chip">${escapeHtml(row.color)}</span></td>
                    <td>${formatNumber(row.currentStock)}</td>
                    <td>${formatNumber(row.reorderLevel)}</td>
                    <td>${formatNumber(row.suggestedQty)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderOutletMeasurementChart(item) {
    const body = document.getElementById("outletDetailMeasurementBody");
    if (!body) return;

    const product = getProductForItem(item);

    let measurements =
        item.measurementChart ||
        item.measurements ||
        item.sizeMeasurements ||
        product.measurementChart ||
        product.measurements ||
        product.sizeMeasurements ||
        [];

    if (!measurements.length) {
        measurements = buildFallbackMeasurements(item, product);
    }

    if (!measurements.length) {
        body.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">No measurement data.</td>
            </tr>
        `;
        return;
    }

    body.innerHTML = measurements.map(function (row) {
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

function buildFallbackMeasurements(item, product) {
    const sizesFromGap = Array.isArray(item.sizeGaps)
        ? item.sizeGaps.map(function (row) {
            return row.size;
        })
        : [];

    const sizes =
        sizesFromGap.length
            ? sizesFromGap
            : product.sizes || item.sizes || ["S", "M", "L", "XL"];

    const productName = String(item.productName || product.productName || product.name || "").toLowerCase();

    return sizes.map(function (size) {
        return getDefaultMeasurementByType(size, productName);
    });
}

function getDefaultMeasurementByType(size, productName) {
    const upperSize = String(size || "").toUpperCase();

    const shirtMeasurements = {
        XS: { chest: 32, shoulder: 13.5, sleeve: 21, length: 24 },
        S: { chest: 34, shoulder: 14, sleeve: 22, length: 25 },
        M: { chest: 36, shoulder: 15, sleeve: 23, length: 26 },
        L: { chest: 38, shoulder: 16, sleeve: 24, length: 27 },
        XL: { chest: 40, shoulder: 17, sleeve: 25, length: 28 },
        XXL: { chest: 42, shoulder: 18, sleeve: 26, length: 29 }
    };

    const poloMeasurements = {
        XS: { chest: 34, shoulder: 14, sleeve: 7, length: 24 },
        S: { chest: 36, shoulder: 15, sleeve: 7.5, length: 25 },
        M: { chest: 38, shoulder: 16, sleeve: 8, length: 26 },
        L: { chest: 40, shoulder: 17, sleeve: 8.5, length: 27 },
        XL: { chest: 42, shoulder: 18, sleeve: 9, length: 28 },
        XXL: { chest: 44, shoulder: 19, sleeve: 9.5, length: 29 }
    };

    const trouserMeasurements = {
        XS: { chest: "-", shoulder: "-", sleeve: "-", length: 37 },
        S: { chest: "-", shoulder: "-", sleeve: "-", length: 38 },
        M: { chest: "-", shoulder: "-", sleeve: "-", length: 39 },
        L: { chest: "-", shoulder: "-", sleeve: "-", length: 40 },
        XL: { chest: "-", shoulder: "-", sleeve: "-", length: 41 },
        XXL: { chest: "-", shoulder: "-", sleeve: "-", length: 42 }
    };

    let selected = shirtMeasurements;

    if (productName.includes("polo") || productName.includes("t-shirt") || productName.includes("tshirt")) {
        selected = poloMeasurements;
    }

    if (productName.includes("trouser") || productName.includes("pant")) {
        selected = trouserMeasurements;
    }

    if (productName.includes("hoodie")) {
        selected = {
            XS: { chest: 36, shoulder: 15, sleeve: 22, length: 25 },
            S: { chest: 38, shoulder: 16, sleeve: 23, length: 26 },
            M: { chest: 40, shoulder: 17, sleeve: 24, length: 27 },
            L: { chest: 42, shoulder: 18, sleeve: 25, length: 28 },
            XL: { chest: 44, shoulder: 19, sleeve: 26, length: 29 },
            XXL: { chest: 46, shoulder: 20, sleeve: 27, length: 30 }
        };
    }

    const row = selected[upperSize] || selected.M;

    return {
        size: upperSize,
        chest: row.chest,
        shoulder: row.shoulder,
        sleeve: row.sleeve,
        length: row.length,
        unit: "inch"
    };
}

    function renderDetailMaterials(item) {
        const body = document.getElementById("outletDetailMaterialBody");
        if (!body) return;

        const rows = calculateMaterialRequirementForItems([item]);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No BOM/material data found.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.materialName)}</td>
                    <td>${formatNumber(row.requiredQty)} ${escapeHtml(row.unit)}</td>
                    <td>${formatNumber(row.availableQty)} ${escapeHtml(row.unit)}</td>
                    <td>${formatNumber(row.shortageQty)} ${escapeHtml(row.unit)}</td>
                    <td>
                        <span class="${row.shortageQty > 0 ? "badge badge-danger" : "badge badge-success"}">
                            ${row.shortageQty > 0 ? "Shortage" : "Available"}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function addToPlan(id) {
        const item = catalogItems.map(normalizeOutletDemandItem).find(function (catalogItem) {
            return Number(catalogItem.id) === Number(id);
        });

        if (!item) return;

        const alreadyAdded = selectedPlanItems.some(function (selected) {
            return Number(selected.id) === Number(id);
        });

        if (alreadyAdded) {
            alert("This outlet demand item is already added to the production plan.");
            return;
        }

        selectedPlanItems.push(item);
        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function removeFromPlan(id) {
        selectedPlanItems = selectedPlanItems.filter(function (item) {
            return Number(item.id) !== Number(id);
        });

        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function renderBasket() {
        if (!document.getElementById("outletPlanBasketItems")) return;

        const planBasketItems = document.getElementById("outletPlanBasketItems");

        if (!selectedPlanItems.length) {
            planBasketItems.innerHTML = `
                <div class="basket-empty-state">
                    No outlet demand items added yet.
                </div>
            `;
        } else {
            planBasketItems.innerHTML = selectedPlanItems.map(function (item) {
                return `
                    <div class="basket-item">
                        <img src="${escapeHtml(item.productImage)}"
                             alt="${escapeHtml(item.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />

                        <div>
                            <strong>${escapeHtml(item.productName)}</strong>
                            <span>${escapeHtml(item.outletName)}</span>
                            <small>${formatNumber(item.suggestedQty)} pcs • ${formatDate(item.requiredDate)}</small>
                        </div>

                        <button type="button"
                                class="basket-remove-btn"
                                data-id="${item.id}">
                            ×
                        </button>
                    </div>
                `;
            }).join("");
        }

        document.querySelectorAll(".basket-remove-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                removeFromPlan(Number(this.getAttribute("data-id")));
            });
        });

        updateBasketSummary();
    }

    function updateBasketSummary() {
        const totalItems = selectedPlanItems.length;
        const totalQty = selectedPlanItems.reduce(function (sum, item) {
            return sum + Number(item.suggestedQty || 0);
        }, 0);

        const earliestDate = selectedPlanItems.length
            ? selectedPlanItems.map(function (item) {
                return item.requiredDate;
            }).sort()[0]
            : null;

        setText("outletSelectedItemCount", totalItems);
        setText("outletSelectedTotalQty", formatNumber(totalQty));
        setText("outletSelectedEarliestDate", earliestDate ? formatDate(earliestDate) : "-");

        setText("outletBasketTotalItems", totalItems);
        setText("outletBasketTotalQty", formatNumber(totalQty));
        setText("outletBasketEarliestDate", earliestDate ? formatDate(earliestDate) : "-");

        if (selectedDraftJson) {
            selectedDraftJson.value = JSON.stringify(selectedPlanItems);
        }
    }

    function checkBulkMaterials() {
        if (!selectedPlanItems.length) {
            alert("Please add at least one outlet demand item to the production plan first.");
            return;
        }

        const rows = calculateMaterialRequirementForItems(selectedPlanItems);

        if (!rows.length) {
            bulkMaterialBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        No BOM/material data found for selected outlet demand items.
                    </td>
                </tr>
            `;

            setText("outletBasketMaterialStatus", "No BOM found");
            return;
        }

        const hasShortage = rows.some(function (row) {
            return row.shortageQty > 0;
        });

        bulkMaterialBody.innerHTML = rows.map(function (row) {
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

        setText("outletBasketMaterialStatus", hasShortage ? "Shortage" : "Available");
    }

    function calculateMaterialRequirementForItems(items) {
        const grouped = {};

        items.forEach(function (item) {
            const itemBomRows = getBomRowsForProduct(item.productId);

            itemBomRows.forEach(function (bom) {
                const material = getMaterialById(bom.materialId);

                const requiredQty =
                    Number(item.suggestedQty || 0) *
                    Number(bom.qtyPerUnit || 0) *
                    (1 + Number(bom.wastagePercent || 0) / 100);

                if (!grouped[material.id]) {
                    grouped[material.id] = {
                        materialId: material.id,
                        materialCode: material.code,
                        materialName: material.name,
                        materialType: material.type,
                        unit: material.unit,
                        requiredQty: 0,
                        availableQty: Number(material.availableQty || 0),
                        shortageQty: 0
                    };
                }

                grouped[material.id].requiredQty += requiredQty;
            });
        });

        return Object.values(grouped).map(function (row) {
            row.shortageQty = Math.max(row.requiredQty - row.availableQty, 0);
            return row;
        });
    }

    function getBomRowsForProduct(productId) {
        return bomData.map(normalizeBomRow).filter(function (row) {
            return String(row.productId) === String(productId);
        });
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

    function getProductForItem(item) {
        const product = products.find(function (productItem) {
            const productId = productItem.id || productItem.productId || productItem.ProductId || "";
            const productCode = productItem.productCode || productItem.code || productItem.ProductCode || "";
            const productName = productItem.productName || productItem.name || productItem.ProductName || "";

            return String(productId) === String(item.productId) ||
                String(productCode) === String(item.productCode) ||
                String(productName).toLowerCase() === String(item.productName).toLowerCase();
        });

        return product || {};
    }

    function getItemMaterialPreview(item) {
        const rows = calculateMaterialRequirementForItems([item]);

        if (!rows.length) {
            return {
                hasShortage: false,
                label: "BOM not set"
            };
        }

        const hasShortage = rows.some(function (row) {
            return row.shortageQty > 0;
        });

        return {
            hasShortage: hasShortage,
            label: hasShortage ? "Material shortage" : "Material ready"
        };
    }

    function resetBulkMaterialTable() {
        if (!bulkMaterialBody) return;

        bulkMaterialBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cell">
                    Add outlet demand items to plan basket, then click Check Materials in Bulk.
                </td>
            </tr>
        `;

        setText("outletBasketMaterialStatus", "Not checked");
    }

    function normalizeOutletDemandItem(item) {
        return {
            id: item.id || item.demandItemId || 0,
            demandNo: item.demandNo || "DEMAND",
            outletId: item.outletId || 0,
            outletCode: item.outletCode || "",
            outletName: item.outletName || "",
            outletLocation: item.outletLocation || "",
            outletManager: item.outletManager || "",
            phone: item.phone || "",

            productId: item.productId || item.productCode || "",
            productCode: item.productCode || item.productId || "",
            productName: item.productName || "",
            category: item.category || "",
            variant: item.variant || "",
            productImage: item.productImage || fallbackProductImage,

            currentStock: Number(item.currentStock || 0),
            reorderLevel: Number(item.reorderLevel || 0),
            maxStock: Number(item.maxStock || 0),
            stockGap: Number(item.stockGap || 0),
            suggestedQty: Number(item.suggestedQty || 0),

            last7DaysSales: Number(item.last7DaysSales || 0),
            last30DaysSales: Number(item.last30DaysSales || 0),
            avgDailySales: Number(item.avgDailySales || 0),
            salesVelocity: item.salesVelocity || "Normal",

            stockStatus: item.stockStatus || "Low Stock",
            requiredDate: item.requiredDate || "",
            priority: item.priority || "Normal",
            materialStatus: item.materialStatus || "Unchecked",
            planningNotes: item.planningNotes || "No planning notes.",

            sizeGaps: item.sizeGaps || [],
            measurementChart: item.measurementChart || item.measurements || item.sizeMeasurements || []
        };
    }

    function getSizeColorGapRows(item) {
        const rows = [];

        (item.sizeGaps || []).forEach(function (sizeRow) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            if (colorRows.length) {
                colorRows.forEach(function (colorRow) {
                    rows.push({
                        size: sizeRow.size || "-",
                        color: colorRow.color || colorRow.variant || colorRow.name || "-",
                        currentStock: Number(colorRow.currentStock || colorRow.current || 0),
                        reorderLevel: Number(colorRow.reorderLevel || colorRow.reorder || 0),
                        suggestedQty: Number(colorRow.suggestedQty || colorRow.quantity || colorRow.qty || 0)
                    });
                });

                return;
            }

            rows.push({
                size: sizeRow.size || "-",
                color: sizeRow.color || item.variant || "-",
                currentStock: Number(sizeRow.currentStock || 0),
                reorderLevel: Number(sizeRow.reorderLevel || 0),
                suggestedQty: Number(sizeRow.suggestedQty || 0)
            });
        });

        return rows;
    }

    function getColorSummary(item) {
        const colors = [];

        getSizeColorGapRows(item).forEach(function (row) {
            if (row.color && !colors.includes(row.color)) {
                colors.push(row.color);
            }
        });

        if (!colors.length) {
            return item.variant || "-";
        }

        if (colors.length <= 3) {
            return colors.join(" / ");
        }

        return `${colors.slice(0, 3).join(" / ")} +${colors.length - 3}`;
    }

    function getInitials(value) {
        return String(value || "Outlet")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");
    }

    function getStockStatusClass(status) {
        if (status === "Critical") return "priority-badge priority-urgent";
        if (status === "Reorder Soon") return "priority-badge priority-seasonal";
        return "priority-badge priority-normal";
    }

    function getVelocityClass(velocity) {
        if (velocity === "Fast") return "material-shortage";
        if (velocity === "Slow") return "customer-delivery-normal";
        return "material-ok";
    }

    function getDateBadgeClass(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (diffDays < 0 || diffDays <= 7) {
            return "customer-delivery-warning";
        }

        return "customer-delivery-normal";
    }

    function getDateStatusText(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (!dateValue) return "No required date";
        if (diffDays < 0) return "Overdue";
        if (diffDays === 0) return "Due today";
        if (diffDays <= 7) return `${diffDays} days left`;

        return "On schedule";
    }

    function getDiffDays(dateValue) {
        if (!dateValue) return 9999;

        const today = new Date();
        const date = new Date(dateValue);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    }

    function formatDate(dateValue) {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    }

    function closeModal(id) {
        const modal = document.getElementById(id);

        if (modal) {
            modal.classList.add("hidden");
        }
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
