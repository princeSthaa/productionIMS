export const warehouseData = {
    kpis: [
        { label: "Raw material SKUs", value: "128", helper: "24 shelf locations below reorder point", icon: "inventory_2", tone: "blue" },
        { label: "Finished goods", value: "8,420", helper: "Ready for dispatch", icon: "deployed_code", tone: "green" },
        { label: "Pending receipts", value: "6", helper: "Supplier and factory arrivals", icon: "move_to_inbox", tone: "amber" },
        { label: "Damaged / returned", value: "37", helper: "Held on QC / damage shelves", icon: "report", tone: "red" }
    ],
    modules: [
        { id: "stock", label: "Inventory Stock", icon: "inventory_2", kicker: "Stock view", title: "Inventory Stock" },
        { id: "receive-materials", label: "Receive Materials", icon: "move_to_inbox", kicker: "Supplier receipt", title: "Receive Materials" },
        { id: "issue-materials", label: "Issue to Factory", icon: "forklift", kicker: "Production supply", title: "Issue Materials to Factory" },
        { id: "receive-finished", label: "Receive Finished Goods", icon: "inventory", kicker: "Factory output", title: "Receive Finished Goods" },
        { id: "locations", label: "Storage Locations", icon: "shelves", kicker: "Floor to shelf", title: "Shelf Location Management" },
        { id: "transfer", label: "Stock Transfer", icon: "sync_alt", kicker: "Internal movement", title: "Stock Transfer" },
        { id: "damage", label: "Damage / Returns", icon: "assignment_return", kicker: "Damage control", title: "Damage / Return Management" },
        { id: "purchase-demand", label: "Purchase Demand", icon: "shopping_cart", kicker: "Low stock", title: "Low Stock / Purchase Demand" },
        { id: "dispatch", label: "Dispatch", icon: "local_shipping", kicker: "Outbound issue", title: "Dispatch to Outlets / Customers" },
        { id: "history", label: "Movement History", icon: "history", kicker: "Audit trail", title: "Stock Movement History" }
    ],
    stockItems: [
        { sku: "RM-WOOD-001", name: "Seasoned teak wood", type: "Raw Material", group: "Wood", available: 420, reserved: 80, uom: "cft", minStock: 250, location: "F1 / Zone A / Shelf W-03", status: "Available" },
        { sku: "RM-FAB-014", name: "Cotton fabric roll", type: "Raw Material", group: "Fabric", available: 95, reserved: 50, uom: "kg", minStock: 160, location: "F1 / Zone B / Shelf F-01", status: "Low Stock" },
        { sku: "RM-PACK-009", name: "Printed packaging box", type: "Raw Material", group: "Packaging", available: 1200, reserved: 250, uom: "pcs", minStock: 600, location: "F2 / Zone D / Shelf P-02", status: "Available" },
        { sku: "RM-SCREW-003", name: "M8 furniture screw", type: "Raw Material", group: "Hardware", available: 1800, reserved: 400, uom: "pcs", minStock: 1000, location: "F1 / Zone C / Shelf H-04", status: "Available" },
        { sku: "FG-CHAIR-022", name: "Finished dining chair", type: "Finished Goods", group: "Furniture", available: 320, reserved: 75, uom: "pcs", minStock: 150, location: "F2 / Zone F / Shelf FG-02", status: "Available" },
        { sku: "FG-FOOD-118", name: "Packed flour 5kg", type: "Finished Goods", group: "Food", available: 860, reserved: 300, uom: "packets", minStock: 500, location: "F2 / Zone G / Shelf FG-01", status: "Available" },
        { sku: "FG-BOTTLE-041", name: "Bottled product case", type: "Finished Goods", group: "Beverage", available: 130, reserved: 90, uom: "cases", minStock: 220, location: "F2 / Zone H / Shelf FG-02", status: "Low Stock" }
    ],
    materialReceipts: [
        { id: "GRN-1007", supplier: "Koshi Textile Supply", po: "PO-24091", item: "Cotton fabric roll", expected: 100, received: 100, accepted: 95, rejected: 5, location: "F1 / Zone B / Shelf F-01", status: "QC Hold" },
        { id: "GRN-1008", supplier: "Everest Hardware", po: "PO-24094", item: "M8 furniture screw", expected: 2000, received: 2000, accepted: 2000, rejected: 0, location: "F1 / Zone C / Shelf H-04", status: "Accepted" },
        { id: "GRN-1009", supplier: "Prime Packaging", po: "PO-24096", item: "Printed packaging box", expected: 1500, received: 1480, accepted: 1460, rejected: 20, location: "F2 / Zone D / Shelf P-02", status: "Partial" }
    ],
    issueRequests: [
        { request: "MR-501", plan: "PP-001", factory: "Factory Line A", item: "Cotton fabric roll", requested: 50, issued: 50, from: "F1 / Zone B / Shelf F-01", approvedBy: "Warehouse Manager", status: "Issued" },
        { request: "MR-502", plan: "PP-002", factory: "Furniture Cell 2", item: "Seasoned teak wood", requested: 75, issued: 60, from: "F1 / Zone A / Shelf W-03", approvedBy: "Pending", status: "Partially Issued" },
        { request: "MR-503", plan: "PP-003", factory: "Packing Line", item: "Printed packaging box", requested: 300, issued: 300, from: "F2 / Zone D / Shelf P-02", approvedBy: "Warehouse Manager", status: "Issued" }
    ],
    finishedReceipts: [
        { batch: "BATCH-FG-778", product: "Packed flour 5kg", produced: 500, accepted: 480, rejected: 20, damaged: 12, location: "F2 / Zone G / Shelf FG-01", status: "Stored" },
        { batch: "BATCH-FG-779", product: "Finished dining chair", produced: 180, accepted: 172, rejected: 8, damaged: 5, location: "F2 / Zone F / Shelf FG-02", status: "Stored" },
        { batch: "BATCH-FG-780", product: "Bottled product case", produced: 220, accepted: 210, rejected: 10, damaged: 10, location: "QC Area / Damage Shelf D-04", status: "QC Hold" }
    ],
    locations: [
        { floor: "Floor 1",  room: "Raw Wood Room", shelf: "Shelf W-03", shelfType: "Heavy wood shelf", item: "Seasoned teak wood", qty: "420 cft", utilization: 78 },
        { floor: "Floor 1",  room: "Fabric Room", shelf: "Shelf F-01", shelfType: "Roll storage shelf", item: "Cotton fabric roll", qty: "95 kg", utilization: 62 },
        { floor: "Floor 2",  room: "Packaging Room", shelf: "Shelf P-02", shelfType: "Packaging shelf", item: "Printed packaging box", qty: "1,200 pcs", utilization: 55 },
        { floor: "Floor 2",  room: "Finished Goods Room", shelf: "Shelf FG-02", shelfType: "Finished goods shelf", item: "Finished dining chair", qty: "320 pcs", utilization: 84 },
        { floor: "QC Area",  room: "Return Hold", shelf: "Shelf D-01", shelfType: "QC hold shelf", item: "Damaged bottled cases", qty: "10 cases", utilization: 31 }
    ],
    transfers: [
        { id: "TR-221", item: "Cotton fabric roll", qty: "40 kg", from: "Shelf F-01", to: "Factory staging / Shelf S-02", reason: "Production staging", status: "Ready" },
        { id: "TR-222", item: "Packed flour 5kg", qty: "200 packets", from: "QC Area", to: "F2 / Zone G / Shelf FG-01", reason: "QC accepted", status: "Completed" },
        { id: "TR-223", item: "Finished dining chair", qty: "60 pcs", from: "F2 / Zone F / Shelf FG-02", to: "Dispatch Bay 1", reason: "Outlet shipment", status: "In Transit" }
    ],
    damages: [
        { id: "DMG-331", source: "Supplier", item: "Cotton fabric roll", qty: "5 kg", reason: "Water damage", action: "Reject to supplier", status: "Open" },
        { id: "DMG-332", source: "Factory", item: "Packed flour 5kg", qty: "20 packets", reason: "Seal failure", action: "Rework", status: "QC Hold" },
        { id: "DMG-333", source: "Outlet A", item: "Finished dining chair", qty: "2 pcs", reason: "Transit scratch", action: "Repair", status: "Closed" }
    ],
    purchaseDemands: [
        { id: "PD-710", item: "Cotton fabric roll", available: "95 kg", minimum: "160 kg", shortage: "65 kg", priority: "High", status: "Draft" },
        { id: "PD-711", item: "Bottled product case", available: "130 cases", minimum: "220 cases", shortage: "90 cases", priority: "Medium", status: "Sent to Purchase" },
        { id: "PD-712", item: "Paint white gloss", available: "25 ltr", minimum: "75 ltr", shortage: "50 ltr", priority: "High", status: "Approved" }
    ],
    dispatches: [
        { id: "DSP-440", destination: "Outlet A", product: "Packed flour 5kg", qty: "100 packets", date: "2026-05-28", status: "Loaded" },
        { id: "DSP-441", destination: "Customer - Hotel Annapurna", product: "Finished dining chair", qty: "45 pcs", date: "2026-05-29", status: "Scheduled" },
        { id: "DSP-442", destination: "Outlet B", product: "Bottled product case", qty: "80 cases", date: "2026-05-28", status: "Dispatched" }
    ],
    history: [
        { time: "09:10", ref: "GRN-1008", movement: "Stock In", item: "M8 furniture screw", qty: "+2,000 pcs", location: "F1 / Zone C / Shelf H-04", user: "R. Shrestha" },
        { time: "10:25", ref: "MR-501", movement: "Stock Out", item: "Cotton fabric roll", qty: "-50 kg", location: "Factory Line A", user: "A. Gurung" },
        { time: "11:05", ref: "TR-222", movement: "Transfer", item: "Packed flour 5kg", qty: "200 packets", location: "QC Area to Shelf FG-01", user: "M. KC" },
        { time: "12:35", ref: "DSP-440", movement: "Dispatch", item: "Packed flour 5kg", qty: "-100 packets", location: "Outlet A", user: "S. Rai" }
    ]
};
