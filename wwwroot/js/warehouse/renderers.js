const statusClassMap = {
    Accepted: "success",
    Available: "success",
    Approved: "success",
    Closed: "success",
    Completed: "success",
    Dispatched: "success",
    Draft: "secondary",
    Issued: "success",
    Loaded: "primary",
    "Low Stock": "warning",
    Open: "danger",
    Partial: "warning",
    "Partially Issued": "warning",
    "QC Hold": "warning",
    Ready: "primary",
    Scheduled: "secondary",
    Stored: "success",
    "Sent to Purchase": "primary",
    "In Transit": "primary"
};

const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const badge = (status) => {
    const tone = statusClassMap[status] || "secondary";
    return `<span class="badge text-bg-${tone} warehouse-badge">${escapeHtml(status)}</span>`;
};

const icon = (name) => `<span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(name)}</span>`;

const table = (headers, rows, emptyMessage = "No mock records found.") => {
    const headerHtml = headers
        .map((header) => `<th scope="col">${escapeHtml(header)}</th>`)
        .join("");

    const rowHtml = rows.length
        ? rows.join("")
        : `<tr><td colspan="${headers.length}" class="text-center text-secondary py-4">${escapeHtml(emptyMessage)}</td></tr>`;

    return `
        <div class="table-responsive warehouse-table-wrap">
            <table class="table table-hover align-middle mb-0 warehouse-table">
                <thead><tr>${headerHtml}</tr></thead>
                <tbody>${rowHtml}</tbody>
            </table>
        </div>
    `;
};

const renderMockForm = (title, fields) => `
    <div class="warehouse-form-block">
        <div class="d-flex align-items-center gap-2 mb-3">
            ${icon("edit_note")}
            <h3>${escapeHtml(title)}</h3>
        </div>
        <div class="row g-3">
            ${fields.map((field) => `
                <div class="col-md-${field.size || 6}">
                    <label class="form-label">${escapeHtml(field.label)}</label>
                    ${field.type === "select"
                        ? `<select class="form-select form-select-sm">${field.options.map((option) => `<option>${escapeHtml(option)}</option>`).join("")}</select>`
                        : `<input class="form-control form-control-sm" type="${field.type || "text"}" value="${escapeHtml(field.value || "")}" placeholder="${escapeHtml(field.placeholder || "")}">`}
                </div>
            `).join("")}
        </div>
        <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary btn-sm fw-semibold" type="button" data-action="mock-save">${icon("save")} Save Draft</button>
        </div>
    </div>
`;

export function renderKpis(container, kpis) {
    container.innerHTML = kpis.map((kpi) => `
        <div class="col-12 col-md-6 col-xl-3">
            <div class="warehouse-kpi warehouse-kpi--${escapeHtml(kpi.tone)}">
                <div>
                    <span>${escapeHtml(kpi.label)}</span>
                    <strong>${escapeHtml(kpi.value)}</strong>
                    <small>${escapeHtml(kpi.helper)}</small>
                </div>
                <div class="warehouse-kpi-icon">${icon(kpi.icon)}</div>
            </div>
        </div>
    `).join("");
}

export function renderModuleNav(container, modules, activeModuleId) {
    container.innerHTML = modules.map((module) => `
        <button class="nav-link ${module.id === activeModuleId ? "active" : ""}" type="button" role="tab"
                data-action="open-module" data-module-id="${escapeHtml(module.id)}">
            ${icon(module.icon)}
            <span>${escapeHtml(module.label)}</span>
        </button>
    `).join("");
}

export function renderPanel(panelHost, template, module, data, state) {
    const fragment = template.content.cloneNode(true);
    const panel = fragment.querySelector(".warehouse-panel");
    const actionHost = fragment.querySelector("[data-module-actions]");
    const body = fragment.querySelector("[data-module-body]");

    fragment.querySelector("[data-module-kicker]").textContent = module.kicker;
    fragment.querySelector("[data-module-title]").textContent = module.title;
    actionHost.innerHTML = renderActions(module.id);
    body.innerHTML = renderModuleBody(module.id, data, state);

    panelHost.innerHTML = "";
    panelHost.appendChild(fragment);

    const savedAlert = panelHost.querySelector("[data-save-alert]");
    panelHost.querySelectorAll("[data-action='mock-save']").forEach((button) => {
        button.addEventListener("click", () => {
            if (!savedAlert) {
                return;
            }

            savedAlert.classList.remove("d-none");
        });
    });

    panel?.scrollIntoView({ block: "nearest" });
}

