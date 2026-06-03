document.addEventListener("DOMContentLoaded", function () {
    const plans = (window.mockProductionPlans || window.productionPlans || window.plans || []).map(normalizePlan);

    const selectedPlanNoFromRoute = document.getElementById("selectedPlanNoFromRoute")?.value || "";
    const planList = document.getElementById("planList");
    const planPagination = document.getElementById("planPagination");
    const detailBody = document.getElementById("planDetailBody");
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
    }

    function resetToFirstPageAndRender() {
        currentPage = 1;
        shouldPageToActivePlan = false;
        renderPlans();
    }

    function renderPlans() {
        if (!planList) return;

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
            planList.innerHTML = `<div class="empty-cell">No plans found.</div>`;
            renderPagination(0);
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

        planList.innerHTML = pagePlans.map(function (plan) {
            const productNames = plan.products.slice(0, 3).map(function (product) {
                return product.productName;
            }).join(", ");

            const moreText = plan.products.length > 3
                ? ` +${plan.products.length - 3} more`
                : "";

            const isActive = plan.planNo === activePlanNo ? "active" : "";
            const isRisk = plan.products.some(function (product) {
                return product.risk || String(product.priority).toLowerCase() === "urgent";
            });
            const duration = daysBetween(plan.factoryStart, plan.factoryFinish);
            const barWidth = Math.min(duration * 10, 100);

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

                    <div class="factory-window">
                        <span>Factory window</span>
                        <div class="bar-track">
                            <div class="bar-fill ${isRisk ? "risk" : ""}" style="width:${barWidth}%"></div>
                        </div>
                    </div>

                    <div class="product-chips">
                        <span class="product-chip">${escapeHtml(productNames)}${escapeHtml(moreText)}</span>
                    </div>
                </article>
            `;
        }).join("");

        renderPagination(filteredPlans.length);

        document.querySelectorAll(".plan-card").forEach(function (card) {
            card.addEventListener("click", function () {
                activePlanNo = card.getAttribute("data-plan-no");
                renderPlans();
                renderDetails();
            });
        });
    }

    function renderPagination(totalItems) {
        if (!planPagination) return;

        if (!totalItems) {
            planPagination.innerHTML = "";
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

        planPagination.innerHTML = `
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

        planPagination.querySelectorAll("[data-page]").forEach(function (button) {
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
            viewPlanDetailsBtn.href = encodedPlanNo ? `/Production/Details/${encodedPlanNo}` : "/Production/Details";
        }

        if (editPlanBtn) {
            editPlanBtn.href = encodedPlanNo ? `/Production/Edit/${encodedPlanNo}` : "/Production/Edit";
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

        sizes.forEach(function (sizeRow) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            if (colorRows.length) {
                colorRows.forEach(function (colorRow) {
                    rows.push({
                        size: sizeRow.size || "-",
                        color: colorRow.color || colorRow.variant || colorRow.name || product.variant || "-",
                        quantity: Number(colorRow.quantity || colorRow.qty || 0)
                    });
                });
                return;
            }

            rows.push({
                size: sizeRow.size || "-",
                color: sizeRow.color || product.variant || "-",
                quantity: Number(sizeRow.quantity || sizeRow.qty || 0)
            });
        });

        return rows;
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
});
