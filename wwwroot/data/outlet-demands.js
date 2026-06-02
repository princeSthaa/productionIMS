window.outletDemandCatalogData = [
    {
        id: 1,
        demandNo: "OUT-DEM-001",
        outletId: 1,
        outletCode: "OUT-NR-001",
        outletName: "New Road Outlet",
        outletLocation: "New Road, Kathmandu",
        outletManager: "Suman Shrestha",
        phone: "9801001001",

        productId: "PRD-003",
        productCode: "PRD-003",
        productName: "Men Casual Shirt",
        category: "Retail Garment",
        variant: "White",
        productImage: "/images/products/casual-shirt.jpg",

        currentStock: 18,
        reorderLevel: 90,
        maxStock: 160,
        stockGap: 72,
        suggestedQty: 120,

        last7DaysSales: 36,
        last30DaysSales: 145,
        avgDailySales: 4.8,
        salesVelocity: "Fast",

        stockStatus: "Critical",
        requiredDate: "2026-06-22",
        priority: "Urgent",
        materialStatus: "Unchecked",
        planningNotes: "Fast moving item. Replenish before weekend demand.",

        sizeGaps: [
            { size: "M", currentStock: 5, reorderLevel: 30, suggestedQty: 40 },
            { size: "L", currentStock: 8, reorderLevel: 35, suggestedQty: 50 },
            { size: "XL", currentStock: 5, reorderLevel: 25, suggestedQty: 30 }
        ]
    },
    {
        id: 2,
        demandNo: "OUT-DEM-002",
        outletId: 1,
        outletCode: "OUT-NR-001",
        outletName: "New Road Outlet",
        outletLocation: "New Road, Kathmandu",
        outletManager: "Suman Shrestha",
        phone: "9801001001",

        productId: "PRD-004",
        productCode: "PRD-004",
        productName: "Corporate Polo T-Shirt",
        category: "Corporate Wear",
        variant: "Black",
        productImage: "/images/products/polo-shirt.jpg",

        currentStock: 22,
        reorderLevel: 100,
        maxStock: 180,
        stockGap: 78,
        suggestedQty: 130,

        last7DaysSales: 28,
        last30DaysSales: 118,
        avgDailySales: 3.9,
        salesVelocity: "Fast",

        stockStatus: "Low Stock",
        requiredDate: "2026-06-25",
        priority: "Normal",
        materialStatus: "Unchecked",
        planningNotes: "Common corporate stock item. Keep enough sizes M and L.",

        sizeGaps: [
            { size: "S", currentStock: 6, reorderLevel: 20, suggestedQty: 25 },
            { size: "M", currentStock: 5, reorderLevel: 35, suggestedQty: 45 },
            { size: "L", currentStock: 7, reorderLevel: 30, suggestedQty: 40 },
            { size: "XL", currentStock: 4, reorderLevel: 15, suggestedQty: 20 }
        ]
    },
    {
        id: 3,
        demandNo: "OUT-DEM-003",
        outletId: 2,
        outletCode: "OUT-LTP-001",
        outletName: "Lalitpur Outlet",
        outletLocation: "Jawalakhel, Lalitpur",
        outletManager: "Pratik Lama",
        phone: "9802002002",

        productId: "PRD-002",
        productCode: "PRD-002",
        productName: "School Tracksuit Set",
        category: "Sports Uniform",
        variant: "Grey / Royal Blue",
        productImage: "/images/products/tracksuit.jpg",

        currentStock: 35,
        reorderLevel: 85,
        maxStock: 150,
        stockGap: 50,
        suggestedQty: 90,

        last7DaysSales: 14,
        last30DaysSales: 72,
        avgDailySales: 2.4,
        salesVelocity: "Normal",

        stockStatus: "Reorder Soon",
        requiredDate: "2026-06-30",
        priority: "Normal",
        materialStatus: "Unchecked",
        planningNotes: "Seasonal school demand may increase next month.",

        sizeGaps: [
            { size: "S", currentStock: 8, reorderLevel: 20, suggestedQty: 20 },
            { size: "M", currentStock: 10, reorderLevel: 30, suggestedQty: 35 },
            { size: "L", currentStock: 12, reorderLevel: 25, suggestedQty: 25 },
            { size: "XL", currentStock: 5, reorderLevel: 10, suggestedQty: 10 }
        ]
    },
    {
        id: 4,
        demandNo: "OUT-DEM-004",
        outletId: 3,
        outletCode: "OUT-PKR-001",
        outletName: "Pokhara Outlet",
        outletLocation: "Lakeside, Pokhara",
        outletManager: "Anita Gurung",
        phone: "9803003003",

        productId: "PRD-005",
        productCode: "PRD-005",
        productName: "Hotel Staff Uniform",
        category: "Hospitality Uniform",
        variant: "Cream / Brown",
        productImage: "/images/products/hotel-uniform.jpg",

        currentStock: 10,
        reorderLevel: 60,
        maxStock: 120,
        stockGap: 50,
        suggestedQty: 80,

        last7DaysSales: 18,
        last30DaysSales: 88,
        avgDailySales: 2.9,
        salesVelocity: "Fast",

        stockStatus: "Critical",
        requiredDate: "2026-06-24",
        priority: "Urgent",
        materialStatus: "Unchecked",
        planningNotes: "Tourism season demand. Prioritize hospitality uniform stock.",

        sizeGaps: [
            { size: "S", currentStock: 2, reorderLevel: 15, suggestedQty: 20 },
            { size: "M", currentStock: 3, reorderLevel: 20, suggestedQty: 25 },
            { size: "L", currentStock: 4, reorderLevel: 18, suggestedQty: 25 },
            { size: "XL", currentStock: 1, reorderLevel: 7, suggestedQty: 10 }
        ]
    },
    {
        id: 5,
        demandNo: "OUT-DEM-005",
        outletId: 2,
        outletCode: "OUT-LTP-001",
        outletName: "Lalitpur Outlet",
        outletLocation: "Jawalakhel, Lalitpur",
        outletManager: "Pratik Lama",
        phone: "9802002002",

        productId: "PRD-001",
        productCode: "PRD-001",
        productName: "School Uniform Set",
        category: "Uniform",
        variant: "Navy Blue",
        productImage: "/images/products/school-uniform.jpg",

        currentStock: 42,
        reorderLevel: 120,
        maxStock: 220,
        stockGap: 78,
        suggestedQty: 140,

        last7DaysSales: 22,
        last30DaysSales: 96,
        avgDailySales: 3.2,
        salesVelocity: "Normal",

        stockStatus: "Low Stock",
        requiredDate: "2026-07-02",
        priority: "Normal",
        materialStatus: "Unchecked",
        planningNotes: "Prepare before school season order increase.",

        sizeGaps: [
            { size: "XS", currentStock: 8, reorderLevel: 20, suggestedQty: 20 },
            { size: "S", currentStock: 10, reorderLevel: 30, suggestedQty: 35 },
            { size: "M", currentStock: 12, reorderLevel: 35, suggestedQty: 45 },
            { size: "L", currentStock: 8, reorderLevel: 25, suggestedQty: 30 },
            { size: "XL", currentStock: 4, reorderLevel: 10, suggestedQty: 10 }
        ]
    }
];

window.outletDemands = window.outletDemandCatalogData;