function renderActions(moduleId) {
    if (moduleId === "stock") {
        return `
            <button class="btn btn-outline-secondary btn-sm" type="button">${icon("download")} Export</button>
            <button class="btn btn-primary btn-sm" type="button">${icon("add")} Adjust</button>
        `;
    }

    if (moduleId === "history") {
        return `<button class="btn btn-outline-secondary btn-sm" type="button">${icon("filter_alt")} Filter</button>`;
    }

    return `<button class="btn btn-outline-primary btn-sm" type="button">${icon("add")} New</button>`;
}

function renderModuleBody(moduleId, data, state) {
    switch (moduleId) {
        case "stock":
            return renderStock(data.stockItems, state);
        case "receive-materials":
            return renderReceiveMaterials(data.materialReceipts);
        case "issue-materials":
            return renderIssueMaterials(data.issueRequests);
        case "receive-finished":
            return renderFinishedReceipts(data.finishedReceipts);
        case "locations":
            return renderLocations(data.locations);
        case "transfer":
            return renderTransfers(data.transfers);
        case "damage":
            return renderDamage(data.damages);
        case "purchase-demand":
            return renderPurchaseDemand(data.purchaseDemands);
        case "dispatch":
            return renderDispatch(data.dispatches);
        case "history":
            return renderHistory(data.history);
        default:
            return "";
    }
}

function renderStock(items, state) {
    const search = state.search.toLowerCase();
    const filtered = items.filter((item) => {
        const matchesSearch = [item.sku, item.name, item.group, item.location, item.status]
            .join(" ")
            .toLowerCase()
            .includes(search);
        const matchesType = state.stockType === "all" || item.type === state.stockType;
        return matchesSearch && matchesType;
    });

    const rows = filtered.map((item) => `
        <tr>
            <td><strong>${escapeHtml(item.sku)}</strong><span>${escapeHtml(item.name)}</span></td>
            <td>${escapeHtml(item.type)}</td>
            <td>${escapeHtml(item.group)}</td>
            <td><strong>${escapeHtml(item.available)}</strong> ${escapeHtml(item.uom)}<span>Reserved ${escapeHtml(item.reserved)} ${escapeHtml(item.uom)}</span></td>
            <td>${escapeHtml(item.location)}</td>
            <td>${badge(item.status)}</td>
        </tr>
    `);

    return table(["SKU / Item", "Store", "Group", "Stock", "Location", "Status"], rows);
}

function renderReceiveMaterials(receipts) {
    const rows = receipts.map((receipt) => `
        <tr>
            <td><strong>${escapeHtml(receipt.id)}</strong><span>${escapeHtml(receipt.po)}</span></td>
            <td>${escapeHtml(receipt.supplier)}</td>
            <td>${escapeHtml(receipt.item)}</td>
            <td>${escapeHtml(receipt.expected)}</td>
            <td>${escapeHtml(receipt.accepted)} accepted / ${escapeHtml(receipt.rejected)} rejected</td>
            <td>${escapeHtml(receipt.location)}</td>
            <td>${badge(receipt.status)}</td>
        </tr>
    `);

    return `
        ${renderMockForm("Material receiving entry", [
            { label: "Purchase order", type: "select", options: ["PO-24091 - Cotton fabric", "PO-24094 - Screws", "PO-24096 - Packaging"], size: 4 },
            { label: "Received quantity", type: "number", value: "100", size: 2 },
            { label: "Accepted quantity", type: "number", value: "95", size: 2 },
            { label: "Rejected quantity", type: "number", value: "5", size: 2 },
            { label: "Storage shelf", type: "select", options: ["F1 / Zone B / Shelf F-01", "F1 / Zone C / Shelf H-04", "F2 / Zone D / Shelf P-02"], size: 2 }
        ])}
        <div class="alert alert-success d-none mt-3" data-save-alert>Mock receiving draft saved on this screen.</div>
        ${table(["GRN", "Supplier", "Item", "Expected", "Accepted / Rejected", "Location", "Status"], rows)}
    `;
}

