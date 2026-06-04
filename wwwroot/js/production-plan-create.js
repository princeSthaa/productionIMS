document.addEventListener("DOMContentLoaded", function () {
    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=480&q=80";
    const pageRoot = document.getElementById("customerOrderPlanPage");

    if (!pageRoot) return;

    const selectedCustomerId = pageRoot ? String(pageRoot.dataset.selectedCustomerId || "").trim() : "";
    const allCatalogItems = window.customerOrderCatalogData || window.customerMasterData || [];
    const catalogItems = selectedCustomerId
        ? allCatalogItems.filter(function (item) {
            const normalizedItem = normalizeCatalogItem(item);
            return String(normalizedItem.customerId) === selectedCustomerId;
        })
        : allCatalogItems;
    const selectedCustomer = selectedCustomerId
        ? catalogItems.map(normalizeCatalogItem)[0] || null
        : null;
    const materials = window.materialMasterData || window.materials || window.materialsData || [];
    const bomData = window.bomMasterData || window.bomData || window.boms || [];

    let selectedPlanItems = [];
    let activeDetailItem = null;

    const catalogGrid = document.getElementById("customerOrderCatalogGrid");

    const selectedDraftJson = document.getElementById("selectedDraftJson");

    const selectedItemCount = document.getElementById("selectedItemCount");
    const selectedTotalQty = document.getElementById("selectedTotalQty");
    const selectedEarliestDelivery = document.getElementById("selectedEarliestDelivery");

    const basketTotalItems = document.getElementById("basketTotalItems");
    const basketTotalQty = document.getElementById("basketTotalQty");
    const basketEarliestDelivery = document.getElementById("basketEarliestDelivery");
    const basketMaterialStatus = document.getElementById("basketMaterialStatus");
    const planBasketItems = document.getElementById("planBasketItems");

    const checkBulkMaterialBtn = document.getElementById("checkBulkMaterialBtn");
    const clearBasketBtn = document.getElementById("clearBasketBtn");
    const createProductionPlanBtn = document.getElementById("createProductionPlanBtn");
    const bulkMaterialBody = document.getElementById("bulkMaterialBody");
    const productionPlanForm = document.getElementById("productionPlanForm");

    const orderDetailModal = document.getElementById("orderDetailModal");
    const addDetailToPlanBtn = document.getElementById("addDetailToPlanBtn");

    initialize();

    function initialize() {
        renderSelectedCustomerSummary();
        renderCatalog();
        renderBasket();

        document.querySelectorAll("[data-close-modal]").forEach(function (button) {
            button.addEventListener("click", function () {
                const modalId = this.getAttribute("data-close-modal");
                const modal = document.getElementById(modalId);

                if (modal) {
                    modal.classList.add("hidden");
                }
            });
        });

        if (addDetailToPlanBtn) {
            addDetailToPlanBtn.addEventListener("click", function () {
                if (activeDetailItem) {
                    addToPlan(activeDetailItem.id);

                    if (!isItemSelected(activeDetailItem.id)) return;

                    closeModal("orderDetailModal");
                }
            });
        }

        if (checkBulkMaterialBtn) {
            checkBulkMaterialBtn.addEventListener("click", checkBulkMaterials);
        }

        if (clearBasketBtn) {
            clearBasketBtn.addEventListener("click", function () {
                if (!selectedPlanItems.length) return;

                if (confirm("Clear all selected production plan items?")) {
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
                    alert("Please add at least one customer order item to the production plan.");
                    return;
                }

                syncSelectedDraftJson();
            });
        }
    }

    function renderSelectedCustomerSummary() {
        const selectedCustomerCard = document.getElementById("selectedCustomerCard");
        const customerSelectionWarning = document.getElementById("customerSelectionWarning");

        if (!selectedCustomerId) {
            if (customerSelectionWarning) {
                customerSelectionWarning.classList.remove("hidden");
            }

            setText("customerOrderHeaderText", "No customer is selected yet. Choose a customer to narrow the order item catalog.");
            setText("customerOrderCatalogTitle", "All Ready Customer Orders");
            setText("customerOrderItemsTitle", "All Customer Order Items");
            setText("customerOrderItemsText", "Choose a customer first for the normal customer-specific planning flow.");
            return;
        }

        if (!selectedCustomer) {
            if (customerSelectionWarning) {
                customerSelectionWarning.classList.remove("hidden");
                customerSelectionWarning.textContent = "The selected customer was not found in the current customer order data.";
            }

            setText("customerOrderHeaderText", "The selected customer was not found in the current customer order data.");
            setText("customerOrderCatalogTitle", "No Orders Found");
            setText("customerOrderItemsTitle", "No Customer Order Items");
            setText("customerOrderItemsText", "Go back to the customer catalog and choose another customer.");
            return;
        }

        if (customerSelectionWarning) {
            customerSelectionWarning.classList.add("hidden");
        }

        if (selectedCustomerCard) {
            selectedCustomerCard.classList.remove("hidden");
        }

        const normalizedItems = catalogItems.map(normalizeCatalogItem);
        const totalQty = normalizedItems.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);

        const earliestDelivery = normalizedItems.length
            ? normalizedItems.map(function (item) {
                return item.deliveryDate;
            }).sort()[0]
            : "";

        setText("customerOrderHeaderText", `Showing order items for ${selectedCustomer.customerName}. Add one or more items to the production plan basket.`);
        setText("customerOrderCatalogTitle", `${selectedCustomer.customerName} Orders`);
        setText("customerOrderItemsTitle", `${selectedCustomer.customerName} Order Items`);
        setText("customerOrderItemsText", "Click View Details to inspect size chart, measurements, and material requirements before adding to plan.");

        setText("selectedCustomerAvatar", getInitials(selectedCustomer.customerName));
        setText("selectedCustomerName", selectedCustomer.customerName);
        setText("selectedCustomerMeta", `${selectedCustomer.customerCode} | ${selectedCustomer.customerType} | ${selectedCustomer.paymentTerms || "Payment terms not set"}`);
        setText("selectedCustomerPhone", selectedCustomer.phone || "-");
        setText("selectedCustomerAddress", selectedCustomer.address || "-");
        setText("selectedCustomerOrders", normalizedItems.length);
        setText("selectedCustomerQty", `${formatNumber(totalQty)} pcs`);
        setText("selectedCustomerDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");
    }

    function renderCatalog() {
        if (!catalogGrid) return;

        let filtered = catalogItems.map(normalizeCatalogItem);

        filtered.sort(function (a, b) {
            return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        });

        if (!filtered.length) {
            const emptyText = selectedCustomerId
                ? "No order items found for the selected customer."
                : "No customer order items found.";

            catalogGrid.innerHTML = `
                <div class="empty-cell">
                    ${emptyText}
                </div>
            `;
            return;
        }

        catalogGrid.innerHTML = filtered.map(function (item) {
            const isSelected = isItemSelected(item.id);

            const materialPreview = getItemMaterialPreview(item);
            const deliveryClass = getDeliveryBadgeClass(item.deliveryDate);
            const priorityClass = getPriorityClass(item.priority);

            return `
                <article class="customer-order-card ${isSelected ? "selected" : ""}">
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
                            <span class="customer-code">${escapeHtml(item.orderNo)}</span>
                            <span class="${priorityClass}">${escapeHtml(item.priority)}</span>
                        </div>

                        <h3>${escapeHtml(item.productName)}</h3>

                        <p class="catalog-customer-name">
                            ${escapeHtml(item.customerName)}
                        </p>

                        <div class="catalog-meta-grid">
                            <div>
                                <span>Customer Type</span>
                                <strong>${escapeHtml(item.customerType)}</strong>
                            </div>
                            <div>
                                <span>Quantity</span>
                                <strong>${formatNumber(item.quantity)} pcs</strong>
                            </div>
                            <div>
                                <span>Delivery</span>
                                <strong>${formatDate(item.deliveryDate)}</strong>
                            </div>
                            <div>
                                <span>Color Sets</span>
                                <strong>${escapeHtml(getColorSummary(item))}</strong>
                            </div>
                        </div>

                        <div class="catalog-mini-status">
                            <span class="${deliveryClass}">
                                ${getDeliveryStatusText(item.deliveryDate)}
                            </span>

                            <span class="${materialPreview.hasShortage ? "material-shortage" : "material-ok"}">
                                ${materialPreview.label}
                            </span>
                        </div>

                        <div class="catalog-card-actions">
                            <button type="button"
                                    class="btn btn-light view-detail-btn"
                                    data-id="${escapeHtml(item.id)}">
                                View Details
                            </button>

                            <button type="button"
                                    class="btn btn-primary add-plan-btn"
                                    data-id="${escapeHtml(item.id)}"
                                    ${isSelected ? "disabled" : ""}>
                                ${isSelected ? "Added" : "Add to Plan"}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        document.querySelectorAll(".view-detail-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                openDetailModal(this.getAttribute("data-id"));
            });
        });

        document.querySelectorAll(".add-plan-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                addToPlan(this.getAttribute("data-id"));
            });
        });
    }

    function openDetailModal(id) {
        const item = catalogItems.map(normalizeCatalogItem).find(function (catalogItem) {
            return isSameItemId(catalogItem.id, id);
        });

        if (!item) return;

        activeDetailItem = item;

        setText("detailProductName", item.productName);
        setText("detailOrderSubtitle", `${item.orderNo} • ${item.customerName}`);
        setText("detailCustomerName", item.customerName);
        setText("detailOrderNo", item.orderNo);
        setText("detailCustomerType", item.customerType);
        setText("detailPriority", item.priority);
        setText("detailDeliveryBadge", getDeliveryStatusText(item.deliveryDate));
        setText("detailItemName", item.productName);
        setText("detailQuantity", `${formatNumber(item.quantity)} pcs`);
        setText("detailDeliveryDate", formatDate(item.deliveryDate));
        setText("detailVariant", getColorSummary(item));
        setText("detailDeliveryLocation", item.deliveryLocation);
        setText("detailProductionNotes", item.productionNotes);

        const image = document.getElementById("detailProductImage");
        if (image) {
            image.src = item.productImage;
            image.alt = item.productName;
        }

        const priorityElement = document.getElementById("detailPriority");
        if (priorityElement) {
            priorityElement.className = getPriorityClass(item.priority);
        }

        const deliveryElement = document.getElementById("detailDeliveryBadge");
        if (deliveryElement) {
            deliveryElement.className = getDeliveryBadgeClass(item.deliveryDate);
        }

        renderDetailSizeBreakdown(item);
        renderDetailMeasurements(item);
        renderDetailMaterials(item);

        if (addDetailToPlanBtn) {
            const alreadyAdded = isItemSelected(item.id);
            addDetailToPlanBtn.disabled = alreadyAdded;
            addDetailToPlanBtn.textContent = alreadyAdded ? "Already Added to Plan" : "Add to Production Plan";
        }

        if (orderDetailModal) {
            orderDetailModal.classList.remove("hidden");
        }
    }

    function renderDetailSizeBreakdown(item) {
        const body = document.getElementById("detailSizeBreakdownBody");
        if (!body) return;

        if (!item.sizes.length) {
            body.innerHTML = `<tr><td colspan="3" class="empty-cell">No size data.</td></tr>`;
            return;
        }

        const rows = getSizeColorRows(item);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="3" class="empty-cell">No size/color data.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.size)}</td>
                    <td><span class="color-variant-chip">${escapeHtml(row.color)}</span></td>
                    <td>${formatNumber(row.quantity)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderDetailMeasurements(item) {
        const body = document.getElementById("detailMeasurementBody");
        if (!body) return;

        if (!item.measurements.length) {
            body.innerHTML = `<tr><td colspan="6" class="empty-cell">No measurement data.</td></tr>`;
            return;
        }

        body.innerHTML = item.measurements.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.size)}</td>
                    <td>${escapeHtml(row.chest)}</td>
                    <td>${escapeHtml(row.shoulder)}</td>
                    <td>${escapeHtml(row.sleeve)}</td>
                    <td>${escapeHtml(row.length)}</td>
                    <td>${escapeHtml(row.unit)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderDetailMaterials(item) {
        const body = document.getElementById("detailMaterialBody");
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
        const item = catalogItems.map(normalizeCatalogItem).find(function (catalogItem) {
            return isSameItemId(catalogItem.id, id);
        });

        if (!item) return;

        if (isItemSelected(id)) {
            alert("This order item is already added to the production plan.");
            return;
        }

        selectedPlanItems.push(item);
        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function removeFromPlan(id) {
        selectedPlanItems = selectedPlanItems.filter(function (item) {
            return !isSameItemId(item.id, id);
        });

        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function renderBasket() {
        if (!planBasketItems) return;

        if (!selectedPlanItems.length) {
            planBasketItems.innerHTML = `
                <div class="basket-empty-state">
                    No items added yet.
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
                            <span>${escapeHtml(item.customerName)}</span>
                            <small>${formatNumber(item.quantity)} pcs • ${formatDate(item.deliveryDate)}</small>
                        </div>

                        <button type="button"
                                class="basket-remove-btn"
                                data-id="${escapeHtml(item.id)}"
                                aria-label="Remove ${escapeHtml(item.productName)} from basket">
                            ×
                        </button>
                    </div>
                `;
            }).join("");
        }

        document.querySelectorAll(".basket-remove-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                removeFromPlan(this.getAttribute("data-id"));
            });
        });

        updateBasketSummary();
    }

    function updateBasketSummary() {
        const totalItems = selectedPlanItems.length;
        const totalQty = selectedPlanItems.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);

        const earliestDelivery = selectedPlanItems.length
            ? selectedPlanItems.map(function (item) {
                return item.deliveryDate;
            }).sort()[0]
            : null;

        setText("selectedItemCount", totalItems);
        setText("selectedTotalQty", formatNumber(totalQty));
        setText("selectedEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");

        setText("basketTotalItems", totalItems);
        setText("basketTotalQty", formatNumber(totalQty));
        setText("basketEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");

        syncSelectedDraftJson();
        updateBasketActionState();
    }

    function syncSelectedDraftJson() {
        if (selectedDraftJson) {
            selectedDraftJson.value = JSON.stringify(selectedPlanItems);
        }
    }

    function updateBasketActionState() {
        const hasItems = selectedPlanItems.length > 0;

        if (checkBulkMaterialBtn) {
            checkBulkMaterialBtn.disabled = !hasItems;
        }

        if (clearBasketBtn) {
            clearBasketBtn.disabled = !hasItems;
        }

        if (createProductionPlanBtn) {
            createProductionPlanBtn.disabled = !hasItems;
        }
    }

    function setBasketMaterialStatus(value, state) {
        if (!basketMaterialStatus) return;

        basketMaterialStatus.textContent = value;
        basketMaterialStatus.classList.remove("material-ok-text", "material-shortage-text");

        if (state === "ok") {
            basketMaterialStatus.classList.add("material-ok-text");
        }

        if (state === "shortage") {
            basketMaterialStatus.classList.add("material-shortage-text");
        }
    }

    function checkBulkMaterials() {
        if (!selectedPlanItems.length) {
            resetBulkMaterialTable();
            alert("Please add at least one item to the production plan first.");
            return;
        }

        const rows = calculateMaterialRequirementForItems(selectedPlanItems);

        if (!rows.length) {
            if (!bulkMaterialBody) return;

            bulkMaterialBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        No BOM/material data found for selected items.
                    </td>
                </tr>
            `;

            setBasketMaterialStatus("No BOM found");
            return;
        }

        const hasShortage = rows.some(function (row) {
            return row.shortageQty > 0;
        });

        if (!bulkMaterialBody) return;

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

        setBasketMaterialStatus(hasShortage ? "Shortage" : "Available", hasShortage ? "shortage" : "ok");
    }

    function calculateMaterialRequirementForItems(items) {
        const grouped = {};

        items.forEach(function (item) {
            const itemBomRows = getBomRowsForProduct(item.productId);

            itemBomRows.forEach(function (bom) {
                const material = getMaterialById(bom.materialId);
                const requiredQty = Number(item.quantity || 0) * Number(bom.qtyPerUnit || 0) * (1 + Number(bom.wastagePercent || 0) / 100);

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
                    Add items to production plan basket, then click Check Materials in Bulk.
                </td>
            </tr>
        `;

        setBasketMaterialStatus("Not checked");
    }

    function normalizeCatalogItem(item) {
        return {
            id: item.id || item.orderItemId || 0,
            orderNo: item.orderNo || "ORDER",
            customerId: item.customerId || 0,
            customerCode: item.customerCode || "",
            customerName: item.customerName || item.name || "",
            customerType: item.customerType || item.type || "",
            phone: item.phone || "",
            address: item.address || "",
            paymentTerms: item.paymentTerms || "",
            deliveryLocation: item.deliveryLocation || item.address || "",
            orderDate: item.orderDate || "",
            deliveryDate: item.deliveryDate || "",
            priority: item.priority || "Normal",
            productId: item.productId || item.productCode || "",
            productCode: item.productCode || item.productId || "",
            productName: item.productName || item.orderItem || item.itemName || "",
            category: item.category || "",
            variant: item.variant || "",
            quantity: Number(item.quantity || item.orderQty || item.qty || 0),
            productImage: item.productImage || item.orderImage || fallbackProductImage,
            customerImage: item.customerImage || "",
            materialStatus: item.materialStatus || "Unchecked",
            productionNotes: item.productionNotes || "No special notes.",
            sizes: item.sizes || [],
            measurements: item.measurements || []
        };
    }

    function getSizeColorRows(item) {
        const rows = [];

        (item.sizes || []).forEach(function (sizeRow) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            if (colorRows.length) {
                colorRows.forEach(function (colorRow) {
                    rows.push({
                        size: sizeRow.size || "-",
                        color: colorRow.color || colorRow.variant || colorRow.name || "-",
                        quantity: Number(colorRow.quantity || colorRow.qty || 0)
                    });
                });

                return;
            }

            rows.push({
                size: sizeRow.size || "-",
                color: sizeRow.color || item.variant || "-",
                quantity: Number(sizeRow.quantity || sizeRow.qty || 0)
            });
        });

        return rows;
    }

    function getColorSummary(item) {
        const colors = [];

        getSizeColorRows(item).forEach(function (row) {
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

    function isItemSelected(id) {
        return selectedPlanItems.some(function (selected) {
            return isSameItemId(selected.id, id);
        });
    }

    function isSameItemId(left, right) {
        return String(left || "") === String(right || "");
    }

    function getPriorityWeight(priority) {
        if (priority === "Urgent") return 1;
        if (priority === "Seasonal") return 2;
        return 3;
    }

    function getPriorityClass(priority) {
        if (priority === "Urgent") return "priority-badge priority-urgent";
        if (priority === "Seasonal") return "priority-badge priority-seasonal";
        return "priority-badge priority-normal";
    }

    function getDeliveryBadgeClass(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (diffDays < 0 || diffDays <= 7) {
            return "customer-delivery-warning";
        }

        return "customer-delivery-normal";
    }

    function getDeliveryStatusText(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (!dateValue) return "No delivery date";
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

    function getInitials(value) {
        return String(value || "Customer")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(function (part) {
                return part.charAt(0).toUpperCase();
            })
            .join("");
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
