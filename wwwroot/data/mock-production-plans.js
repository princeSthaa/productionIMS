window.mockProductionPlans = [
    {
        id: "PP-20260529-001",
        planId: "PP-20260529-001",
        planNo: "PP-20260529-001",
        planDate: "2026-05-29",
        demandType: "Customer Order",
        customerId: "CUST-001",
        sourceId: "CUST-001",
        sourceName: "Himalayan Public School",
        productId: "PROD-001",
        productName: "White School Shirt",
        variant: "White",
        color: "White",
        quantity: 500,
        totalQuantity: 500,
        priority: "Urgent",
        outputDestination: "Customer Dispatch",
        plannedStartDate: "2026-06-01",
        plannedCompletionDate: "2026-06-08",
        requiredDate: "2026-06-12",
        status: "Draft",
        sizes: {
            XS: 40,
            S: 80,
            M: 150,
            L: 140,
            XL: 70,
            XXL: 20
        },
        stages: [
            {
                stageId: "STG-001",
                stageName: "Material Check",
                workCenter: "Raw Material Store",
                plannedStartDate: "2026-06-01",
                plannedEndDate: "2026-06-01",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-06-02",
                plannedEndDate: "2026-06-03",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-003",
                stageName: "Stitching / Sewing",
                workCenter: "Sewing Line 1",
                plannedStartDate: "2026-06-04",
                plannedEndDate: "2026-06-06",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-004",
                stageName: "Finishing",
                workCenter: "Finishing Section",
                plannedStartDate: "2026-06-07",
                plannedEndDate: "2026-06-07",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            },
            {
                stageId: "STG-005",
                stageName: "Quality Check",
                workCenter: "QC Table",
                plannedStartDate: "2026-06-08",
                plannedEndDate: "2026-06-08",
                status: "Not Started",
                completedQty: 0,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Draft created",
                text: "Production plan created for Himalayan Public School uniform order."
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
        sourceName: "Kathmandu Flagship Outlet",
        productId: "PROD-002",
        productName: "Black Polo T-shirt",
        variant: "Black",
        color: "Black",
        quantity: 300,
        totalQuantity: 300,
        priority: "Normal",
        outputDestination: "Outlet Transfer",
        plannedStartDate: "2026-06-03",
        plannedCompletionDate: "2026-06-09",
        requiredDate: "2026-06-14",
        status: "Cutting",
        sizes: {
            XS: 20,
            S: 45,
            M: 90,
            L: 85,
            XL: 45,
            XXL: 15
        },
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
                completedQty: 300,
                rejectedQty: 0
            },
            {
                stageId: "STG-002",
                stageName: "Cutting",
                workCenter: "Cutting Section",
                plannedStartDate: "2026-06-04",
                plannedEndDate: "2026-06-05",
                actualStartDate: "2026-06-04",
                status: "In Progress",
                completedQty: 180,
                rejectedQty: 4
            },
            {
                stageId: "STG-003",
                stageName: "Stitching / Sewing",
                workCenter: "Sewing Line 1",
                plannedStartDate: "2026-06-06",
                plannedEndDate: "2026-06-08",
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
        productId: "PROD-004",
        productName: "Hoodie",
        variant: "Grey",
        color: "Grey",
        quantity: 220,
        totalQuantity: 220,
        priority: "Seasonal",
        outputDestination: "Finished Goods Warehouse",
        plannedStartDate: "2026-06-05",
        plannedCompletionDate: "2026-06-15",
        requiredDate: "2026-06-20",
        status: "Material Check",
        sizes: {
            XS: 10,
            S: 30,
            M: 65,
            L: 70,
            XL: 35,
            XXL: 10
        },
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
                text: "Hoodie production planned for winter stock preparation."
            }
        ]
    },
    {
        id: "PP-20260529-004",
        planId: "PP-20260529-004",
        planNo: "PP-20260529-004",
        planDate: "2026-05-29",
        demandType: "Customer Order",
        customerId: "CUST-004",
        sourceId: "CUST-004",
        sourceName: "Namaste Corporate Supplies",
        productId: "PROD-003",
        productName: "Formal Trouser",
        variant: "Black",
        color: "Black",
        quantity: 180,
        totalQuantity: 180,
        priority: "Normal",
        outputDestination: "Customer Dispatch",
        plannedStartDate: "2026-05-22",
        plannedCompletionDate: "2026-05-28",
        requiredDate: "2026-05-30",
        status: "Completed",
        sizes: {
            XS: 5,
            S: 25,
            M: 55,
            L: 55,
            XL: 30,
            XXL: 10
        },
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
                completedQty: 180,
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
                completedQty: 180,
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
                completedQty: 178,
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
                completedQty: 178,
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
                completedQty: 178,
                rejectedQty: 0
            },
            {
                stageId: "STG-006",
                stageName: "Packing",
                workCenter: "Packing Section",
                plannedStartDate: "2026-05-28",
                plannedEndDate: "2026-05-28",
                actualStartDate: "2026-05-28",
                actualEndDate: "2026-05-28",
                status: "Completed",
                completedQty: 178,
                rejectedQty: 0
            }
        ],
        activities: [
            {
                title: "Production completed",
                text: "Formal trouser production completed and ready for customer dispatch."
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
        productId: "PROD-005",
        productName: "Kurta Set",
        variant: "Cream",
        color: "Cream",
        quantity: 150,
        totalQuantity: 150,
        priority: "Seasonal",
        outputDestination: "Outlet Transfer",
        plannedStartDate: "2026-06-08",
        plannedCompletionDate: "2026-06-16",
        requiredDate: "2026-06-22",
        status: "On Hold",
        sizes: {
            XS: 10,
            S: 25,
            M: 45,
            L: 40,
            XL: 20,
            XXL: 10
        },
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
                text: "Kurta Set plan is on hold due to pending material confirmation."
            }
        ]
    }
];