function renderIssueMaterials(requests) {
    const rows = requests.map((request) => `
        <tr>
            <td><strong>${escapeHtml(request.request)}</strong><span>${escapeHtml(request.plan)}</span></td>
            <td>${escapeHtml(request.factory)}</td>
            <td>${escapeHtml(request.item)}</td>
            <td>${escapeHtml(request.requested)}</td>
            <td>${escapeHtml(request.issued)}</td>
            <td>${escapeHtml(request.from)}</td>
            <td>${escapeHtml(request.approvedBy)}</td>
            <td>${badge(request.status)}</td>
        </tr>
    `);

    return `
        ${renderMockForm("Raw material issue", [
            { label: "Production plan", type: "select", options: ["PP-001", "PP-002", "PP-003"], size: 3 },
            { label: "Material", type: "select", options: ["Cotton fabric roll", "Seasoned teak wood", "Printed packaging box"], size: 3 },
            { label: "Issue quantity", type: "number", value: "50", size: 2 },
            { label: "From shelf", type: "select", options: ["F1 / Zone B / Shelf F-01", "F1 / Zone A / Shelf W-03", "F2 / Zone D / Shelf P-02"], size: 4 }
        ])}
        <div class="alert alert-success d-none mt-3" data-save-alert>Mock factory issue draft saved on this screen.</div>
        ${table(["Request", "Factory", "Item", "Requested", "Issued", "From", "Approved By", "Status"], rows)}
    `;
}

function renderFinishedReceipts(receipts) {
    const rows = receipts.map((receipt) => `
        <tr>
            <td><strong>${escapeHtml(receipt.batch)}</strong></td>
            <td>${escapeHtml(receipt.product)}</td>
            <td>${escapeHtml(receipt.produced)}</td>
            <td>${escapeHtml(receipt.accepted)}</td>
            <td>${escapeHtml(receipt.rejected)}</td>
            <td>${escapeHtml(receipt.damaged)}</td>
            <td>${escapeHtml(receipt.location)}</td>
            <td>${badge(receipt.status)}</td>
        </tr>
    `);

    return table(["Batch", "Product", "Produced", "Accepted", "Rejected", "Damaged", "Location", "Status"], rows);
}

function renderLocations(locations) {
    const rows = locations.map((location) => `
        <tr>
            <td><strong>${escapeHtml(location.floor)}</strong><span>${escapeHtml(location.room)}</span></td>
            
            <td><strong>${escapeHtml(location.shelf)}</strong></td>
            <td>${escapeHtml(location.shelfType || "General shelf")}</td>
            
            <td>${escapeHtml(location.item)}</td>
            <td>${escapeHtml(location.qty)}</td>
            <td>
                <div class="progress warehouse-progress" role="progressbar" aria-valuenow="${escapeHtml(location.utilization)}" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar" style="width: ${escapeHtml(location.utilization)}%"></div>
                </div>
                <span>${escapeHtml(location.utilization)}%</span>
            </td>
        </tr>
    `);

    return table(["Floor / Room", "Shelf", "Shelf Type", "Item", "Quantity", "Utilization"], rows);
}

