document.addEventListener("DOMContentLoaded", function () {
    const plans = [
        {
            planNo: "PP-20260602-001",
            demandType: "Outlet Replenishment",
            source: "Multiple Outlets",
            status: "Material Check",
            statusClass: "status-material",
            totalQty: 390,
            productCount: 4,
            factoryStart: "2026-06-04",
            factoryFinish: "2026-06-13",
            earliestRequired: "2026-06-06",
            latestRequired: "2026-06-15",
            risk: "1 urgent item",
            products: [
                {
                    product: "Black Polo T-shirt",
                    source: "New Road Outlet",
                    qty: 120,
                    requiredDate: "2026-06-06",
                    plannedStart: "2026-06-04",
                    plannedFinish: "2026-06-07",
                    status: "Material Check",
                    risk: true,
                    sizes: { S: 15, M: 40, L: 35, XL: 20, XXL: 10 }
                },
                {
                    product: "White School Shirt",
                    source: "Lalitpur Outlet",
                    qty: 90,
                    requiredDate: "2026-06-09",
                    plannedStart: "2026-06-05",
                    plannedFinish: "2026-06-09",
                    status: "Draft",
                    risk: false,
                    sizes: { S: 10, M: 30, L: 30, XL: 20 }
                },
                {
                    product: "Hotel Staff Uniform",
                    source: "Pokhara Outlet",
                    qty: 80,
                    requiredDate: "2026-06-12",
                    plannedStart: "2026-06-08",
                    plannedFinish: "2026-06-12",
                    status: "Draft",
                    risk: false,
                    sizes: { M: 25, L: 35, XL: 20 }
                },
                {
                    product: "Hoodie",
                    source: "New Road Outlet",
                    qty: 100,
                    requiredDate: "2026-06-15",
                    plannedStart: "2026-06-10",
                    plannedFinish: "2026-06-13",
                    status: "Draft",
                    risk: false,
                    sizes: { S: 20, M: 35, L: 30, XL: 15 }
                }
            ]
        },
        {
            planNo: "PP-20260602-002",
            demandType: "Customer Order",
            source: "Global School",
            status: "Draft",
            statusClass: "status-draft",
            totalQty: 260,
            productCount: 2,
            factoryStart: "2026-06-06",
            factoryFinish: "2026-06-11",
            earliestRequired: "2026-06-10",
            latestRequired: "2026-06-12",
            risk: "On schedule",
            products: [
                {
                    product: "White School Shirt",
                    source: "Global School",
                    qty: 140,
                    requiredDate: "2026-06-10",
                    plannedStart: "2026-06-06",
                    plannedFinish: "2026-06-09",
                    status: "Draft",
                    risk: false,
                    sizes: { S: 25, M: 50, L: 45, XL: 20 }
                },
                {
                    product: "Formal Trouser",
                    source: "Global School",
                    qty: 120,
                    requiredDate: "2026-06-12",
                    plannedStart: "2026-06-08",
                    plannedFinish: "2026-06-11",
                    status: "Draft",
                    risk: false,
                    sizes: { M: 40, L: 50, XL: 30 }
                }
            ]
        },
        {
            planNo: "PP-20260602-003",
            demandType: "In-house Stock",
            source: "Main Warehouse",
            status: "In Production",
            statusClass: "status-running",
            totalQty: 180,
            productCount: 1,
            factoryStart: "2026-06-03",
            factoryFinish: "2026-06-08",
            earliestRequired: "2026-06-14",
            latestRequired: "2026-06-14",
            risk: "On schedule",
            products: [
                {
                    product: "Kurta Set",
                    source: "Main Warehouse",
                    qty: 180,
                    requiredDate: "2026-06-14",
                    plannedStart: "2026-06-03",
                    plannedFinish: "2026-06-08",
                    status: "In Production",
                    risk: false,
                    sizes: { S: 25, M: 60, L: 55, XL: 40 }
                }
            ]
        }
    ];

    const selectedPlanNoFromRoute = document.getElementById("selectedPlanNoFromRoute")?.value || "";
    const planList = document.getElementById("planList");
    const detailBody = document.getElementById("planDetailBody");
const demandTypeFilter = document.getElementById("demandTypeFilter");
const statusFilter = document.getElementById("statusFilter");
const fromDateFilter = document.getElementById("fromDateFilter");
const toDateFilter = document.getElementById("toDateFilter");
const productSearch = document.getElementById("productSearch");
const sourceSearch = document.getElementById("sourceSearch");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

    let activePlanNo = selectedPlanNoFromRoute || plans[0].planNo;

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
            element.addEventListener("input", renderPlans);
            element.addEventListener("change", renderPlans);
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

            renderPlans();
        });
    }

    const printBtn = document.getElementById("printPlanBtn");

    if (printBtn) {
        printBtn.addEventListener("click", function () {
            window.print();
        });
    }
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
        const productText = plan.products.map(function (product) {
            return product.product;
        }).join(" ").toLowerCase();

        return productText.includes(productSearchText);
    });
}

if (sourceSearchText) {
    filteredPlans = filteredPlans.filter(function (plan) {
        return plan.source.toLowerCase().includes(sourceSearchText) ||
            plan.products.some(function (product) {
                return product.source.toLowerCase().includes(sourceSearchText);
            });
    });
}

