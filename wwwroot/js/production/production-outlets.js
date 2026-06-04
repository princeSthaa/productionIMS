document.addEventListener("DOMContentLoaded", function () {
    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=320&q=80";
    const rawDemand = window.outletDemandCatalogData || window.outletDemands || [];
    const outlets = buildOutlets(rawDemand.map(normalizeDemand));

    const grid = document.getElementById("productionOutletGrid");
    const searchInput = document.getElementById("outletCatalogSearch");
    const statusFilter = document.getElementById("outletCatalogStatusFilter");
    const velocityFilter = document.getElementById("outletCatalogVelocityFilter");
    const sortSelect = document.getElementById("outletCatalogSort");

    initialize();

    function initialize() {
        renderStats(outlets);
        renderOutlets();

        [searchInput, statusFilter, velocityFilter, sortSelect].forEach(function (element) {
            if (!element) return;

            element.addEventListener("input", renderOutlets);
            element.addEventListener("change", renderOutlets);
        });

        document.querySelectorAll("[data-close-modal]").forEach(function (button) {
            button.addEventListener("click", function () {
                closeModal(this.getAttribute("data-close-modal"));
            });
        });
    }

    function renderOutlets() {
        if (!grid) return;

        let filtered = outlets.slice();
        const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const statusValue = statusFilter ? statusFilter.value : "";
        const velocityValue = velocityFilter ? velocityFilter.value : "";
        const sortValue = sortSelect ? sortSelect.value : "requiredDate";

        if (searchText) {
            filtered = filtered.filter(function (outlet) {
                return outlet.name.toLowerCase().includes(searchText) ||
                    outlet.code.toLowerCase().includes(searchText) ||
                    outlet.location.toLowerCase().includes(searchText) ||
                    outlet.manager.toLowerCase().includes(searchText) ||
                    outlet.demands.some(function (demand) {
                        return demand.demandNo.toLowerCase().includes(searchText) ||
                            demand.productName.toLowerCase().includes(searchText) ||
                            demand.productCode.toLowerCase().includes(searchText);
                    });
            });
        }

        if (statusValue) {
            filtered = filtered.filter(function (outlet) {
                return outlet.demands.some(function (demand) {
                    return demand.stockStatus === statusValue;
                });
            });
        }

        if (velocityValue) {
            filtered = filtered.filter(function (outlet) {
                return outlet.demands.some(function (demand) {
                    return demand.salesVelocity === velocityValue;
                });
            });
        }

        filtered.sort(function (a, b) {
            if (sortValue === "outletName") {
                return a.name.localeCompare(b.name);
            }

            if (sortValue === "quantityHigh") {
                return b.totalQty - a.totalQty;
            }

            if (sortValue === "demandCount") {
                return b.demandCount - a.demandCount;
            }

            return new Date(a.earliestRequired) - new Date(b.earliestRequired);
        });

        setText("outletCatalogResultText", `Showing ${filtered.length} outlet${filtered.length === 1 ? "" : "s"} with replenishment demand.`);

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="empty-cell">
                    No outlets found for the selected filters.
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(renderOutletCard).join("");

        grid.querySelectorAll("[data-view-outlet]").forEach(function (button) {
            button.addEventListener("click", function () {
                openOutletDetail(Number(this.getAttribute("data-view-outlet")));
            });
        });
    }

    function renderOutletCard(outlet) {
        const primaryDemand = outlet.demands[0] || {};

        return `
            <article class="production-customer-card production-outlet-card">
                <div class="production-customer-identity">
                    <div class="production-customer-avatar">
                        ${escapeHtml(getInitials(outlet.name))}
                    </div>

                    <div>
                        <span class="customer-code">${escapeHtml(outlet.code)}</span>
                        <h3>${escapeHtml(outlet.name)}</h3>
                    </div>

                    <span class="${getStockStatusClass(outlet.highestStockStatus)}">${escapeHtml(outlet.highestStockStatus)}</span>
                </div>

                <div class="production-customer-body">
                    <div class="production-customer-heading">
                        <span class="customer-type">${escapeHtml(outlet.manager || "Manager not set")}</span>
                        <span class="customer-next-item">${escapeHtml(primaryDemand.productName || "No active demand")}</span>
                    </div>

                    <p>${escapeHtml(outlet.location)}</p>

                    <div class="production-customer-meta-grid">
                        <div>
                            <span>Demand Items</span>
                            <strong>${formatNumber(outlet.demandCount)}</strong>
                        </div>
                        <div>
                            <span>Total Suggested</span>
                            <strong>${formatNumber(outlet.totalQty)} pcs</strong>
                        </div>
                        <div>
                            <span>Earliest Required</span>
                            <strong>${formatDate(outlet.earliestRequired)}</strong>
                        </div>
                        <div>
                            <span>Fast Moving</span>
                            <strong>${formatNumber(outlet.fastCount)}</strong>
                        </div>
                    </div>

                    <div class="production-customer-contact">
                        <span class="material-symbols-outlined">call</span>
                        <strong>${escapeHtml(outlet.phone || "-")}</strong>
                    </div>

                    <div class="production-customer-actions">
                        <button type="button" class="btn btn-light" data-view-outlet="${outlet.id}">
                            View More
                        </button>
                        <a class="btn btn-primary" href="/Production/Outlet/CreateOutlet?outletId=${encodeURIComponent(outlet.id)}">
                            Create Plan
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function openOutletDetail(outletId) {
        const outlet = outlets.find(function (row) {
            return Number(row.id) === Number(outletId);
        });

        if (!outlet) return;

        setText("outletCatalogDetailName", outlet.name);
        setText("outletCatalogDetailSubtitle", `${outlet.demandCount} open demand item${outlet.demandCount === 1 ? "" : "s"} ready for planning.`);
        setText("outletCatalogDetailCode", outlet.code);
        setText("outletCatalogDetailManager", outlet.manager || "-");
        setText("outletCatalogDetailLocation", outlet.location || "-");
        setText("outletCatalogDetailQty", `${formatNumber(outlet.totalQty)} pcs`);

        const createPlanLink = document.getElementById("outletCatalogCreatePlanLink");
        if (createPlanLink) {
            createPlanLink.href = `/Production/Outlet/CreateOutlet?outletId=${encodeURIComponent(outlet.id)}`;
        }

        const productRefs = document.getElementById("outletCatalogProductRefs");
        if (productRefs) {
            productRefs.innerHTML = outlet.demands.map(function (demand) {
                return `
                    <article class="customer-detail-product-ref">
                        <img src="${escapeHtml(demand.productImage)}"
                             alt="${escapeHtml(demand.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />
                        <div>
                            <strong>${escapeHtml(demand.productName)}</strong>
                            <span>${escapeHtml(demand.demandNo)} | ${formatNumber(demand.suggestedQty)} pcs | ${escapeHtml(getColorSummary(demand))}</span>
                        </div>
                    </article>
                `;
            }).join("");
        }

        const body = document.getElementById("outletCatalogDetailDemandBody");
        if (body) {
            body.innerHTML = outlet.demands.map(function (demand) {
                return `
                    <tr>
                        <td><strong>${escapeHtml(demand.demandNo)}</strong></td>
                        <td>${escapeHtml(demand.productName)}</td>
                        <td>${escapeHtml(getColorSummary(demand))}</td>
                        <td>${formatNumber(demand.suggestedQty)}</td>
                        <td>${formatDate(demand.requiredDate)}</td>
                        <td><span class="${getStockStatusClass(demand.stockStatus)}">${escapeHtml(demand.stockStatus)}</span></td>
                    </tr>
                `;
            }).join("");
        }

        const modal = document.getElementById("outletCatalogDetailModal");
        if (modal) {
            modal.classList.remove("hidden");
        }
    }

    function buildOutlets(demands) {
        const grouped = {};

        demands.forEach(function (demand) {
            const key = String(demand.outletId || demand.outletCode || demand.outletName);

            if (!grouped[key]) {
                grouped[key] = {
                    id: demand.outletId,
                    code: demand.outletCode,
                    name: demand.outletName,
                    location: demand.outletLocation,
                    manager: demand.outletManager,
                    phone: demand.phone,
                    demands: [],
                    demandCount: 0,
                    totalQty: 0,
                    fastCount: 0,
                    earliestRequired: demand.requiredDate,
                    highestStockStatus: demand.stockStatus
                };
            }

            grouped[key].demands.push(demand);
            grouped[key].demandCount += 1;
            grouped[key].totalQty += Number(demand.suggestedQty || 0);

            if (demand.salesVelocity === "Fast") {
                grouped[key].fastCount += 1;
            }

            if (new Date(demand.requiredDate) < new Date(grouped[key].earliestRequired)) {
                grouped[key].earliestRequired = demand.requiredDate;
            }

            if (getStockStatusWeight(demand.stockStatus) < getStockStatusWeight(grouped[key].highestStockStatus)) {
                grouped[key].highestStockStatus = demand.stockStatus;
            }
        });

        return Object.values(grouped).map(function (outlet) {
            outlet.demands.sort(function (a, b) {
                return new Date(a.requiredDate) - new Date(b.requiredDate);
            });

            return outlet;
        });
    }

    function renderStats(rows) {
        const totalDemand = rows.reduce(function (sum, outlet) {
            return sum + outlet.demandCount;
        }, 0);

        const totalQty = rows.reduce(function (sum, outlet) {
            return sum + outlet.totalQty;
        }, 0);

        const criticalCount = rows.reduce(function (sum, outlet) {
            return sum + outlet.demands.filter(function (demand) {
                return demand.stockStatus === "Critical";
            }).length;
        }, 0);

        setText("outletCatalogTotalOutlets", formatNumber(rows.length));
        setText("outletCatalogTotalDemand", formatNumber(totalDemand));
        setText("outletCatalogTotalQty", formatNumber(totalQty));
        setText("outletCatalogCriticalCount", formatNumber(criticalCount));
    }

    function normalizeDemand(demand) {
        return {
            id: demand.id || demand.demandItemId || 0,
            demandNo: demand.demandNo || "DEMAND",
            outletId: demand.outletId || 0,
            outletCode: demand.outletCode || "",
            outletName: demand.outletName || "",
            outletLocation: demand.outletLocation || "",
            outletManager: demand.outletManager || "",
            phone: demand.phone || "",
            productId: demand.productId || demand.productCode || "",
            productCode: demand.productCode || demand.productId || "",
            productName: demand.productName || "",
            stockStatus: demand.stockStatus || "Low Stock",
            salesVelocity: demand.salesVelocity || "Normal",
            requiredDate: demand.requiredDate || "",
            suggestedQty: Number(demand.suggestedQty || 0),
            productImage: demand.productImage || fallbackProductImage,
            variant: demand.variant || "",
            sizeGaps: demand.sizeGaps || []
        };
    }

    function getColorSummary(demand) {
        const colors = [];

        (demand.sizeGaps || []).forEach(function (sizeRow) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            colorRows.forEach(function (colorRow) {
                const color = colorRow.color || colorRow.variant || colorRow.name || "";
                if (color && !colors.includes(color)) {
                    colors.push(color);
                }
            });
        });

        if (!colors.length) {
            return demand.variant || "-";
        }

        if (colors.length <= 3) {
            return colors.join(" / ");
        }

        return `${colors.slice(0, 3).join(" / ")} +${colors.length - 3}`;
    }

    function getStockStatusWeight(status) {
        if (status === "Critical") return 1;
        if (status === "Low Stock") return 2;
        return 3;
    }

    function getStockStatusClass(status) {
        if (status === "Critical") return "priority-badge priority-urgent";
        if (status === "Reorder Soon") return "priority-badge priority-seasonal";
        return "priority-badge priority-normal";
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