function renderTransfers(transfers) {
    const rows = transfers.map((transfer) => `
        <tr>
            <td><strong>${escapeHtml(transfer.id)}</strong></td>
            <td>${escapeHtml(transfer.item)}</td>
            <td>${escapeHtml(transfer.qty)}</td>
            <td>${escapeHtml(transfer.from)}</td>
            <td>${escapeHtml(transfer.to)}</td>
            <td>${escapeHtml(transfer.reason)}</td>
            <td>${badge(transfer.status)}</td>
        </tr>
    `);

    return `
        ${renderMockForm("Stock transfer draft", [
            { label: "Item", type: "select", options: ["Cotton fabric roll", "Packed flour 5kg", "Finished dining chair"], size: 3 },
            { label: "Quantity", type: "text", value: "40 kg", size: 2 },
            { label: "From", type: "select", options: ["Shelf F-01", "QC Area", "F2 / Zone F / Shelf FG-02"], size: 3 },
            { label: "To", type: "select", options: ["Factory staging / Shelf S-02", "F2 / Zone G / Shelf FG-01", "Dispatch Bay 1"], size: 4 }
        ])}
        <div class="alert alert-success d-none mt-3" data-save-alert>Mock transfer draft saved on this screen.</div>
        ${table(["Transfer", "Item", "Qty", "From", "To", "Reason", "Status"], rows)}
    `;
}

function renderDamage(damages) {
    const rows = damages.map((damage) => `
        <tr>
            <td><strong>${escapeHtml(damage.id)}</strong><span>${escapeHtml(damage.source)}</span></td>
            <td>${escapeHtml(damage.item)}</td>
            <td>${escapeHtml(damage.qty)}</td>
            <td>${escapeHtml(damage.reason)}</td>
            <td>${escapeHtml(damage.action)}</td>
            <td>${badge(damage.status)}</td>
        </tr>
    `);

    return table(["Case", "Item", "Qty", "Reason", "Action", "Status"], rows);
}

function renderPurchaseDemand(demands) {
    const rows = demands.map((demand) => `
        <tr>
            <td><strong>${escapeHtml(demand.id)}</strong></td>
            <td>${escapeHtml(demand.item)}</td>
            <td>${escapeHtml(demand.available)}</td>
            <td>${escapeHtml(demand.minimum)}</td>
            <td>${escapeHtml(demand.shortage)}</td>
            <td><span class="badge ${demand.priority === "High" ? "text-bg-danger" : "text-bg-warning"} warehouse-badge">${escapeHtml(demand.priority)}</span></td>
            <td>${badge(demand.status)}</td>
        </tr>
    `);

    return table(["Demand", "Item", "Available", "Minimum", "Shortage", "Priority", "Status"], rows);
}

function renderDispatch(dispatches) {
    const rows = dispatches.map((dispatch) => `
        <tr>
            <td><strong>${escapeHtml(dispatch.id)}</strong></td>
            <td>${escapeHtml(dispatch.destination)}</td>
            <td>${escapeHtml(dispatch.product)}</td>
            <td>${escapeHtml(dispatch.qty)}</td>
            <td>${escapeHtml(dispatch.date)}</td>
            <td>${badge(dispatch.status)}</td>
        </tr>
    `);

    return `
        ${renderMockForm("Dispatch note", [
            { label: "Destination", type: "select", options: ["Outlet A", "Outlet B", "Customer - Hotel Annapurna"], size: 4 },
            { label: "Product", type: "select", options: ["Packed flour 5kg", "Finished dining chair", "Bottled product case"], size: 4 },
            { label: "Quantity", type: "text", value: "100 packets", size: 2 },
            { label: "Dispatch date", type: "date", value: "2026-05-28", size: 2 }
        ])}
        <div class="alert alert-success d-none mt-3" data-save-alert>Mock dispatch draft saved on this screen.</div>
        ${table(["Dispatch", "Destination", "Product", "Qty", "Date", "Status"], rows)}
    `;
}

function renderHistory(history) {
    const rows = history.map((entry) => `
        <tr>
            <td>${escapeHtml(entry.time)}</td>
            <td><strong>${escapeHtml(entry.ref)}</strong><span>${escapeHtml(entry.movement)}</span></td>
            <td>${escapeHtml(entry.item)}</td>
            <td>${escapeHtml(entry.qty)}</td>
            <td>${escapeHtml(entry.location)}</td>
            <td>${escapeHtml(entry.user)}</td>
        </tr>
    `);

    return table(["Time", "Reference", "Item", "Qty", "Location", "User"], rows);
}
