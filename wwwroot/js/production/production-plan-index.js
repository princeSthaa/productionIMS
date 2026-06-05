(function () {
    "use strict";

    let plans = [];

    const chartColors = [
        "#2563eb",
        "#16a34a",
        "#f97316",
        "#7c3aed",
        "#dc2626",
        "#0891b2"
    ];

    document.addEventListener("DOMContentLoaded", init);

    function init() {
        const basePlans = App.getData("mockProductionPlans", "productionPlans", "plans");
        plans = window.ProductionDraftStore && typeof window.ProductionDraftStore.mergeWithPlans === "function"
            ? window.ProductionDraftStore.mergeWithPlans(basePlans)
            : basePlans;

        render();
    }

    function render() {
        renderSummary();
        renderStatusChart();
        renderDemandQuantityChart();
        renderTimelineChart();
        renderTopProductChart();
    }

    function renderSummary() {
        App.setText("#totalPlans", plans.length);

        App.setText("#draftPlans", plans.filter(function (plan) {
            return String(plan.status || "").toLowerCase() === "draft";
        }).length);

        App.setText("#completedPlans", plans.filter(function (plan) {
            return String(plan.status || "").toLowerCase() === "completed";
        }).length);

        App.setText("#inProgressPlans", plans.filter(function (plan) {
            const status = String(plan.status || "").toLowerCase();
            return status !== "draft" && status !== "completed" && status !== "cancelled";
        }).length);
    }

    function renderStatusChart() {
        const statusEntries = toEntries(countBy(plans, function (plan) {
            return plan.status || "Unknown";
        }));

        const total = statusEntries.reduce(function (sum, item) {
            return sum + item.value;
        }, 0);

        App.setText("#statusDonutTotal", total);

        const donut = document.getElementById("statusDonutChart");
        if (donut) {
            donut.style.background = buildConicGradient(statusEntries, total);
        }

        const legend = document.getElementById("statusLegend");
        if (!legend) return;

        if (!statusEntries.length) {
            legend.innerHTML = '<div class="empty-cell">No status data available.</div>';
            return;
        }

        legend.innerHTML = statusEntries.map(function (item, index) {
            return `
                <div class="chart-legend-item">
                    <span class="chart-dot" style="background:${chartColors[index % chartColors.length]}"></span>
                    <strong>${App.escapeHtml(item.label)}</strong>
                    <span>${item.value} plan${item.value === 1 ? "" : "s"}</span>
                </div>
            `;
        }).join("");
    }

    function renderDemandQuantityChart() {
        const demandEntries = toEntries(sumBy(plans, function (plan) {
            return plan.demandType || "Unassigned";
        }, getPlanQuantity));

        renderHorizontalChart("demandQuantityChart", demandEntries, "pcs");
    }

    function renderTimelineChart() {
        const items = plans
            .slice()
            .sort(function (a, b) {
                return new Date(a.plannedStartDate || 0) - new Date(b.plannedStartDate || 0);
            })
            .map(function (plan, index) {
                return {
                    label: plan.planNo || plan.planId || `Plan ${index + 1}`,
                    date: plan.plannedStartDate,
                    value: getPlanQuantity(plan)
                };
            });

        const chart = document.getElementById("quantityTimelineChart");
        if (!chart) return;

        if (!items.length) {
            chart.innerHTML = '<div class="empty-cell">No timeline data available.</div>';
            return;
        }

        const maxValue = Math.max.apply(null, items.map(function (item) {
            return item.value;
        })) || 1;

        chart.innerHTML = items.map(function (item, index) {
            const height = Math.max(8, Math.round((item.value / maxValue) * 100));

            return `
                <div class="column-chart-item" style="--column-height:${height}%; --column-color:${chartColors[index % chartColors.length]}">
                    <div class="column-value">${formatNumber(item.value)} pcs</div>
                    <div class="column-track">
                        <div class="column-fill"></div>
                    </div>
                    <strong>${App.escapeHtml(shortPlanNo(item.label))}</strong>
                    <span>${App.escapeHtml(App.formatDate(item.date))}</span>
                </div>
            `;
        }).join("");
    }

    function renderTopProductChart() {
        const productTotals = {};

        plans.forEach(function (plan) {
            const products = Array.isArray(plan.products) && plan.products.length
                ? plan.products
                : [plan];

            products.forEach(function (product) {
                const name = product.productName || product.product || plan.productName || "Unassigned Product";
                productTotals[name] = (productTotals[name] || 0) + getPlanQuantity(product);
            });
        });

        const productEntries = toEntries(productTotals)
            .sort(function (a, b) {
                return b.value - a.value;
            })
            .slice(0, 6);

        renderHorizontalChart("topProductChart", productEntries, "pcs");
    }

    function renderHorizontalChart(id, entries, suffix) {
        const chart = document.getElementById(id);
        if (!chart) return;

        if (!entries.length) {
            chart.innerHTML = '<div class="empty-cell">No chart data available.</div>';
            return;
        }

        const maxValue = Math.max.apply(null, entries.map(function (item) {
            return item.value;
        })) || 1;

        chart.innerHTML = entries.map(function (item, index) {
            const width = Math.max(5, Math.round((item.value / maxValue) * 100));

            return `
                <div class="chart-bar-row">
                    <div class="chart-bar-head">
                        <strong>${App.escapeHtml(item.label)}</strong>
                        <span>${formatNumber(item.value)} ${suffix}</span>
                    </div>
                    <div class="chart-track" aria-hidden="true">
                        <div class="chart-fill" style="width:${width}%; background:${chartColors[index % chartColors.length]}"></div>
                    </div>
                </div>
            `;
        }).join("");
    }

    function countBy(items, getKey) {
        return items.reduce(function (result, item) {
            const key = getKey(item);
            result[key] = (result[key] || 0) + 1;
            return result;
        }, {});
    }

    function sumBy(items, getKey, getValue) {
        return items.reduce(function (result, item) {
            const key = getKey(item);
            result[key] = (result[key] || 0) + getValue(item);
            return result;
        }, {});
    }

    function toEntries(map) {
        return Object.entries(map).map(function ([label, value]) {
            return { label, value };
        });
    }

    function buildConicGradient(entries, total) {
        if (!entries.length || !total) {
            return "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)";
        }

        let current = 0;
        const segments = entries.map(function (item, index) {
            const start = current;
            const end = current + (item.value / total) * 360;
            current = end;
            return `${chartColors[index % chartColors.length]} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
        });

        return `conic-gradient(${segments.join(", ")})`;
    }

    function getPlanQuantity(plan) {
        return Number(plan.totalQuantity || plan.quantity || 0);
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString();
    }

    function shortPlanNo(value) {
        const planNo = String(value || "");
        const parts = planNo.split("-");
        return parts.length > 1 ? parts[parts.length - 1] : planNo;
    }
})();