if (fromDateValue) {
    filteredPlans = filteredPlans.filter(function (plan) {
        return new Date(plan.earliestRequired) >= new Date(fromDateValue) ||
            plan.products.some(function (product) {
                return new Date(product.requiredDate) >= new Date(fromDateValue);
            });
    });
}

if (toDateValue) {
    filteredPlans = filteredPlans.filter(function (plan) {
        return new Date(plan.latestRequired) <= new Date(toDateValue) ||
            plan.products.some(function (product) {
                return new Date(product.requiredDate) <= new Date(toDateValue);
            });
    });
}

        if (!filteredPlans.length) {
            planList.innerHTML = `<div class="empty-cell">No plans found.</div>`;
            return;
        }

        planList.innerHTML = filteredPlans.map(function (plan) {
            const productNames = plan.products.slice(0, 3).map(function (product) {
                return product.product;
            }).join(", ");

            const moreText = plan.products.length > 3
                ? ` +${plan.products.length - 3} more`
                : "";

            const isActive = plan.planNo === activePlanNo ? "active" : "";
            const isRisk = String(plan.risk).toLowerCase().includes("urgent");
            const duration = daysBetween(plan.factoryStart, plan.factoryFinish);
            const barWidth = Math.min(duration * 10, 100);

            return `
                <article class="plan-card ${isActive}" data-plan-no="${escapeHtml(plan.planNo)}">
                    <div class="plan-top">
                        <div>
                            <div class="plan-no">${escapeHtml(plan.planNo)}</div>
                            <h3 class="plan-title">${escapeHtml(plan.demandType)} • ${escapeHtml(plan.source)}</h3>
                        </div>

                        <span class="status-badge ${plan.statusClass}">
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
                            <strong>${escapeHtml(plan.risk)}</strong>
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

        document.querySelectorAll(".plan-card").forEach(function (card) {
            card.addEventListener("click", function () {
                activePlanNo = card.getAttribute("data-plan-no");
                renderPlans();
                renderDetails();
            });
        });
    }

    function renderDetails() {
        if (!detailBody) return;

        const plan = plans.find(function (item) {
            return item.planNo === activePlanNo;
        }) || plans[0];

        const productCards = plan.products.map(function (product) {
            const sizePills = Object.entries(product.sizes || {}).map(function ([size, qty]) {
                return `<span class="size-pill">${escapeHtml(size)}: ${formatNumber(qty)}</span>`;
            }).join("");

            return `
                <article class="product-date-card">
                    <div class="product-date-head">
                        <div>
                            <h4>${escapeHtml(product.product)}</h4>
                            <p>${escapeHtml(product.source)} • ${formatNumber(product.qty)} pcs</p>
                        </div>

                        <span class="status-badge ${product.risk ? "status-risk" : "status-ok"}">
                            ${product.risk ? "Date Risk" : "OK"}
                        </span>
                    </div>

                    <div class="product-date-grid">
                        <div>
                            <span>Quantity</span>
                            <strong>${formatNumber(product.qty)} pcs</strong>
                        </div>

                        <div>
                            <span>Required Date</span>
                            <strong>${formatDate(product.requiredDate)}</strong>
                        </div>

                        <div>
                            <span>Planned Start</span>
                            <strong>${formatDate(product.plannedStart)}</strong>
                        </div>

                        <div>
                            <span>Planned Finish</span>
                            <strong>${formatDate(product.plannedFinish)}</strong>
                        </div>
                    </div>

                    <div class="size-row">
                        ${sizePills || `<span class="size-pill">No size data</span>`}
                    </div>
                </article>
            `;
        }).join("");

        const tableRows = plan.products.map(function (product) {
            return `
                <tr>
                    <td><strong>${escapeHtml(product.product)}</strong></td>
                    <td>${escapeHtml(product.source)}</td>
                    <td>${formatNumber(product.qty)} pcs</td>
                    <td>${formatDate(product.requiredDate)}</td>
                    <td>${formatDate(product.plannedStart)}</td>
                    <td>${formatDate(product.plannedFinish)}</td>
                    <td>
                        <span class="status-badge ${product.risk ? "status-risk" : "status-ok"}">
                            ${escapeHtml(product.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

        detailBody.innerHTML = `
            <div class="selected-plan-head">
                <div>
                    <small>Plan No</small>
                    <h3>${escapeHtml(plan.planNo)}</h3>
                    <small>${escapeHtml(plan.demandType)} • ${escapeHtml(plan.source)}</small>
                </div>

                <span class="status-badge ${plan.statusClass}">
                    ${escapeHtml(plan.status)}
                </span>
            </div>

            <div class="date-summary-grid">
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

            <div class="factory-note">
                <strong>Planning rule:</strong>
                The plan has one factory window, but every product inside the plan can have its own required date,
                planned start date, and planned finish date.
            </div>

            <h4 class="section-title">Product Schedule Inside This Plan</h4>

            ${productCards}

            <h4 class="section-title">Compact Table View</h4>

            <div class="table-wrap">
                <table class="plan-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Source</th>
                            <th>Qty</th>
                            <th>Required</th>
                            <th>Start</th>
                            <th>Finish</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    function daysBetween(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 1;
        }

        return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
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
