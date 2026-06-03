document.addEventListener("DOMContentLoaded", function () {
    const currentPlanNoElement = document.getElementById("currentPlanNo");
    const currentPlanNo = currentPlanNoElement ? currentPlanNoElement.value : "PP-20260602-001";

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
            dateRisk: "1 urgent item",
            notes: "This plan contains multiple outlet replenishment products. Black Polo T-shirt is urgent because its required date is earlier than other products.",
            products: [
                {
                    productName: "Black Polo T-shirt",
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
                    productName: "White School Shirt",
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
                    productName: "Hotel Staff Uniform",
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
                    productName: "Hoodie",
                    source: "New Road Outlet",
                    qty: 100,
                    requiredDate: "2026-06-15",
                    plannedStart: "2026-06-10",
                    plannedFinish: "2026-06-13",
                    status: "Draft",
                    risk: false,
                    sizes: { S: 20, M: 35, L: 30, XL: 15 }
                }
            ],
            materials: [
                {
                    materialName: "Cotton Fabric",
                    required: "520 meter",
                    available: "700 meter",
                    shortage: "0 meter",
                    status: "Available"
                },
                {
                    materialName: "Buttons",
                    required: "840 pcs",
                    available: "600 pcs",
                    shortage: "240 pcs",
                    status: "Shortage"
                },
                {
                    materialName: "Sewing Thread",
                    required: "42 roll",
                    available: "58 roll",
                    shortage: "0 roll",
                    status: "Available"
                },
                {
                    materialName: "Brand Label",
                    required: "390 pcs",
                    available: "300 pcs",
                    shortage: "90 pcs",
                    status: "Shortage"
                }
            ],
            timeline: [
                {
                    title: "Plan created",
                    description: "Planner created this plan from outlet demand basket."
                },
                {
                    title: "Material check started",
                    description: "System calculated material requirements for all product lines."
                },
                {
                    title: "Waiting for material decision",
                    description: "Buttons and labels have shortage."
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
            dateRisk: "On schedule",
            notes: "Customer order plan for school uniform set.",
            products: [
                {
                    productName: "White School Shirt",
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
                    productName: "Formal Trouser",
                    source: "Global School",
                    qty: 120,
                    requiredDate: "2026-06-12",
                    plannedStart: "2026-06-08",
                    plannedFinish: "2026-06-11",
                    status: "Draft",
                    risk: false,
                    sizes: { M: 40, L: 50, XL: 30 }
                }
            ],
            materials: [
                {
                    materialName: "White Shirting Fabric",
                    required: "280 meter",
                    available: "330 meter",
                    shortage: "0 meter",
                    status: "Available"
                },
                {
                    materialName: "Trouser Fabric",
                    required: "240 meter",
                    available: "220 meter",
                    shortage: "20 meter",
                    status: "Shortage"
                }
            ],
            timeline: [
                {
                    title: "Plan created",
                    description: "Customer order converted into production plan."
                }
            ]
        }
    ];

    const selectedPlan = plans.find(function (plan) {
        return plan.planNo === currentPlanNo;
    }) || plans[0];

    renderPlan(selectedPlan);
    attachEvents();

    function renderPlan(plan) {
        setText("planNoText", plan.planNo);
        setText("planSubtitle", `${plan.demandType} • ${plan.source}`);
        setText("demandTypeText", plan.demandType);
        setText("sourceText", plan.source);
        setText("productCountText", plan.productCount);
        setText("totalQtyText", `${formatNumber(plan.totalQty)} pcs`);
        setText("factoryStartText", formatDate(plan.factoryStart));
        setText("factoryFinishText", formatDate(plan.factoryFinish));
        setText("requiredRangeText", `${formatDate(plan.earliestRequired)} - ${formatDate(plan.latestRequired)}`);
        setText("dateRiskText", plan.dateRisk);
        setText("planNotesText", plan.notes);

        const statusBadge = document.getElementById("planStatusBadge");

        if (statusBadge) {
            statusBadge.textContent = plan.status;
            statusBadge.className = `status-badge ${plan.statusClass}`;
        }

        renderProductSchedule(plan.products);
        renderProductTable(plan.products);
        renderMaterials(plan.materials);
        renderTimeline(plan.timeline);
    }

    function renderProductSchedule(products) {
        const container = document.getElementById("productScheduleList");

        if (!container) return;

        if (!products.length) {
            container.innerHTML = `<div class="empty-cell">No product schedule found.</div>`;
            return;
        }

        container.innerHTML = products.map(function (product) {
            const riskBadge = product.risk
                ? `<span class="status-badge status-risk">Date Risk</span>`
                : `<span class="status-badge status-ok">OK</span>`;

            const sizePills = Object.entries(product.sizes || {}).map(function ([size, qty]) {
                return `<span class="size-pill">${escapeHtml(size)}: ${formatNumber(qty)}</span>`;
            }).join("");

            return `
                <article class="product-card">
                    <div class="product-card-header">
                        <div>
                            <h3>${escapeHtml(product.productName)}</h3>
                            <p>${escapeHtml(product.source)} • ${formatNumber(product.qty)} pcs</p>
                        </div>
                        ${riskBadge}
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

                    <div class="size-breakdown">
                        ${sizePills || `<span class="size-pill">No size data</span>`}
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderProductTable(products) {
        const body = document.getElementById("productTableBody");

        if (!body) return;

        if (!products.length) {
            body.innerHTML = `<tr><td colspan="7" class="empty-cell">No product data.</td></tr>`;
            return;
        }

        body.innerHTML = products.map(function (product) {
            return `
                <tr>
                    <td><strong>${escapeHtml(product.productName)}</strong></td>
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
    }

    function renderMaterials(materials) {
        const body = document.getElementById("materialTableBody");

        if (!body) return;

        if (!materials.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No material data.</td></tr>`;
            return;
        }

        body.innerHTML = materials.map(function (material) {
            const isShortage = material.status === "Shortage";

            return `
                <tr>
                    <td><strong>${escapeHtml(material.materialName)}</strong></td>
                    <td>${escapeHtml(material.required)}</td>
                    <td>${escapeHtml(material.available)}</td>
                    <td class="${isShortage ? "text-danger" : ""}">${escapeHtml(material.shortage)}</td>
                    <td>
                        <span class="status-badge ${isShortage ? "status-shortage" : "status-available"}">
                            ${escapeHtml(material.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function renderTimeline(timeline) {
        const container = document.getElementById("timelineList");

        if (!container) return;

        if (!timeline.length) {
            container.innerHTML = `<div class="empty-cell">No timeline found.</div>`;
            return;
        }

        container.innerHTML = timeline.map(function (item) {
            return `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div>
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.description)}</p>
                    </div>
                </div>
            `;
        }).join("");
    }

    function attachEvents() {
        const printBtn = document.getElementById("printPlanBtn");

        if (printBtn) {
            printBtn.addEventListener("click", function () {
                window.print();
            });
        }

        document.querySelectorAll(".action-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const actionText = button.childNodes[0].textContent.trim();
                alert(`${actionText} is a mock action for now.`);
            });
        });
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
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

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});