document.addEventListener("DOMContentLoaded", function () {
    const plans = (window.mockProductionPlans || window.productionPlans || window.plans || []).map(normalizePlan);

    const selectedPlanNoFromRoute = document.getElementById("selectedPlanNoFromRoute")?.value || "";
    const planTableView = document.getElementById("planTableView");
    const planCardView = document.getElementById("planCardView");
    const planTableBody = document.getElementById("planTableBody");
    const planTablePagination = document.getElementById("planTablePagination");
    const planList = document.getElementById("planList");
    const planPagination = document.getElementById("planPagination");
    const detailBody = document.getElementById("planDetailBody");
    const viewToggleButtons = document.querySelectorAll("[data-plan-view]");
    const demandTypeFilter = document.getElementById("demandTypeFilter");
    const statusFilter = document.getElementById("statusFilter");
    const fromDateFilter = document.getElementById("fromDateFilter");
    const toDateFilter = document.getElementById("toDateFilter");
    const productSearch = document.getElementById("productSearch");
    const sourceSearch = document.getElementById("sourceSearch");
    const resetFiltersBtn = document.getElementById("resetFiltersBtn");
    const viewPlanDetailsBtn = document.getElementById("viewPlanDetailsBtn");
    const editPlanBtn = document.getElementById("editPlanBtn");
    const pageSize = 5;

    let activeView = "table";
    let activePlanNo = selectedPlanNoFromRoute || plans[0]?.planNo || "";
    let currentPage = 1;
    let shouldPageToActivePlan = Boolean(selectedPlanNoFromRoute);

    renderPlans();
    renderDetails();
    attachEvents();

    function attachEvents() {
        [
            demandTypeFilter,
            statusFilter,
            fromDateFilter,
            toDateFilter,
            productSearch,
            sourceSearch
        ].forEach(function (element) {
            if (element) {
                element.addEventListener("input", resetToFirstPageAndRender);
                element.addEventListener("change", resetToFirstPageAndRender);
            }
        });

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener("click", function () {
                if (demandTypeFilter) demandTypeFilter.value = "";
                if (statusFilter) statusFilter.value = "";
                if (fromDateFilter) fromDateFilter.value = "";
                if (toDateFilter) toDateFilter.value = "";
                if (productSearch) productSearch.value = "";
                if (sourceSearch) sourceSearch.value = "";

                currentPage = 1;
                shouldPageToActivePlan = false;
                renderPlans();
            });
        }

        viewToggleButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                setActiveView(button.getAttribute("data-plan-view") || "table");
            });
        });
    }

    function resetToFirstPageAndRender() {
        currentPage = 1;
        shouldPageToActivePlan = false;
        renderPlans();
    }

    function renderPlans() {
        if (!planList && !planTableBody) return;

        let filteredPlans = plans.slice();

        const demandTypeValue = demandTypeFilter ? demandTypeFilter.value : "";
        const statusValue = statusFilter ? statusFilter.value : "";
        const fromDateValue = fromDateFilter ? fromDateFilter.value : "";
        const toDateValue = toDateFilter ? toDateFilter.value : "";
        const productSearchText = productSearch ? productSearch.value.toLowerCase().trim() : "";
        const sourceSearchText = sourceSearch ? sourceSearch.value.toLowerCase().trim() : "";

        if (demandTypeValue) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return plan.demandType === demandTypeValue;
            });
        }

        if (statusValue) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return plan.status === statusValue;
            });
        }

        if (productSearchText) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return plan.products.some(function (product) {
                    return product.productName.toLowerCase().includes(productSearchText);
                });
            });
        }

        if (sourceSearchText) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return plan.sourceName.toLowerCase().includes(sourceSearchText)
                    || plan.products.some(function (product) {
                        return product.sourceName.toLowerCase().includes(sourceSearchText);
                    });
            });
        }

        if (fromDateValue) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return isSameOrAfter(plan.earliestRequired, fromDateValue)
                    || plan.products.some(function (product) {
                        return isSameOrAfter(product.requiredDate, fromDateValue);
                    });
            });
        }

        if (toDateValue) {
            filteredPlans = filteredPlans.filter(function (plan) {
                return isSameOrBefore(plan.latestRequired, toDateValue)
                    || plan.products.some(function (product) {
                        return isSameOrBefore(product.requiredDate, toDateValue);
                    });
            });
        }

        if (!filteredPlans.length) {
            if (planTableBody) {
                planTableBody.innerHTML = `<tr><td colspan="9" class="empty-cell">No plans found.</td></tr>`;
            }

            if (planList) {
                planList.innerHTML = `<div class="empty-cell">No plans found.</div>`;
            }

            renderPagination(planTablePagination, 0);
            renderPagination(planPagination, 0);

            if (!plans.some(function (plan) { return plan.planNo === activePlanNo; })) {
                activePlanNo = plans[0]?.planNo || "";
                renderDetails();
            }
            return;
        }

        if (!filteredPlans.some(function (plan) { return plan.planNo === activePlanNo; })) {
            activePlanNo = filteredPlans[0].planNo;
            renderDetails();
        }

        const totalPages = Math.max(Math.ceil(filteredPlans.length / pageSize), 1);

        if (shouldPageToActivePlan) {
            const activeIndex = filteredPlans.findIndex(function (plan) {
                return plan.planNo === activePlanNo;
            });

            if (activeIndex >= 0) {
                currentPage = Math.floor(activeIndex / pageSize) + 1;
            }

            shouldPageToActivePlan = false;
        }

        currentPage = Math.min(Math.max(currentPage, 1), totalPages);

        const startIndex = (currentPage - 1) * pageSize;
        const pagePlans = filteredPlans.slice(startIndex, startIndex + pageSize);

        if (pagePlans.length && !pagePlans.some(function (plan) { return plan.planNo === activePlanNo; })) {
            activePlanNo = pagePlans[0].planNo;
            renderDetails();
        }

        renderTableRows(pagePlans);
        renderCardRows(pagePlans);
        renderPagination(planTablePagination, filteredPlans.length);
        renderPagination(planPagination, filteredPlans.length);
    }

    function renderTableRows(pagePlans) {
        if (!planTableBody) return;

        planTableBody.innerHTML = pagePlans.map(function (plan) {
            const productSummary = getProductSummary(plan);

            return `
                <tr class="${plan.planNo === activePlanNo ? "active" : ""}" data-table-plan-no="${escapeHtml(plan.planNo)}">
                    <td><strong>${escapeHtml(plan.planNo)}</strong></td>
                    <td>${escapeHtml(plan.demandType)}</td>
                    <td>${escapeHtml(plan.sourceName)}</td>
                    <td>${escapeHtml(productSummary)}</td>
                    <td>${formatNumber(plan.totalQty)} pcs</td>
                    <td>${formatDateShort(plan.earliestRequired)} - ${formatDateShort(plan.latestRequired)}</td>
                    <td>
                        <span class="status-badge ${statusClass(plan.status)}">
                            ${escapeHtml(plan.status)}
                        </span>
                    </td>
                    <td>${escapeHtml(plan.riskText)}</td>
                    <td>
                        <div class="table-action-row">
                            <button type="button" class="btn btn-light btn-sm" data-select-plan="${escapeHtml(plan.planNo)}">
                                Quick View
                            </button>
                            <a class="btn btn-light btn-sm" href="/Production/Plan/Details/${encodeURIComponent(plan.planNo)}">
                                Details
                            </a>
                            <a class="btn btn-primary btn-sm" href="/Production/Plan/Edit/${encodeURIComponent(plan.planNo)}">
                                Edit
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        planTableBody.querySelectorAll("[data-select-plan]").forEach(function (button) {
            button.addEventListener("click", function () {
                activePlanNo = button.getAttribute("data-select-plan") || activePlanNo;
                setActiveView("card");
                renderPlans();
                renderDetails();
            });
        });

        planTableBody.querySelectorAll("[data-table-plan-no]").forEach(function (row) {
            row.addEventListener("click", function (event) {
                if (event.target.closest("a, button")) return;

                activePlanNo = row.getAttribute("data-table-plan-no") || activePlanNo;
                renderPlans();
                renderDetails();
            });
        });
    }

    function renderCardRows(pagePlans) {
        if (!planList) return;

        planList.innerHTML = pagePlans.map(function (plan) {
            const isActive = plan.planNo === activePlanNo ? "active" : "";

            return `
                <article class="plan-card ${isActive}" data-plan-no="${escapeHtml(plan.planNo)}">
                    <div class="plan-top">
                        <div>
                            <div class="plan-no">${escapeHtml(plan.planNo)}</div>
                            <h3 class="plan-title">${escapeHtml(plan.demandType)} | ${escapeHtml(plan.sourceName)}</h3>
                        </div>

                        <span class="status-badge ${statusClass(plan.status)}">
                            ${escapeHtml(plan.status)}
                        </span>
                    </div>

                    <div class="plan-meta-grid">
                        <div class="mini-box">
                            <span>Products</span>
                            <strong>${formatNumber(plan.productCount)}</strong>
                        </div>

                        <div class="mini-box">
                            <span>Total Qty</span>
                            <strong>${formatNumber(plan.totalQty)} pcs</strong>
                        </div>

                        <div class="mini-box">
                            <span>Required</span>
                            <strong>${formatDateShort(plan.earliestRequired)} - ${formatDateShort(plan.latestRequired)}</strong>
                        </div>

                        <div class="mini-box">
                            <span>Date Risk</span>
                            <strong>${escapeHtml(plan.riskText)}</strong>
                        </div>
                    </div>

                    <div class="product-chips">
                        <span class="product-chip">${escapeHtml(getProductSummary(plan))}</span>
                    </div>
                </article>
            `;
        }).join("");

        document.querySelectorAll(".plan-card").forEach(function (card) {
            card.addEventListener("click", function () {
                activePlanNo = card.getAttribute("data-plan-no");
                renderPlans();
                renderDetails();
            });
        });
    }

    function renderPagination(paginationHost, totalItems) {
        if (!paginationHost) return;

        if (!totalItems) {
            paginationHost.innerHTML = "";
            return;
        }

        const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
        const startItem = ((currentPage - 1) * pageSize) + 1;
        const endItem = Math.min(currentPage * pageSize, totalItems);
        const pageButtons = Array.from({ length: totalPages }, function (_, index) {
            const page = index + 1;
            const activeClass = page === currentPage ? "active" : "";

            return `
                <button type="button"
                        class="page-btn ${activeClass}"
                        data-page="${page}">
                    ${page}
                </button>
            `;
        }).join("");

        paginationHost.innerHTML = `
            <div class="pagination-info">
                Showing ${formatNumber(startItem)}-${formatNumber(endItem)} of ${formatNumber(totalItems)}
            </div>

            <div class="pagination-actions">
                <button type="button"
                        class="page-btn"
                        data-page="${currentPage - 1}"
                        ${currentPage === 1 ? "disabled" : ""}>
                    Previous
                </button>

                ${pageButtons}

                <button type="button"
                        class="page-btn"
                        data-page="${currentPage + 1}"
                        ${currentPage === totalPages ? "disabled" : ""}>
                    Next
                </button>
            </div>
        `;

        paginationHost.querySelectorAll("[data-page]").forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();

                const page = Number(button.getAttribute("data-page"));
                if (!page || page === currentPage || page < 1 || page > totalPages) return;

                currentPage = page;
                shouldPageToActivePlan = false;
                renderPlans();
            });
        });
    }

    function setActiveView(view) {
        activeView = view === "card" ? "card" : "table";

        if (planTableView) {
            planTableView.classList.toggle("hidden", activeView !== "table");
        }

        if (planCardView) {
            planCardView.classList.toggle("hidden", activeView !== "card");
        }

        viewToggleButtons.forEach(function (button) {
            button.classList.toggle("active", button.getAttribute("data-plan-view") === activeView);
        });
    }

    function getProductSummary(plan) {
        const productNames = plan.products.slice(0, 3).map(function (product) {
            return product.productName;
        }).join(", ");

        return plan.products.length > 3
            ? `${productNames} +${plan.products.length - 3} more`
            : productNames;
    }

    function renderDetails() {
        if (!detailBody) return;

        const plan = plans.find(function (item) {
            return item.planNo === activePlanNo;
        }) || plans[0];

        if (!plan) {
            detailBody.innerHTML = `<div class="empty-cell">No production plans found.</div>`;
            updatePlanActionLinks("");
            return;
        }

        activePlanNo = plan.planNo;
        updatePlanActionLinks(plan.planNo);

        const quickProductRows = plan.products.map(function (product) {
            return `
                <div class="quick-product-row">
                    <div class="quick-product-main">
                        <strong>${escapeHtml(product.productName)}</strong>
                        <span>${escapeHtml(product.variant || "-")} | ${escapeHtml(product.sourceName)}</span>
                        ${renderPalettePreviewHtml(product.variant, { compact: true })}
                    </div>

                    <div class="quick-product-meta">
                        <span>${formatNumber(product.quantity)} pcs</span>
                        <span>Required ${formatDateShort(product.requiredDate)}</span>
                        <span class="status-badge ${product.risk ? "status-risk" : "status-ok"}">
                            ${escapeHtml(product.risk ? "Risk" : product.status)}
                        </span>
                    </div>
                </div>
            `;
        }).join("");

        detailBody.innerHTML = `
            <div class="selected-plan-head">
                <div>
                    <small>Plan No</small>
                    <h3>${escapeHtml(plan.planNo)}</h3>
                    <small>${escapeHtml(plan.demandType)} | ${escapeHtml(plan.sourceName)}</small>
                </div>

                <span class="status-badge ${statusClass(plan.status)}">
                    ${escapeHtml(plan.status)}
                </span>
            </div>

            <div class="date-summary-grid">
                <div class="date-card">
                    <span>Products</span>
                    <strong>${formatNumber(plan.productCount)}</strong>
                </div>

                <div class="date-card">
                    <span>Total Quantity</span>
                    <strong>${formatNumber(plan.totalQty)} pcs</strong>
                </div>

                <div class="date-card">
                    <span>Factory Start</span>
                    <strong>${formatDate(plan.factoryStart)}</strong>
                </div>

                <div class="date-card">
                    <span>Factory Target Finish</span>
                    <strong>${formatDate(plan.factoryFinish)}</strong>
                </div>

                <div class="date-card">
                    <span>Demand Required Range</span>
                    <strong>${formatDateShort(plan.earliestRequired)} - ${formatDateShort(plan.latestRequired)}</strong>
                </div>
            </div>

            <div class="compact-plan-note">
                This is a quick reference only. Open View Details for the full product schedule,
                size breakdown, color variants, materials, and stages.
            </div>

            <h4 class="section-title">Quick Product Reference</h4>

            <div class="quick-product-list">
                ${quickProductRows}
            </div>
        `;
    }

    function updatePlanActionLinks(planNo) {
        const encodedPlanNo = encodeURIComponent(planNo || "");

        if (viewPlanDetailsBtn) {
            viewPlanDetailsBtn.href = encodedPlanNo ? `/Production/Plan/Details/${encodedPlanNo}` : "/Production/Plan/Details";
        }

        if (editPlanBtn) {
            editPlanBtn.href = encodedPlanNo ? `/Production/Plan/Edit/${encodedPlanNo}` : "/Production/Plan/Edit";
        }
    }

    function normalizePlan(plan) {
        const products = Array.isArray(plan.products) && plan.products.length
            ? plan.products.map(function (product, index) {
                return normalizeProduct(product, plan, index);
            })
            : [normalizeProduct(plan, plan, 0)];

        const requiredDates = products.map(function (product) {
            return product.requiredDate;
        }).filter(Boolean).sort();

        const starts = products.map(function (product) {
            return product.plannedStartDate;
        }).filter(Boolean).sort();

        const finishes = products.map(function (product) {
            return product.plannedCompletionDate;
        }).filter(Boolean).sort();

        const urgentCount = products.filter(function (product) {
            return product.risk || String(product.priority || "").toLowerCase() === "urgent";
        }).length;

        return {
            raw: plan,
            planNo: plan.planNo || plan.planId || plan.id || "",
            demandType: plan.demandType || "-",
            sourceName: plan.sourceName || plan.customerName || plan.outletName || plan.warehouseName || "-",
            status: plan.status || "Draft",
            totalQty: products.reduce(function (sum, product) {
                return sum + Number(product.quantity || 0);
            }, 0) || Number(plan.totalQuantity || plan.quantity || 0),
            productCount: products.length,
            factoryStart: plan.plannedStartDate || starts[0] || "",
            factoryFinish: plan.plannedCompletionDate || finishes[finishes.length - 1] || "",
            earliestRequired: requiredDates[0] || plan.requiredDate || "",
            latestRequired: requiredDates[requiredDates.length - 1] || plan.requiredDate || "",
            riskText: urgentCount ? `${urgentCount} urgent item${urgentCount > 1 ? "s" : ""}` : "On schedule",
            products: products
        };
    }

    function normalizeProduct(product, plan, index) {
        return {
            lineId: product.lineId || `${plan.planNo || plan.planId || "PLAN"}-${index + 1}`,
            orderNo: product.orderNo || "",
            demandNo: product.demandNo || "",
            productId: product.productId || plan.productId || "",
            productCode: product.productCode || product.productId || plan.productId || "",
            productName: product.productName || product.product || plan.productName || plan.product || "-",
            category: product.category || plan.category || "-",
            variant: product.variant || product.color || plan.variant || plan.color || "-",
            quantity: Number(product.quantity || product.qty || plan.quantity || plan.totalQuantity || 0),
            sourceName: product.sourceName || product.source || plan.sourceName || plan.customerName || plan.outletName || plan.warehouseName || "-",
            requiredDate: product.requiredDate || plan.requiredDate || "",
            plannedStartDate: product.plannedStartDate || product.plannedStart || plan.plannedStartDate || "",
            plannedCompletionDate: product.plannedCompletionDate || product.plannedFinish || plan.plannedCompletionDate || "",
            status: product.status || plan.status || "Draft",
            priority: product.priority || plan.priority || "Normal",
            risk: Boolean(product.risk),
            sizes: product.sizes || product.sizeBreakdown || plan.sizes || plan.sizeBreakdown || []
        };
    }

    function getSizeColorRows(product) {
        const sizes = product.sizes || [];
        const aggregated = {};

        function add(size, palette, qty) {
            const key = `${size}|${palette}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    size: size,
                    palette: palette,
                    quantity: 0
                };
            }
            aggregated[key].quantity += Number(qty || 0);
        }

        if (!Array.isArray(sizes)) {
            Object.entries(sizes).forEach(function ([size, qty]) {
                add(size, product.variant || "-", qty);
            });
        } else {
            sizes.forEach(function (sizeRow) {
                const size = sizeRow.size || "-";
                const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
                const productPalette = product.variant || "-";

                if (colorRows.length) {
                    colorRows.forEach(function (colorRow) {
                        const palette = colorRow.palette || colorRow.paletteName || sizeRow.palette || productPalette;
                        add(size, palette, colorRow.quantity || colorRow.qty || 0);
                    });
                } else {
                    const palette = sizeRow.palette || sizeRow.paletteName || productPalette;
                    add(size, palette, sizeRow.quantity || sizeRow.qty || 0);
                }
            });
        }

        return Object.values(aggregated);
    }

    function daysBetween(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 1;
        }

        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }

    function isSameOrAfter(value, limit) {
        const date = new Date(value);
        const limitDate = new Date(limit);

        if (Number.isNaN(date.getTime()) || Number.isNaN(limitDate.getTime())) {
            return true;
        }

        return date >= limitDate;
    }

    function isSameOrBefore(value, limit) {
        const date = new Date(value);
        const limitDate = new Date(limit);

        if (Number.isNaN(date.getTime()) || Number.isNaN(limitDate.getTime())) {
            return true;
        }

        return date <= limitDate;
    }

    function statusClass(status) {
        const value = String(status || "").toLowerCase();

        if (value.includes("draft")) return "status-draft";
        if (value.includes("material")) return "status-material";
        if (value.includes("completed")) return "status-completed";
        if (value.includes("hold")) return "status-hold";
        if (value.includes("cutting") || value.includes("production") || value.includes("stitching")) return "status-running";

        return "status-running";
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

    function formatDateShort(dateValue) {
        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short"
        });
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

    function renderPalettePreviewHtml(value, options) {
        const picker = window.ProductionPalettePicker;
        return picker ? picker.renderPreview(value, options) : "";
    }
});
