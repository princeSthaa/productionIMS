window.mockProductionPlans = [
    {
        id: "PP-20260529-001",
        planId: "PP-20260529-001",
        planNo: "PP-20260529-001",
        planDate: "2026-05-29",
        demandType: "Customer Order",
        customerId: 1,
        sourceId: 1,
        sourceName: "Himalayan Public School",
        productId: "PRD-001",
        productName: "School Uniform Set",
        variant: "Elegant and Versatile Fabric Brand Palette",
        color: "Elegant and Versatile Fabric Brand Palette",
        quantity: 920,
        totalQuantity: 920,
        priority: "Urgent",
        outputDestination: "Customer Dispatch",
        plannedStartDate: "2026-06-01",
        plannedCompletionDate: "2026-06-18",
        requiredDate: "2026-07-03",
        status: "Draft",
        sizes: [
            { size: "XS", quantity: 40 },
            { size: "S", quantity: 180 },
            { size: "M", quantity: 310 },
            { size: "L", quantity: 260 },
            { size: "XL", quantity: 130 }
        ],
        products: [
            {
                lineId: "PP-20260529-001-L1",
                orderNo: "ORD-2026-001",
                productId: "PRD-001",
                productCode: "PRD-001",
                productName: "School Uniform Set",
                category: "Uniform",
                variant: "Elegant and Versatile Fabric Brand Palette",
                quantity: 500,
                sourceName: "Himalayan Public School",
                requiredDate: "2026-06-20",
                plannedStartDate: "2026-06-01",
                plannedCompletionDate: "2026-06-08",
                status: "Draft",
                priority: "Urgent",
                risk: true,
                productImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=640&q=80",
                productionNotes: "School logo embroidery on chest. Pack size-wise in separate bundles.",
                sizes: [
                    { size: "XS", quantity: 40 },
                    { size: "S", quantity: 90 },
                    { size: "M", quantity: 160 },
                    { size: "L", quantity: 140 },
                    { size: "XL", quantity: 70 }
                ]
            },
            {
                lineId: "PP-20260529-001-L2",
                orderNo: "ORD-2026-006",
                productId: "PRD-002",
                productCode: "PRD-002",
                productName: "School Tracksuit Set",
                category: "Sports Uniform",
                variant: "Vibrant Summer Collection",
                quantity: 240,
                sourceName: "Himalayan Public School",
                requiredDate: "2026-06-28",
                plannedStartDate: "2026-06-07",
                plannedCompletionDate: "2026-06-14",
                status: "Draft",
                priority: "Normal",
                risk: false,
                productImage: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Keep house labels separate from regular uniform order.",
                sizes: [
                    { size: "S", quantity: 50 },
                    { size: "M", quantity: 80 },
                    { size: "L", quantity: 70 },
                    { size: "XL", quantity: 40 }
                ]
            },
            {
                lineId: "PP-20260529-001-L3",
                orderNo: "ORD-2026-007",
                productId: "PRD-004",
                productCode: "PRD-004",
                productName: "House Polo T-Shirt",
                category: "School House Wear",
                variant: "Monochrome Essentials",
                quantity: 180,
                sourceName: "Himalayan Public School",
                requiredDate: "2026-07-03",
                plannedStartDate: "2026-06-12",
                plannedCompletionDate: "2026-06-18",
                status: "Draft",
                priority: "Normal",
                risk: false,
                productImage: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Pack by house color first, then by size.",
                sizes: [
                    { size: "S", quantity: 40 },
                    { size: "M", quantity: 70 },
                    { size: "L", quantity: 50 },
                    { size: "XL", quantity: 20 }
                ]
            }
        ],
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-06-01",
                plannedEndDate: "2026-06-02",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-06-03",
                plannedEndDate: "2026-06-08",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-003",
                stageName: "Stitching / Sewing",
                workCenter: "Sewing Line 1",
                plannedStartDate: "2026-06-09",
                plannedEndDate: "2026-06-15",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-004",
                stageName: "Finishing",
                workCenter: "Finishing Section",
                plannedStartDate: "2026-06-16",
                plannedEndDate: "2026-06-17",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-005",
                stageName: "Quality Check",
                workCenter: "QC Table",
                plannedStartDate: "2026-06-18",
                plannedEndDate: "2026-06-18",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Draft created",
                text: "Production plan created with three Himalayan Public School order lines."
            }
        ]
    },
    {
        id: "PP-20260529-002",
        planId: "PP-20260529-002",
        planNo: "PP-20260529-002",
        planDate: "2026-05-29",
        demandType: "Outlet Replenishment",
        outletId: "OUT-001",
        sourceId: "OUT-001",
        sourceName: "Multiple Outlets",
        productId: "PRD-003",
        productName: "Men Casual Shirt",
        variant: "White / Sky Blue / Black",
        color: "White / Sky Blue / Black",
        quantity: 330,
        totalQuantity: 330,
        priority: "Urgent",
        outputDestination: "Outlet Transfer",
        plannedStartDate: "2026-06-03",
        plannedCompletionDate: "2026-06-12",
        requiredDate: "2026-06-25",
        status: "Cutting",
        sizes: [
            { size: "S", quantity: 25 },
            { size: "M", quantity: 85 },
            { size: "L", quantity: 90 },
            { size: "XL", quantity: 50 },
            { size: "XXL", quantity: 80 }
        ],
        products: [
            {
                lineId: "PP-20260529-002-L1",
                demandNo: "OUT-DEM-001",
                productId: "PRD-003",
                productCode: "PRD-003",
                productName: "Men Casual Shirt",
                category: "Retail Garment",
                variant: "White / Sky Blue / Black",
                quantity: 120,
                sourceName: "New Road Outlet",
                requiredDate: "2026-06-22",
                plannedStartDate: "2026-06-03",
                plannedCompletionDate: "2026-06-07",
                status: "Cutting",
                priority: "Urgent",
                risk: true,
                productImage: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Fast moving item. Replenish before weekend demand.",
                sizes: [
                    { size: "M", quantity: 40 },
                    { size: "L", quantity: 50 },
                    { size: "XL", quantity: 30 }
                ]
            },
            {
                lineId: "PP-20260529-002-L2",
                demandNo: "OUT-DEM-002",
                productId: "PRD-004",
                productCode: "PRD-004",
                productName: "Corporate Polo T-Shirt",
                category: "Corporate Wear",
                variant: "Black / Charcoal",
                quantity: 130,
                sourceName: "New Road Outlet",
                requiredDate: "2026-06-25",
                plannedStartDate: "2026-06-06",
                plannedCompletionDate: "2026-06-10",
                status: "Draft",
                priority: "Normal",
                risk: false,
                productImage: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Common corporate stock item. Keep enough sizes M and L.",
                sizes: [
                    { size: "S", quantity: 25 },
                    { size: "M", quantity: 45 },
                    { size: "L", quantity: 40 },
                    { size: "XL", quantity: 20 }
                ]
            },
            {
                lineId: "PP-20260529-002-L3",
                demandNo: "OUT-DEM-004",
                productId: "PRD-005",
                productCode: "PRD-005",
                productName: "Hotel Staff Uniform",
                category: "Hospitality Uniform",
                variant: "Cream / Brown",
                quantity: 80,
                sourceName: "Pokhara Lakeside Outlet",
                requiredDate: "2026-06-24",
                plannedStartDate: "2026-06-08",
                plannedCompletionDate: "2026-06-12",
                status: "Draft",
                priority: "Urgent",
                risk: true,
                productImage: "https://images.unsplash.com/photo-1585846416120-3a7354ed7d39?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Tourism season demand. Prioritize hospitality uniform stock.",
                sizes: [
                    { size: "S", quantity: 20 },
                    { size: "M", quantity: 25 },
                    { size: "L", quantity: 25 },
                    { size: "XL", quantity: 10 }
                ]
            }
        ],
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-06-03",
                plannedEndDate: "2026-06-03",
                actualStartDate: "2026-06-03",
                actualEndDate: "2026-06-03",
                status: "Completed",
                completedQty: 330,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-06-04",
                plannedEndDate: "2026-06-06",
                actualStartDate: "2026-06-04",
                status: "In Progress",
                completedQty: 180,
                rejectedQty: 4
            },
            {
                stageId: "STG-003",
                stageName: "Stitching / Sewing",
                workCenter: "Sewing Line 1",
                plannedStartDate: "2026-06-07",
                plannedEndDate: "2026-06-10",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Material check completed",
                text: "Raw materials were verified and issued to cutting section."
            },
            {
                title: "Cutting started",
                text: "Cutting work is currently in progress."
            }
        ]
    },
    {
        id: "PP-20260529-003",
        planId: "PP-20260529-003",
        planNo: "PP-20260529-003",
        planDate: "2026-05-29",
        demandType: "In-house Stock",
        warehouseId: "WH-002",
        sourceId: "WH-002",
        sourceName: "Finished Goods Warehouse",
        inHouseReason: "Seasonal Production",
        reason: "Seasonal Production",
        productId: "PRD-005",
        productName: "Hotel Staff Uniform",
        variant: "Cream / Brown",
        color: "Cream / Brown",
        quantity: 220,
        totalQuantity: 220,
        priority: "Seasonal",
        outputDestination: "Finished Goods Warehouse",
        plannedStartDate: "2026-06-05",
        plannedCompletionDate: "2026-06-15",
        requiredDate: "2026-06-20",
        status: "Material Check",
        sizes: [
            { size: "S", quantity: 45, colors: [{ color: "Cream", quantity: 27 }, { color: "Brown", quantity: 18 }] },
            { size: "M", quantity: 80, colors: [{ color: "Cream", quantity: 48 }, { color: "Brown", quantity: 32 }] },
            { size: "L", quantity: 65, colors: [{ color: "Cream", quantity: 40 }, { color: "Brown", quantity: 25 }] },
            { size: "XL", quantity: 30, colors: [{ color: "Cream", quantity: 18 }, { color: "Brown", quantity: 12 }] }
        ],
        products: [
            {
                lineId: "PP-20260529-003-L1",
                productId: "PRD-005",
                productCode: "PRD-005",
                productName: "Hotel Staff Uniform",
                category: "Hospitality Uniform",
                variant: "Cream / Brown",
                quantity: 220,
                sourceName: "Finished Goods Warehouse",
                requiredDate: "2026-06-20",
                plannedStartDate: "2026-06-05",
                plannedCompletionDate: "2026-06-15",
                status: "Material Check",
                priority: "Seasonal",
                risk: false,
                productImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Seasonal in-house stock for hospitality clients.",
                sizes: [
                    { size: "S", quantity: 45, colors: [{ color: "Cream", quantity: 27 }, { color: "Brown", quantity: 18 }] },
                    { size: "M", quantity: 80, colors: [{ color: "Cream", quantity: 48 }, { color: "Brown", quantity: 32 }] },
                    { size: "L", quantity: 65, colors: [{ color: "Cream", quantity: 40 }, { color: "Brown", quantity: 25 }] },
                    { size: "XL", quantity: 30, colors: [{ color: "Cream", quantity: 18 }, { color: "Brown", quantity: 12 }] }
                ]
            }
        ],
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-06-05",
                plannedEndDate: "2026-06-05",
                actualStartDate: "2026-06-05",
                status: "In Progress",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-06-06",
                plannedEndDate: "2026-06-08",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Seasonal plan created",
                text: "Hotel Staff Uniform production planned for finished goods stock."
            }
        ]
    },
    {
        id: "PP-20260529-004",
        planId: "PP-20260529-004",
        planNo: "PP-20260529-004",
        planDate: "2026-05-29",
        demandType: "Customer Order",
        customerId: 4,
        sourceId: 4,
        sourceName: "Namaste Corporate Supplies",
        productId: "PRD-004",
        productName: "Corporate Polo T-Shirt",
        variant: "Black / Charcoal",
        color: "Black / Charcoal",
        quantity: 400,
        totalQuantity: 400,
        priority: "Normal",
        outputDestination: "Customer Dispatch",
        plannedStartDate: "2026-05-22",
        plannedCompletionDate: "2026-05-28",
        requiredDate: "2026-06-30",
        status: "Completed",
        sizes: [
            { size: "S", quantity: 80, colors: [{ color: "Black", quantity: 50 }, { color: "Charcoal", quantity: 30 }] },
            { size: "M", quantity: 140, colors: [{ color: "Black", quantity: 90 }, { color: "Charcoal", quantity: 50 }] },
            { size: "L", quantity: 120, colors: [{ color: "Black", quantity: 75 }, { color: "Charcoal", quantity: 45 }] },
            { size: "XL", quantity: 60, colors: [{ color: "Black", quantity: 35 }, { color: "Charcoal", quantity: 25 }] }
        ],
        products: [
            {
                lineId: "PP-20260529-004-L1",
                orderNo: "ORD-2026-004",
                productId: "PRD-004",
                productCode: "PRD-004",
                productName: "Corporate Polo T-Shirt",
                category: "Corporate Wear",
                variant: "Black / Charcoal",
                quantity: 400,
                sourceName: "Namaste Corporate Supplies",
                requiredDate: "2026-06-30",
                plannedStartDate: "2026-05-22",
                plannedCompletionDate: "2026-05-28",
                status: "Completed",
                priority: "Normal",
                risk: false,
                productImage: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Company logo embroidery on left chest.",
                sizes: [
                    { size: "S", quantity: 80, colors: [{ color: "Black", quantity: 50 }, { color: "Charcoal", quantity: 30 }] },
                    { size: "M", quantity: 140, colors: [{ color: "Black", quantity: 90 }, { color: "Charcoal", quantity: 50 }] },
                    { size: "L", quantity: 120, colors: [{ color: "Black", quantity: 75 }, { color: "Charcoal", quantity: 45 }] },
                    { size: "XL", quantity: 60, colors: [{ color: "Black", quantity: 35 }, { color: "Charcoal", quantity: 25 }] }
                ]
            }
        ],
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-05-22",
                plannedEndDate: "2026-05-22",
                actualStartDate: "2026-05-22",
                actualEndDate: "2026-05-22",
                status: "Completed",
                completedQty: 400,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-05-23",
                plannedEndDate: "2026-05-24",
                actualStartDate: "2026-05-23",
                actualEndDate: "2026-05-24",
                status: "Completed",
                completedQty: 400,
                rejectedQty: 2
            },
            {
                stageId: "STG-003",
                stageName: "Stitching / Sewing",
                workCenter: "Sewing Line 1",
                plannedStartDate: "2026-05-25",
                plannedEndDate: "2026-05-27",
                actualStartDate: "2026-05-25",
                actualEndDate: "2026-05-27",
                status: "Completed",
                completedQty: 398,
                rejectedQty: 2
            },
            {
                stageId: "STG-004",
                stageName: "Finishing",
                workCenter: "Finishing Section",
                plannedStartDate: "2026-05-28",
                plannedEndDate: "2026-05-28",
                actualStartDate: "2026-05-28",
                actualEndDate: "2026-05-28",
                status: "Completed",
                completedQty: 398,
                rejectedQty: 0
            },
            {
                stageId: "STG-005",
                stageName: "Quality Check",
                workCenter: "QC Table",
                plannedStartDate: "2026-05-28",
                plannedEndDate: "2026-05-28",
                actualStartDate: "2026-05-28",
                actualEndDate: "2026-05-28",
                status: "Completed",
                completedQty: 398,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Production completed",
                text: "Corporate polo production completed and ready for customer dispatch."
            }
        ]
    },
    {
        id: "PP-20260529-005",
        planId: "PP-20260529-005",
        planNo: "PP-20260529-005",
        planDate: "2026-05-29",
        demandType: "Outlet Replenishment",
        outletId: "OUT-002",
        sourceId: "OUT-002",
        sourceName: "Pokhara Lakeside Outlet",
        productId: "PRD-005",
        productName: "Hotel Staff Uniform",
        variant: "Cream / Brown",
        color: "Cream / Brown",
        quantity: 80,
        totalQuantity: 80,
        priority: "Seasonal",
        outputDestination: "Outlet Transfer",
        plannedStartDate: "2026-06-08",
        plannedCompletionDate: "2026-06-16",
        requiredDate: "2026-06-24",
        status: "On Hold",
        sizes: [
            { size: "S", quantity: 20, colors: [{ color: "Cream", quantity: 12 }, { color: "Brown", quantity: 8 }] },
            { size: "M", quantity: 25, colors: [{ color: "Cream", quantity: 15 }, { color: "Brown", quantity: 10 }] },
            { size: "L", quantity: 25, colors: [{ color: "Cream", quantity: 15 }, { color: "Brown", quantity: 10 }] },
            { size: "XL", quantity: 10, colors: [{ color: "Cream", quantity: 6 }, { color: "Brown", quantity: 4 }] }
        ],
        products: [
            {
                lineId: "PP-20260529-005-L1",
                demandNo: "OUT-DEM-004",
                productId: "PRD-005",
                productCode: "PRD-005",
                productName: "Hotel Staff Uniform",
                category: "Hospitality Uniform",
                variant: "Cream / Brown",
                quantity: 80,
                sourceName: "Pokhara Lakeside Outlet",
                requiredDate: "2026-06-24",
                plannedStartDate: "2026-06-08",
                plannedCompletionDate: "2026-06-16",
                status: "On Hold",
                priority: "Seasonal",
                risk: true,
                productImage: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=640&q=80",
                productionNotes: "Waiting for printed fabric confirmation.",
                sizes: [
                    { size: "S", quantity: 20, colors: [{ color: "Cream", quantity: 12 }, { color: "Brown", quantity: 8 }] },
                    { size: "M", quantity: 25, colors: [{ color: "Cream", quantity: 15 }, { color: "Brown", quantity: 10 }] },
                    { size: "L", quantity: 25, colors: [{ color: "Cream", quantity: 15 }, { color: "Brown", quantity: 10 }] },
                    { size: "XL", quantity: 10, colors: [{ color: "Cream", quantity: 6 }, { color: "Brown", quantity: 4 }] }
                ]
            }
        ],
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-06-08",
                plannedEndDate: "2026-06-08",
                status: "On Hold",
                completedQty: 0,
                rejectedQty: 0,
                remarks: "Waiting for printed fabric confirmation."
            }
        ],
        activities: [
            {
                title: "Plan placed on hold",
                text: "Hotel Staff Uniform plan is on hold due to pending material confirmation."
            }
        ]
    }
];

window.productionPlans = window.mockProductionPlans;
window.plans = window.mockProductionPlans;
