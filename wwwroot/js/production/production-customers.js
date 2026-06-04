document.addEventListener("DOMContentLoaded", function () {
    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=320&q=80";
    const rawOrders = window.customerOrderCatalogData || window.customerMasterData || [];
    const customers = buildCustomers(rawOrders.map(normalizeOrder));

    const grid = document.getElementById("productionCustomerGrid");
    const searchInput = document.getElementById("customerCatalogSearch");
    const typeFilter = document.getElementById("customerCatalogTypeFilter");
    const priorityFilter = document.getElementById("customerCatalogPriorityFilter");
    const sortSelect = document.getElementById("customerCatalogSort");

    initialize();

    function initialize() {
        renderStats(customers);
        renderCustomers();

        [searchInput, typeFilter, priorityFilter, sortSelect].forEach(function (element) {
            if (!element) return;

            element.addEventListener("input", renderCustomers);
            element.addEventListener("change", renderCustomers);
        });

        document.querySelectorAll("[data-close-modal]").forEach(function (button) {
            button.addEventListener("click", function () {
                closeModal(this.getAttribute("data-close-modal"));
            });
        });
    }

    function renderCustomers() {
        if (!grid) return;

        let filtered = customers.slice();
        const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const typeValue = typeFilter ? typeFilter.value : "";
        const priorityValue = priorityFilter ? priorityFilter.value : "";
        const sortValue = sortSelect ? sortSelect.value : "deliveryDate";

        if (searchText) {
            filtered = filtered.filter(function (customer) {
                return customer.name.toLowerCase().includes(searchText) ||
                    customer.code.toLowerCase().includes(searchText) ||
                    customer.phone.toLowerCase().includes(searchText) ||
                    customer.address.toLowerCase().includes(searchText) ||
                    customer.orders.some(function (order) {
                        return order.orderNo.toLowerCase().includes(searchText) ||
                            order.productName.toLowerCase().includes(searchText) ||
                            order.productCode.toLowerCase().includes(searchText);
                    });
            });
        }

        if (typeValue) {
            filtered = filtered.filter(function (customer) {
                return customer.type === typeValue;
            });
        }

        if (priorityValue) {
            filtered = filtered.filter(function (customer) {
                return customer.orders.some(function (order) {
                    return order.priority === priorityValue;
                });
            });
        }

        filtered.sort(function (a, b) {
            if (sortValue === "customerName") {
                return a.name.localeCompare(b.name);
            }

            if (sortValue === "quantityHigh") {
                return b.totalQty - a.totalQty;
            }

            if (sortValue === "orderCount") {
                return b.orderCount - a.orderCount;
            }

            return new Date(a.earliestDelivery) - new Date(b.earliestDelivery);
        });

        setText("customerCatalogResultText", `Showing ${filtered.length} customer${filtered.length === 1 ? "" : "s"} with production-ready orders.`);

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="empty-cell">
                    No customers found for the selected filters.
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(renderCustomerCard).join("");

        grid.querySelectorAll("[data-view-customer]").forEach(function (button) {
            button.addEventListener("click", function () {
                openCustomerDetail(Number(this.getAttribute("data-view-customer")));
            });
        });
    }

    function renderCustomerCard(customer) {
        const primaryOrder = customer.orders[0] || {};

        return `
            <article class="production-customer-card">
                <div class="production-customer-identity">
                    <div class="production-customer-avatar">
                        ${escapeHtml(getInitials(customer.name))}
                    </div>

                    <div>
                        <span class="customer-code">${escapeHtml(customer.code)}</span>
                        <h3>${escapeHtml(customer.name)}</h3>
                    </div>

                    <span class="${getPriorityClass(customer.highestPriority)}">${escapeHtml(customer.highestPriority)}</span>
                </div>

                <div class="production-customer-body">
                    <div class="production-customer-heading">
                        <span class="customer-type">${escapeHtml(customer.type)}</span>
                        <span class="customer-next-item">${escapeHtml(primaryOrder.productName || "No active item")}</span>
                    </div>

                    <p>${escapeHtml(customer.address)}</p>

                    <div class="production-customer-meta-grid">
                        <div>
                            <span>Open Orders</span>
                            <strong>${formatNumber(customer.orderCount)}</strong>
                        </div>
                        <div>
                            <span>Total Qty</span>
                            <strong>${formatNumber(customer.totalQty)} pcs</strong>
                        </div>
                        <div>
                            <span>Earliest Delivery</span>
                            <strong>${formatDate(customer.earliestDelivery)}</strong>
                        </div>
                        <div>
                            <span>Earliest Delivery Item</span>
                            <strong>${escapeHtml(primaryOrder.productName || "-")}</strong>
                        </div>
                    </div>

                    <div class="production-customer-contact">
                        <span class="material-symbols-outlined">call</span>
                        <strong>${escapeHtml(customer.phone || "-")}</strong>
                    </div>

                    <div class="production-customer-actions">
                        <button type="button" class="btn btn-light" data-view-customer="${customer.id}">
                            View More
                        </button>
                        <a class="btn btn-primary" href="/Production/Customer/CreateCustomer?customerId=${encodeURIComponent(customer.id)}">
                            Create Plan
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    function openCustomerDetail(customerId) {
        const customer = customers.find(function (row) {
            return Number(row.id) === Number(customerId);
        });

        if (!customer) return;

        setText("customerDetailName", customer.name);
        setText("customerDetailSubtitle", `${customer.orderCount} open order item${customer.orderCount === 1 ? "" : "s"} ready for planning.`);
        setText("customerDetailCode", customer.code);
        setText("customerDetailPhone", customer.phone || "-");
        setText("customerDetailAddress", customer.address || "-");
        setText("customerDetailQty", `${formatNumber(customer.totalQty)} pcs`);

        const createPlanLink = document.getElementById("customerDetailCreatePlanLink");
        if (createPlanLink) {
            createPlanLink.href = `/Production/Customer/CreateCustomer?customerId=${encodeURIComponent(customer.id)}`;
        }

        const productRefs = document.getElementById("customerDetailProductRefs");
        if (productRefs) {
            productRefs.innerHTML = customer.orders.map(function (order) {
                return `
                    <article class="customer-detail-product-ref">
                        <img src="${escapeHtml(order.productImage)}"
                             alt="${escapeHtml(order.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />
                        <div>
                            <strong>${escapeHtml(order.productName)}</strong>
                            <span>${escapeHtml(order.orderNo)} | ${formatNumber(order.quantity)} pcs | ${escapeHtml(getColorSummary(order))}</span>
                        </div>
                    </article>
                `;
            }).join("");
        }

        const body = document.getElementById("customerDetailOrdersBody");
        if (body) {
            body.innerHTML = customer.orders.map(function (order) {
                return `
                    <tr>
                        <td><strong>${escapeHtml(order.orderNo)}</strong></td>
                        <td>${escapeHtml(order.productName)}</td>
                        <td>${escapeHtml(getColorSummary(order))}</td>
                        <td>${formatNumber(order.quantity)}</td>
                        <td>${formatDate(order.deliveryDate)}</td>
                        <td><span class="${getPriorityClass(order.priority)}">${escapeHtml(order.priority)}</span></td>
                    </tr>
                `;
            }).join("");
        }

        const modal = document.getElementById("customerDetailModal");
        if (modal) {
            modal.classList.remove("hidden");
        }
    }

    function buildCustomers(orders) {
        const grouped = {};

        orders.forEach(function (order) {
            const key = String(order.customerId || order.customerCode || order.customerName);

            if (!grouped[key]) {
                grouped[key] = {
                    id: order.customerId,
                    code: order.customerCode,
                    name: order.customerName,
                    type: order.customerType,
                    phone: order.phone,
                    address: order.address,
                    paymentTerms: order.paymentTerms,
                    orders: [],
                    orderCount: 0,
                    totalQty: 0,
                    earliestDelivery: order.deliveryDate,
                    highestPriority: order.priority
                };
            }

            grouped[key].orders.push(order);
            grouped[key].orderCount += 1;
            grouped[key].totalQty += Number(order.quantity || 0);

            if (new Date(order.deliveryDate) < new Date(grouped[key].earliestDelivery)) {
                grouped[key].earliestDelivery = order.deliveryDate;
            }

            if (getPriorityWeight(order.priority) < getPriorityWeight(grouped[key].highestPriority)) {
                grouped[key].highestPriority = order.priority;
            }
        });

        return Object.values(grouped).map(function (customer) {
            customer.orders.sort(function (a, b) {
                return new Date(a.deliveryDate) - new Date(b.deliveryDate);
            });

            return customer;
        });
    }

    function renderStats(rows) {
        const totalOrders = rows.reduce(function (sum, customer) {
            return sum + customer.orderCount;
        }, 0);

        const totalQty = rows.reduce(function (sum, customer) {
            return sum + customer.totalQty;
        }, 0);

        const urgentCount = rows.reduce(function (sum, customer) {
            return sum + customer.orders.filter(function (order) {
                return order.priority === "Urgent";
            }).length;
        }, 0);

        setText("customerCatalogTotalCustomers", formatNumber(rows.length));
        setText("customerCatalogTotalOrders", formatNumber(totalOrders));
        setText("customerCatalogTotalQty", formatNumber(totalQty));
        setText("customerCatalogUrgentCount", formatNumber(urgentCount));
    }

    function normalizeOrder(order) {
        return {
            id: order.id || order.orderItemId || 0,
            orderNo: order.orderNo || "ORDER",
            customerId: order.customerId || 0,
            customerCode: order.customerCode || "",
            customerName: order.customerName || order.name || "",
            customerType: order.customerType || order.type || "",
            phone: order.phone || "",
            address: order.address || "",
            paymentTerms: order.paymentTerms || "",
            deliveryDate: order.deliveryDate || "",
            priority: order.priority || "Normal",
            productCode: order.productCode || order.productId || "",
            productName: order.productName || order.orderItem || order.itemName || "",
            variant: order.variant || "",
            quantity: Number(order.quantity || order.orderQty || order.qty || 0),
            productImage: order.productImage || fallbackProductImage,
            sizes: order.sizes || []
        };
    }

    function getSizeColorRows(order) {
        const rows = [];

        (order.sizes || []).forEach(function (sizeRow) {
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];

            if (colorRows.length) {
                colorRows.forEach(function (colorRow) {
                    rows.push({
                        color: colorRow.color || colorRow.variant || colorRow.name || "-"
                    });
                });
            } else if (sizeRow.color || order.variant) {
                rows.push({
                    color: sizeRow.color || order.variant
                });
            }
        });

        return rows;
    }

    function getColorSummary(order) {
        const colors = [];

        getSizeColorRows(order).forEach(function (row) {
            if (row.color && !colors.includes(row.color)) {
                colors.push(row.color);
            }
        });

        if (!colors.length) {
            return order.variant || "-";
        }

        if (colors.length <= 3) {
            return colors.join(" / ");
        }

        return `${colors.slice(0, 3).join(" / ")} +${colors.length - 3}`;
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
