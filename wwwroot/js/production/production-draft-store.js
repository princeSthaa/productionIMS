(function () {
    "use strict";

    const storageKey = "kaam.productionPlanDrafts.v1";
    const maxDrafts = 100;
    const fallbackProductImage = "/images/products/place-holder.png";

    window.ProductionDraftStore = {
        getDrafts: getDrafts,
        saveDraft: saveDraft,
        deleteDraft: deleteDraft,
        deleteDrafts: deleteDrafts,
        clearDrafts: clearDrafts,
        mergeWithPlans: mergeWithPlans
    };

    document.addEventListener("DOMContentLoaded", bindDraftCapture);

    function bindDraftCapture() {
        const customerPage = document.getElementById("customerOrderPlanPage");
        if (customerPage) {
            bindCustomerDraftCapture();
        }

        const outletPage = document.getElementById("outletDemandPlanPage");
        if (outletPage) {
            bindOutletDraftCapture();
        }

        const inHousePage = document.getElementById("inHousePlanPage");
        if (inHousePage) {
            bindInHouseDraftCapture();
        }
    }

    function bindCustomerDraftCapture() {
        const form = document.getElementById("productionPlanForm");
        const selectedDraftJson = document.getElementById("selectedDraftJson");
        if (!form || !selectedDraftJson) return;

        form.addEventListener("submit", function (event) {
            if (event.defaultPrevented) return;

            const selectedItems = readJsonArray(selectedDraftJson.value);
            if (!selectedItems.length) return;

            saveDraft(buildCustomerDraft(selectedItems));
        });
    }

    function bindOutletDraftCapture() {
        const form = document.getElementById("outletProductionPlanForm");
        const selectedDraftJson = document.getElementById("selectedOutletDraftJson");
        if (!form || !selectedDraftJson) return;

        form.addEventListener("submit", function (event) {
            if (event.defaultPrevented) return;

            const selectedItems = readJsonArray(selectedDraftJson.value);
            if (!selectedItems.length) return;

            saveDraft(buildOutletDraft(selectedItems));
        });
    }

    function bindInHouseDraftCapture() {
        const form = document.getElementById("productionPlanForm");
        if (!form) return;

        form.addEventListener("submit", function (event) {
            if (event.defaultPrevented) return;

            const draft = buildInHouseDraft();
            if (!draft) return;

            saveDraft(draft);
        });
    }

    function getDrafts() {
        return readStoredDrafts()
            .map(normalizePlan)
            .filter(function (draft) {
                return Boolean(draft.planNo);
            });
    }

    function saveDraft(plan) {
        const draft = normalizePlan(plan);
        if (!draft.planNo) return null;

        const existing = readStoredDrafts();
        const existingIndex = existing.findIndex(function (item) {
            return String(item.planNo || item.planId || item.id) === String(draft.planNo);
        });

        if (existingIndex >= 0) {
            draft.createdAt = existing[existingIndex].createdAt || draft.createdAt;
            existing.splice(existingIndex, 1, draft);
        } else {
            existing.unshift(draft);
        }

        writeStoredDrafts(existing.slice(0, maxDrafts));
        return draft;
    }

    function deleteDraft(planNo) {
        const filtered = readStoredDrafts().filter(function (draft) {
            return String(draft.planNo || draft.planId || draft.id) !== String(planNo);
        });

        writeStoredDrafts(filtered);
        return filtered.map(normalizePlan);
    }

    function deleteDrafts(planNos) {
        const ids = Array.isArray(planNos) ? planNos.map(String) : [];
        const filtered = readStoredDrafts().filter(function (draft) {
            const key = String(draft.planNo || draft.planId || draft.id);
            return !ids.includes(key);
        });

        writeStoredDrafts(filtered);
        return filtered.map(normalizePlan);
    }

    function clearDrafts() {
        writeStoredDrafts([]);
    }

    function mergeWithPlans(plans) {
        const basePlans = Array.isArray(plans) ? plans.slice() : [];
        const localDrafts = getDrafts();
        const planMap = {};

        basePlans.concat(localDrafts).forEach(function (plan) {
            const normalized = normalizePlan(plan);
            const key = normalized.planNo || normalized.planId || normalized.id;
            if (!key) return;

            planMap[key] = normalized;
        });

        return Object.values(planMap);
    }

    function buildCustomerDraft(selectedItems) {
        const products = selectedItems.map(function (item, index) {
            const quantity = toNumber(item.quantity || item.orderQty || item.qty);

            return {
                lineId: item.lineId || item.id || `CUST-L${index + 1}`,
                orderNo: item.orderNo || "ORDER",
                productId: item.productId || item.productCode || "",
                productCode: item.productCode || item.productId || "",
                productName: item.productName || item.orderItem || item.itemName || "Customer Product",
                category: item.category || "",
                variant: item.variant || getColorSummary(item),
                quantity: quantity,
                sourceName: item.customerName || item.name || "Customer",
                requiredDate: item.deliveryDate || item.requiredDate || "",
                plannedStartDate: "",
                plannedCompletionDate: "",
                status: "Draft",
                priority: item.priority || "Normal",
                risk: isUrgent(item.priority),
                productImage: item.productImage || item.orderImage || fallbackProductImage,
                productionNotes: item.productionNotes || "Created from customer order planning basket.",
                sizes: item.sizes || []
            };
        });

        const sourceNames = unique(products.map(function (product) {
            return product.sourceName;
        }));

        return buildDraftPlan({
            planNo: buildPlanNo("DRAFT-CUS"),
            demandType: "Customer Order",
            sourceType: "Customer",
            sourceName: sourceNames.length === 1 ? sourceNames[0] : "Multiple Customers",
            outputDestination: "Customer Dispatch",
            priority: getHighestPriority(products),
            sourceUrl: window.location.pathname + window.location.search,
            products: products,
            activityText: "Draft captured from customer order production basket."
        });
    }

    function buildOutletDraft(selectedItems) {
        const products = selectedItems.map(function (item, index) {
            const quantity = toNumber(item.suggestedQty || item.quantity || item.qty);

            return {
                lineId: item.lineId || item.id || `OUT-L${index + 1}`,
                demandNo: item.demandNo || "DEMAND",
                productId: item.productId || item.productCode || "",
                productCode: item.productCode || item.productId || "",
                productName: item.productName || "Outlet Product",
                category: item.category || "",
                variant: item.variant || getColorSummary(item),
                quantity: quantity,
                sourceName: item.outletName || "Outlet",
                requiredDate: item.requiredDate || "",
                plannedStartDate: "",
                plannedCompletionDate: "",
                status: "Draft",
                priority: item.priority || "Normal",
                risk: isUrgent(item.priority) || String(item.stockStatus || "").toLowerCase() === "critical",
                productImage: item.productImage || fallbackProductImage,
                productionNotes: item.planningNotes || "Created from outlet demand planning basket.",
                sizes: normalizeOutletSizes(item)
            };
        });

        const sourceNames = unique(products.map(function (product) {
            return product.sourceName;
        }));

        return buildDraftPlan({
            planNo: buildPlanNo("DRAFT-OUT"),
            demandType: "Outlet Replenishment",
            sourceType: "Outlet",
            sourceName: sourceNames.length === 1 ? sourceNames[0] : "Multiple Outlets",
            outputDestination: "Outlet Transfer",
            priority: getHighestPriority(products),
            sourceUrl: window.location.pathname + window.location.search,
            products: products,
            activityText: "Draft captured from outlet replenishment planning basket."
        });
    }

    function buildInHouseDraft() {
        const productSelect = document.getElementById("productDropdown");
        const warehouseSelect = document.getElementById("warehouseDropdown");
        const productId = getElementValue("productDropdown");
        const warehouseId = getElementValue("warehouseDropdown");
        const reason = getElementValue("inHouseReason");
        const totalQuantity = toNumber(getElementValue("totalQuantity"));
        const variantBreakdown = readJsonArray(getElementValue("variantBreakdownJson"));
        const variant = getElementValue("variantSummaryInput") || variantBreakdown.map(function (row) {
            return row.variant;
        }).filter(Boolean).join(" / ");

        if (!productId || !warehouseId || !reason || totalQuantity <= 0 || !variantBreakdown.length) {
            return null;
        }

        const product = getProductById(productId);
        const productName = getSelectedText(productSelect) || product.productName || "In-house Product";
        const warehouseName = getSelectedText(warehouseSelect) || "Finished Goods Warehouse";
        const planNo = getElementValue("PlanNo") || buildPlanNo("DRAFT-INH");

        const productLine = {
            lineId: `${planNo}-L1`,
            productId: productId,
            productCode: product.productCode || productId,
            productName: productName,
            category: product.category || "",
            variant: variant,
            quantity: totalQuantity,
            sourceName: warehouseName,
            requiredDate: getElementValue("requiredDate"),
            plannedStartDate: getElementValue("plannedStartDate"),
            plannedCompletionDate: getElementValue("plannedCompletionDate"),
            status: "Draft",
            priority: getElementValue("Priority") || "Normal",
            risk: false,
            productImage: product.productImage || product.imagePath || fallbackProductImage,
            productionNotes: reason,
            sizes: getInHouseSizeRows(variant),
            variantBreakdown: variantBreakdown
        };

        return buildDraftPlan({
            planNo: planNo,
            planDate: getElementValue("planDate") || getElementValue("PlanDate") || todayInputDate(),
            demandType: "In-house Stock",
            sourceType: "Warehouse",
            sourceId: warehouseId,
            sourceName: warehouseName,
            productId: productId,
            productName: productName,
            variant: variant,
            reason: reason,
            outputDestination: getElementValue("OutputDestination") || "Finished Goods Warehouse",
            priority: productLine.priority,
            plannedStartDate: productLine.plannedStartDate,
            plannedCompletionDate: productLine.plannedCompletionDate,
            requiredDate: productLine.requiredDate,
            sourceUrl: window.location.pathname + window.location.search,
            products: [productLine],
            activityText: "Draft captured from in-house production planning form."
        });
    }

    function buildDraftPlan(options) {
        const now = new Date();
        const products = Array.isArray(options.products) ? options.products : [];
        const totalQuantity = products.reduce(function (sum, product) {
            return sum + toNumber(product.quantity);
        }, 0);

        const requiredDates = products.map(function (product) {
            return product.requiredDate;
        }).filter(Boolean).sort();

        const startDates = products.map(function (product) {
            return product.plannedStartDate;
        }).filter(Boolean).sort();

        const completionDates = products.map(function (product) {
            return product.plannedCompletionDate;
        }).filter(Boolean).sort();

        return {
            id: options.planNo,
            planId: options.planNo,
            planNo: options.planNo,
            planDate: options.planDate || todayInputDate(now),
            demandType: options.demandType,
            sourceType: options.sourceType || "",
            sourceId: options.sourceId || "",
            sourceName: options.sourceName || "Production Draft",
            productId: options.productId || products[0]?.productId || "",
            productName: options.productName || products[0]?.productName || "Production Plan",
            variant: options.variant || products[0]?.variant || "",
            quantity: totalQuantity,
            totalQuantity: totalQuantity,
            priority: options.priority || "Normal",
            outputDestination: options.outputDestination || "",
            plannedStartDate: options.plannedStartDate || startDates[0] || "",
            plannedCompletionDate: options.plannedCompletionDate || completionDates[completionDates.length - 1] || "",
            requiredDate: options.requiredDate || requiredDates[0] || "",
            status: "Draft",
            draftSourceUrl: options.sourceUrl || "",
            draftSourceType: options.sourceType || "",
            draftSavedAt: now.toISOString(),
            createdAt: now.toISOString(),
            lastEditedAt: now.toISOString(),
            reason: options.reason || "",
            products: products,
            activities: [
                {
                    title: "Draft created",
                    text: options.activityText || "Production plan draft created."
                }
            ]
        };
    }

    function normalizePlan(plan) {
        const products = Array.isArray(plan.products) && plan.products.length
            ? plan.products.map(normalizeProduct)
            : [normalizeProduct(plan)];

        const planNo = plan.planNo || plan.planId || plan.id || buildPlanNo("DRAFT-PLAN");
        const totalQuantity = toNumber(plan.totalQuantity || plan.quantity) || products.reduce(function (sum, product) {
            return sum + toNumber(product.quantity);
        }, 0);

        return {
            id: plan.id || planNo,
            planId: plan.planId || planNo,
            planNo: planNo,
            planDate: plan.planDate || todayInputDate(),
            demandType: plan.demandType || "Production Draft",
            sourceType: plan.sourceType || plan.draftSourceType || "",
            sourceId: plan.sourceId || "",
            sourceName: plan.sourceName || plan.customerName || plan.outletName || plan.warehouseName || "Production Draft",
            productId: plan.productId || products[0]?.productId || "",
            productName: plan.productName || products[0]?.productName || "Production Plan",
            variant: plan.variant || plan.color || products[0]?.variant || "",
            color: plan.color || plan.variant || products[0]?.variant || "",
            quantity: totalQuantity,
            totalQuantity: totalQuantity,
            priority: plan.priority || "Normal",
            outputDestination: plan.outputDestination || "",
            plannedStartDate: plan.plannedStartDate || products[0]?.plannedStartDate || "",
            plannedCompletionDate: plan.plannedCompletionDate || products[0]?.plannedCompletionDate || "",
            requiredDate: plan.requiredDate || products[0]?.requiredDate || "",
            status: "Draft",
            draftSourceUrl: plan.draftSourceUrl || "",
            draftSourceType: plan.draftSourceType || plan.sourceType || "",
            draftSavedAt: plan.draftSavedAt || "",
            createdAt: plan.createdAt || "",
            lastEditedAt: plan.lastEditedAt || plan.draftSavedAt || plan.createdAt || "",
            reason: plan.reason || plan.inHouseReason || "",
            products: products,
            stages: plan.stages || [],
            activities: plan.activities || []
        };
    }

    function normalizeProduct(product) {
        return {
            lineId: product.lineId || product.id || "",
            orderNo: product.orderNo || "",
            demandNo: product.demandNo || "",
            productId: product.productId || product.productCode || "",
            productCode: product.productCode || product.productId || "",
            productName: product.productName || product.product || product.itemName || "Product",
            category: product.category || "",
            variant: product.variant || product.color || "",
            quantity: toNumber(product.quantity || product.suggestedQty || product.qty),
            sourceName: product.sourceName || product.customerName || product.outletName || product.warehouseName || "",
            requiredDate: product.requiredDate || product.deliveryDate || "",
            plannedStartDate: product.plannedStartDate || "",
            plannedCompletionDate: product.plannedCompletionDate || "",
            status: "Draft",
            priority: product.priority || "Normal",
            risk: Boolean(product.risk) || isUrgent(product.priority),
            productImage: product.productImage || product.orderImage || product.imagePath || fallbackProductImage,
            productionNotes: product.productionNotes || product.planningNotes || "",
            sizes: product.sizes || product.sizeBreakdown || [],
            variantBreakdown: product.variantBreakdown || []
        };
    }

    function normalizeOutletSizes(item) {
        const sizeGaps = Array.isArray(item.sizeGaps) ? item.sizeGaps : [];

        return sizeGaps.map(function (row) {
            const colorRows = row.colors || row.colorVariants || row.variants || [];

            if (!colorRows.length) {
                return {
                    size: row.size || "-",
                    quantity: toNumber(row.suggestedQty || row.quantity || row.qty),
                    colors: []
                };
            }

            return {
                size: row.size || "-",
                quantity: colorRows.reduce(function (sum, colorRow) {
                    return sum + toNumber(colorRow.suggestedQty || colorRow.quantity || colorRow.qty);
                }, 0),
                colors: colorRows.map(function (colorRow) {
                    return {
                        color: colorRow.color || colorRow.variant || colorRow.name || "-",
                        quantity: toNumber(colorRow.suggestedQty || colorRow.quantity || colorRow.qty)
                    };
                })
            };
        });
    }

    function getInHouseSizeRows(variant) {
        return ["XS", "S", "M", "L", "XL", "XXL"].map(function (size) {
            const input = document.getElementById(`size${size}`);
            const quantity = toNumber(input ? input.value : 0);

            return {
                size: size,
                quantity: quantity,
                colors: variant ? [{ color: variant, quantity: quantity }] : []
            };
        }).filter(function (row) {
            return row.quantity > 0;
        });
    }

    function getColorSummary(item) {
        const colors = [];
        const sizeRows = item.sizes || item.sizeGaps || [];

        if (Array.isArray(sizeRows)) {
            sizeRows.forEach(function (sizeRow) {
                const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
                colorRows.forEach(function (colorRow) {
                    const color = colorRow.color || colorRow.variant || colorRow.name;
                    if (color && !colors.includes(color)) {
                        colors.push(color);
                    }
                });
            });
        }

        if (!colors.length && item.variant) {
            String(item.variant).split("/").forEach(function (part) {
                const color = part.trim();
                if (color && !colors.includes(color)) {
                    colors.push(color);
                }
            });
        }

        return colors.join(" / ") || item.variant || "";
    }

    function getProductById(productId) {
        const products = window.productMasterData || window.products || window.productsData || [];

        return products.find(function (product) {
            return String(product.id || product.productId || product.productCode || "") === String(productId)
                || String(product.productCode || "") === String(productId);
        }) || {};
    }

    function readStoredDrafts() {
        try {
            const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function writeStoredDrafts(drafts) {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(Array.isArray(drafts) ? drafts : []));
        } catch (error) {
            // Ignore storage failures so form submission is not blocked.
        }
    }

    function readJsonArray(value) {
        if (!value) return [];

        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function buildPlanNo(prefix) {
        const now = new Date();
        const stamp = [
            now.getFullYear(),
            pad(now.getMonth() + 1),
            pad(now.getDate())
        ].join("") + "-" + [
            pad(now.getHours()),
            pad(now.getMinutes()),
            pad(now.getSeconds())
        ].join("");

        return `${prefix}-${stamp}`;
    }

    function todayInputDate(date) {
        const value = date || new Date();
        return [
            value.getFullYear(),
            pad(value.getMonth() + 1),
            pad(value.getDate())
        ].join("-");
    }

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function toNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function unique(values) {
        return values.filter(function (value, index, array) {
            return Boolean(value) && array.indexOf(value) === index;
        });
    }

    function isUrgent(priority) {
        return String(priority || "").toLowerCase() === "urgent";
    }

    function getHighestPriority(products) {
        const priorities = products.map(function (product) {
            return product.priority;
        });

        if (priorities.some(function (priority) { return isUrgent(priority); })) return "Urgent";
        if (priorities.some(function (priority) { return String(priority || "").toLowerCase() === "seasonal"; })) return "Seasonal";
        return "Normal";
    }

    function getElementValue(id) {
        const element = document.getElementById(id);
        return element ? String(element.value || "").trim() : "";
    }

    function getSelectedText(select) {
        if (!select || select.selectedIndex < 0) return "";
        return select.options[select.selectedIndex]?.text || "";
    }
})();
