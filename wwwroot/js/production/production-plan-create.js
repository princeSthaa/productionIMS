document.addEventListener("DOMContentLoaded", function () {
    const fallbackProductImage = "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=480&q=80";
    const pageRoot = document.getElementById("customerOrderPlanPage");

    if (!pageRoot) return;

    const selectedCustomerId = pageRoot ? String(pageRoot.dataset.selectedCustomerId || "").trim() : "";
    const allCatalogItems = window.customerOrderCatalogData || window.customerMasterData || [];
    const catalogItems = selectedCustomerId
        ? allCatalogItems.filter(function (item) {
            const normalizedItem = normalizeCatalogItem(item);
            return String(normalizedItem.customerId) === selectedCustomerId;
        })
        : allCatalogItems;
    const selectedCustomer = selectedCustomerId
        ? catalogItems.map(normalizeCatalogItem)[0] || null
        : null;
    const materials = window.materialMasterData || window.materials || window.materialsData || [];
    const bomData = window.bomMasterData || window.bomData || window.boms || [];

    let selectedPlanItems = [];
    let activeDetailItem = null;

    const catalogGrid = document.getElementById("customerOrderCatalogGrid");

    const selectedDraftJson = document.getElementById("selectedDraftJson");

    const selectedItemCount = document.getElementById("selectedItemCount");
    const selectedTotalQty = document.getElementById("selectedTotalQty");
    const selectedEarliestDelivery = document.getElementById("selectedEarliestDelivery");

    const basketTotalItems = document.getElementById("basketTotalItems");
    const basketTotalQty = document.getElementById("basketTotalQty");
    const basketEarliestDelivery = document.getElementById("basketEarliestDelivery");
    const basketMaterialStatus = document.getElementById("basketMaterialStatus");
    const planBasketItems = document.getElementById("planBasketItems");

    const checkBulkMaterialBtn = document.getElementById("checkBulkMaterialBtn");
    const clearBasketBtn = document.getElementById("clearBasketBtn");
    const createProductionPlanBtn = document.getElementById("createProductionPlanBtn");
    const bulkMaterialBody = document.getElementById("bulkMaterialBody");
    const productionPlanForm = document.getElementById("productionPlanForm");

    const orderDetailModal = document.getElementById("orderDetailModal");
    const addDetailToPlanBtn = document.getElementById("addDetailToPlanBtn");
    const openProduct3dPreviewBtn = document.getElementById("openProduct3dPreviewBtn");
    const product3dPreviewModal = document.getElementById("product3dPreviewModal");
    const product3dScene = document.getElementById("product3dScene");
    const product3dCanvas = document.getElementById("product3dCanvas");
    const product3dLoading = document.getElementById("product3dLoading");
    const product3dFallback = document.getElementById("product3dFallback");
    const product3dFallbackImage = document.getElementById("product3dFallbackImage");
    const saveProduct3dImageBtn = document.getElementById("saveProduct3dImageBtn");
    const product3dFrontBtn = document.getElementById("product3dFrontBtn");
    const product3dBackBtn = document.getElementById("product3dBackBtn");
    const product3dFlipCard = document.getElementById("product3dFlipCard");
    const product3dFrontImage = document.getElementById("product3dFrontImage");
    const product3dBackImage = document.getElementById("product3dBackImage");
    const product3dViewPill = document.getElementById("product3dViewPill");
    const product3dVariantButtons = document.getElementById("product3dVariantButtons");
    const product3dThumbs = document.getElementById("product3dThumbs");
    const product3dSizeButtons = document.getElementById("product3dSizeButtons");

    const threeJsCdnUrl = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    const mockup3dAssets = {
        white: {
            label: "Production Sample",
            front: "/images/mockup3dimages/whiteshirtfront.png",
            back: "/images/mockup3dimages/whiteshirtback.png"
        }
    };
    let threeJsLoadPromise = null;
    let product3dState = null;
    let product3dSelection = {
        item: null,
        color: "white",
        view: "front",
        size: "M"
    };

    initialize();

    function initialize() {
        renderSelectedCustomerSummary();
        renderCatalog();
        renderBasket();

        document.querySelectorAll("[data-close-modal]").forEach(function (button) {
            button.addEventListener("click", function () {
                const modalId = this.getAttribute("data-close-modal");
                const modal = document.getElementById(modalId);

                if (modal) {
                    modal.classList.add("hidden");
                }

                if (modalId === "product3dPreviewModal") {
                    stopProduct3dPreview();
                }
            });
        });

        if (openProduct3dPreviewBtn) {
            openProduct3dPreviewBtn.addEventListener("click", function () {
                if (activeDetailItem) {
                    openProduct3dPreview(activeDetailItem);
                }
            });
        }

        if (saveProduct3dImageBtn) {
            saveProduct3dImageBtn.addEventListener("click", saveProduct3dImage);
        }

        if (product3dFrontBtn) {
            product3dFrontBtn.addEventListener("click", function () {
                product3dSelection.view = "front";
                renderProduct3dPreview();
            });
        }

        if (product3dBackBtn) {
            product3dBackBtn.addEventListener("click", function () {
                product3dSelection.view = "back";
                renderProduct3dPreview();
            });
        }

        if (product3dVariantButtons) {
            product3dVariantButtons.addEventListener("click", function (event) {
                const button = event.target.closest("[data-product-3d-color]");
                if (!button) return;

                product3dSelection.color = button.getAttribute("data-product-3d-color") || "white";
                renderProduct3dPreview();
            });
        }

        if (product3dThumbs) {
            product3dThumbs.addEventListener("click", function (event) {
                const button = event.target.closest("[data-product-3d-color][data-product-3d-view]");
                if (!button) return;

                product3dSelection.color = button.getAttribute("data-product-3d-color") || "white";
                product3dSelection.view = button.getAttribute("data-product-3d-view") || "front";
                renderProduct3dPreview();
            });
        }

        if (product3dSizeButtons) {
            product3dSizeButtons.addEventListener("click", function (event) {
                const button = event.target.closest("[data-product-3d-size]");
                if (!button) return;

                product3dSelection.size = button.getAttribute("data-product-3d-size") || "M";
                renderProduct3dPreview();
            });
        }

        if (addDetailToPlanBtn) {
            addDetailToPlanBtn.addEventListener("click", function () {
                if (activeDetailItem) {
                    addToPlan(activeDetailItem.id);

                    if (!isItemSelected(activeDetailItem.id)) return;

                    closeModal("orderDetailModal");
                }
            });
        }

        if (checkBulkMaterialBtn) {
            checkBulkMaterialBtn.addEventListener("click", checkBulkMaterials);
        }

        if (clearBasketBtn) {
            clearBasketBtn.addEventListener("click", function () {
                if (!selectedPlanItems.length) return;

                if (confirm("Clear all selected production plan items?")) {
                    selectedPlanItems = [];
                    renderBasket();
                    renderCatalog();
                    resetBulkMaterialTable();
                }
            });
        }

        if (productionPlanForm) {
            productionPlanForm.addEventListener("submit", function (event) {
                if (!selectedPlanItems.length) {
                    event.preventDefault();
                    alert("Please add at least one customer order item to the production plan.");
                    return;
                }

                syncSelectedDraftJson();
            });
        }

        window.addEventListener("resize", resizeProduct3dPreview);

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                stopProduct3dPreview();
            }
        });
    }

    function renderSelectedCustomerSummary() {
        const selectedCustomerCard = document.getElementById("selectedCustomerCard");
        const customerSelectionWarning = document.getElementById("customerSelectionWarning");

        if (!selectedCustomerId) {
            if (customerSelectionWarning) {
                customerSelectionWarning.classList.remove("hidden");
            }

            setText("customerOrderHeaderText", "No customer is selected yet. Choose a customer to narrow the order item catalog.");
            setText("customerOrderCatalogTitle", "All Ready Customer Orders");
            setText("customerOrderItemsTitle", "All Customer Order Items");
            setText("customerOrderItemsText", "Choose a customer first for the normal customer-specific planning flow.");
            return;
        }

        if (!selectedCustomer) {
            if (customerSelectionWarning) {
                customerSelectionWarning.classList.remove("hidden");
                customerSelectionWarning.textContent = "The selected customer was not found in the current customer order data.";
            }

            setText("customerOrderHeaderText", "The selected customer was not found in the current customer order data.");
            setText("customerOrderCatalogTitle", "No Orders Found");
            setText("customerOrderItemsTitle", "No Customer Order Items");
            setText("customerOrderItemsText", "Go back to the customer catalog and choose another customer.");
            return;
        }

        if (customerSelectionWarning) {
            customerSelectionWarning.classList.add("hidden");
        }

        if (selectedCustomerCard) {
            selectedCustomerCard.classList.remove("hidden");
        }

        const normalizedItems = catalogItems.map(normalizeCatalogItem);
        const totalQty = normalizedItems.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);

        const earliestDelivery = normalizedItems.length
            ? normalizedItems.map(function (item) {
                return item.deliveryDate;
            }).sort()[0]
            : "";

        setText("customerOrderHeaderText", `Showing order items for ${selectedCustomer.customerName}. Add one or more items to the production plan basket.`);
        setText("customerOrderCatalogTitle", `${selectedCustomer.customerName} Orders`);
        setText("customerOrderItemsTitle", `${selectedCustomer.customerName} Order Items`);
        setText("customerOrderItemsText", "Click View Details to inspect size chart, measurements, and material requirements before adding to plan.");

        setText("selectedCustomerAvatar", getInitials(selectedCustomer.customerName));
        setText("selectedCustomerName", selectedCustomer.customerName);
        setText("selectedCustomerMeta", `${selectedCustomer.customerCode} | ${selectedCustomer.customerType} | ${selectedCustomer.paymentTerms || "Payment terms not set"}`);
        setText("selectedCustomerPhone", selectedCustomer.phone || "-");
        setText("selectedCustomerAddress", selectedCustomer.address || "-");
        setText("selectedCustomerOrders", normalizedItems.length);
        setText("selectedCustomerQty", `${formatNumber(totalQty)} pcs`);
        setText("selectedCustomerDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");
    }

    function renderCatalog() {
        if (!catalogGrid) return;

        let items = catalogItems.map(normalizeCatalogItem);
        let flattenedItems = [];

        items.forEach(function (item) {
            const palettes = getUniquePalettes(item);

            if (palettes.length > 1) {
                palettes.forEach(function (paletteName) {
                    const cloned = { ...item };
                    cloned.id = `${item.id}|${paletteName}`;
                    cloned.displayPalette = paletteName;
                    cloned.quantity = calculateQuantityForPalette(item, paletteName);
                    flattenedItems.push(cloned);
                });
            } else {
                item.displayPalette = palettes[0] || item.variant || "-";
                flattenedItems.push(item);
            }
        });

        flattenedItems.sort(function (a, b) {
            return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        });

        if (!flattenedItems.length) {
            const emptyText = selectedCustomerId
                ? "No order items found for the selected customer."
                : "No customer order items found.";

            catalogGrid.innerHTML = `
                <div class="empty-cell">
                    ${emptyText}
                </div>
            `;
            return;
        }

        catalogGrid.innerHTML = flattenedItems.map(function (item) {
            const isSelected = isItemSelected(item.id);

            const materialPreview = getItemMaterialPreview(item);
            const deliveryClass = getDeliveryBadgeClass(item.deliveryDate);
            const priorityClass = getPriorityClass(item.priority);

            return `
                <article class="customer-order-card ${isSelected ? "selected" : ""}">
                    <div class="customer-order-image-wrap">
                        <img src="${escapeHtml(item.productImage)}"
                             alt="${escapeHtml(item.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />

                        <span class="catalog-status-chip ${isSelected ? "added" : ""}">
                            ${isSelected ? "Added" : "Ready"}
                        </span>
                    </div>

                    <div class="customer-order-card-body">
                        <div class="catalog-card-top">
                            <span class="customer-code">${escapeHtml(item.orderNo)}</span>
                            <span class="${priorityClass}">${escapeHtml(item.priority)}</span>
                        </div>

                        <h3>${escapeHtml(item.productName)}</h3>

                        <p class="catalog-customer-name">
                            ${escapeHtml(item.customerName)}
                        </p>

                        <div class="catalog-meta-grid">
                            <div>
                                <span>Customer Type</span>
                                <strong>${escapeHtml(item.customerType)}</strong>
                            </div>
                            <div>
                                <span>Quantity</span>
                                <strong>${formatNumber(item.quantity)} pcs</strong>
                            </div>
                            <div>
                                <span>Delivery</span>
                                <strong>${formatDate(item.deliveryDate)}</strong>
                            </div>
                            <div>
                                <span>Color Palette</span>
                                ${renderPaletteChip(item.displayPalette)}
                            </div>
                        </div>

                        <div class="catalog-mini-status">
                            <span class="${deliveryClass}">
                                ${getDeliveryStatusText(item.deliveryDate)}
                            </span>

                            <span class="${materialPreview.hasShortage ? "material-shortage" : "material-ok"}">
                                ${materialPreview.label}
                            </span>
                        </div>

                        <div class="catalog-card-actions">
                            <button type="button"
                                    class="btn btn-light view-detail-btn"
                                    data-id="${escapeHtml(item.id)}">
                                View Details
                            </button>

                            <button type="button"
                                    class="btn btn-primary add-plan-btn"
                                    data-id="${escapeHtml(item.id)}"
                                    ${isSelected ? "disabled" : ""}>
                                ${isSelected ? "Added" : "Add to Plan"}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        document.querySelectorAll(".view-detail-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                openDetailModal(this.getAttribute("data-id"));
            });
        });

        document.querySelectorAll(".add-plan-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                addToPlan(this.getAttribute("data-id"));
            });
        });
    }

    function getUniquePalettes(item) {
        const palettes = [];
        getSizeColorRows(item).forEach(function (row) {
            const p = getEffectiveRowPalette(item, row);
            if (p && p !== "-" && !palettes.includes(p)) {
                palettes.push(p);
            }
        });
        return palettes;
    }

    function calculateQuantityForPalette(item, paletteName) {
        return getSizeColorRows(item).reduce(function (sum, row) {
            if (getEffectiveRowPalette(item, row) === paletteName) {
                return sum + Number(row.quantity || 0);
            }
            return sum;
        }, 0);
    }

    function openDetailModal(id) {
        const item = catalogItems.map(normalizeCatalogItem).find(function (catalogItem) {
            return isSameItemId(catalogItem.id, id);
        });

        if (!item) return;

        activeDetailItem = item;

        setText("detailProductName", item.productName);
        setText("detailOrderSubtitle", `${item.orderNo} • ${item.customerName}`);
        setText("detailCustomerName", item.customerName);
        setText("detailOrderNo", item.orderNo);
        setText("detailCustomerType", item.customerType);
        setText("detailPriority", item.priority);
        setText("detailDeliveryBadge", getDeliveryStatusText(item.deliveryDate));
        setText("detailItemName", item.productName);
        setText("detailQuantity", `${formatNumber(item.quantity)} pcs`);
        setText("detailDeliveryDate", formatDate(item.deliveryDate));
        setText("detailVariant", getColorSummary(item));
        renderPalettePreviewById("detailVariantPalettePreview", getColorSummary(item));
        setText("detailDeliveryLocation", item.deliveryLocation);
        setText("detailProductionNotes", item.productionNotes);

        const image = document.getElementById("detailProductImage");
        if (image) {
            image.src = item.productImage;
            image.alt = item.productName;
        }

        const priorityElement = document.getElementById("detailPriority");
        if (priorityElement) {
            priorityElement.className = getPriorityClass(item.priority);
        }

        const deliveryElement = document.getElementById("detailDeliveryBadge");
        if (deliveryElement) {
            deliveryElement.className = getDeliveryBadgeClass(item.deliveryDate);
        }

        renderDetailSizeBreakdown(item);
        renderDetailMeasurements(item);
        renderDetailMaterials(item);

        if (openProduct3dPreviewBtn) {
            openProduct3dPreviewBtn.disabled = false;
        }

        if (addDetailToPlanBtn) {
            const alreadyAdded = isItemSelected(item.id);
            addDetailToPlanBtn.disabled = alreadyAdded;
            addDetailToPlanBtn.textContent = alreadyAdded ? "Already Added to Plan" : "Add to Production Plan";
        }

        if (orderDetailModal) {
            orderDetailModal.classList.remove("hidden");
        }
    }

    function openProduct3dPreview(item) {
        if (!item || !product3dPreviewModal) return;

        product3dSelection = {
            item: item,
            color: "white",
            view: "front",
            size: getInitialMockupSize(item)
        };

        renderProduct3dPreview();
        product3dPreviewModal.classList.remove("hidden");
    }

    function renderProduct3dPreview() {
        const item = product3dSelection.item;
        if (!item) return;

        const selectedAsset = mockup3dAssets[product3dSelection.color] || mockup3dAssets.white;
        const isBackView = product3dSelection.view === "back";
        const availableSizes = getAvailableMockupSizes(item);

        const catalogProduct = getCatalogProduct({ productId: item.productId }) || {};
        const availablePalette = catalogProduct.availableColors ? catalogProduct.availableColors.join(" / ") : (catalogProduct.variant || "-");
        const customerPalette = item.displayPalette || getColorSummary(item);

        setText("product3dPreviewTitle", item.productName || "Product Sample Preview");
        setText("product3dPreviewSubtitle", `${item.orderNo} | ${item.customerName}`);
        setText("product3dProductName", item.productName || "Product Preview");
        setText("product3dDescription", `Production sample template for ${item.orderNo}. Inspect the front and back layout.`);
        setText("product3dOrderNo", item.orderNo);
        setText("product3dCustomerName", item.customerName);
        setText("product3dQuantity", `${formatNumber(item.quantity)} pcs`);
        
        setText("product3dAvailablePalette", availablePalette);
        renderPalettePreviewById("product3dAvailablePalettePreview", availablePalette, { compact: true });
        
        setText("product3dCustomerPalette", customerPalette);
        renderPalettePreviewById("product3dCustomerPalettePreview", customerPalette, { compact: true });

        setText("product3dColorLabel", "Standard Template");
        setText("product3dSizeLabel", product3dSelection.size);

        if (product3dFrontImage) {
            product3dFrontImage.src = selectedAsset.front;
            product3dFrontImage.alt = "Standard front sample";
        }

        if (product3dBackImage) {
            product3dBackImage.src = selectedAsset.back;
            product3dBackImage.alt = "Standard back sample";
        }

        if (product3dFlipCard) {
            product3dFlipCard.classList.toggle("back", isBackView);
        }

        if (product3dFrontBtn) {
            product3dFrontBtn.classList.toggle("active", !isBackView);
        }

        if (product3dBackBtn) {
            product3dBackBtn.classList.toggle("active", isBackView);
        }

        if (product3dViewPill) {
            product3dViewPill.textContent = isBackView ? "BACK VIEW" : "FRONT VIEW";
        }

        if (product3dVariantButtons) {
            product3dVariantButtons.innerHTML = `<div class="info-tag">Fixed Production Sample</div>`;
        }

        if (product3dThumbs) {
            product3dThumbs.innerHTML = `
                <button type="button" class="product-3d-thumb ${!isBackView ? "active" : ""}" data-product-3d-color="white" data-product-3d-view="front">
                    <img src="${mockup3dAssets.white.front}" alt="Front" />
                </button>
                <button type="button" class="product-3d-thumb ${isBackView ? "active" : ""}" data-product-3d-color="white" data-product-3d-view="back">
                    <img src="${mockup3dAssets.white.back}" alt="Back" />
                </button>
            `;
        }

        if (product3dSizeButtons) {
            product3dSizeButtons.innerHTML = availableSizes.map(function (size) {
                const active = size === product3dSelection.size;
                return `
                    <button type="button"
                            class="product-3d-size ${active ? "active" : ""}"
                            data-product-3d-size="${escapeHtml(size)}">
                        ${escapeHtml(size)}
                    </button>
                `;
            }).join("");
        }

        setText(
            "product3dSummary",
            `View: ${isBackView ? "Back" : "Front"} | Template: White Shirt`
        );
    }

    function populateProduct3dPreview(item) {
        product3dSelection.item = item;
        renderProduct3dPreview();
    }

    function getInitialMockupColor(item) {
        const colors = getUniqueColors(item).join(" ").toLowerCase();

        if (colors.includes("black") || colors.includes("charcoal")) return "black";
        if (colors.includes("red")) return "red";
        if (colors.includes("white") || colors.includes("cream")) return "white";

        return "white";
    }

    function getAvailableMockupSizes(item) {
        const sizes = (item.sizes || []).map(function (row) {
            return row.size;
        }).filter(Boolean);

        return sizes.length ? sizes : ["S", "M", "L", "XL"];
    }

    function getInitialMockupSize(item) {
        const sizes = getAvailableMockupSizes(item);

        if (sizes.includes("M")) return "M";
        return sizes[0] || "M";
    }

    function getCurrentMockupImage() {
        const selectedAsset = mockup3dAssets[product3dSelection.color] || mockup3dAssets.white;
        return product3dSelection.view === "back" ? selectedAsset.back : selectedAsset.front;
    }

    function getCurrentMockupLabel() {
        const selectedAsset = mockup3dAssets[product3dSelection.color] || mockup3dAssets.white;
        return `${selectedAsset.label}-${product3dSelection.view}`;
    }

    function setProduct3dLoading() {
        if (product3dLoading) {
            product3dLoading.classList.add("hidden");
        }
    }

    function ensureThreeJs() {
        if (window.THREE) {
            return Promise.resolve(window.THREE);
        }

        if (!threeJsLoadPromise) {
            threeJsLoadPromise = new Promise(function (resolve, reject) {
                const script = document.createElement("script");
                script.src = threeJsCdnUrl;
                script.crossOrigin = "anonymous";
                script.onload = function () {
                    if (window.THREE) {
                        resolve(window.THREE);
                        return;
                    }

                    reject(new Error("THREE global was not available after script load."));
                };
                script.onerror = function () {
                    reject(new Error("Unable to load Three.js."));
                };

                document.head.appendChild(script);
            });
        }

        return threeJsLoadPromise;
    }

    function renderThreeProductPreview(THREE, item) {
        if (!product3dScene || !product3dCanvas) {
            showProduct3dFallback(item);
            return;
        }

        disposeProduct3dPreview();
        setProduct3dLoading(false);

        if (product3dFallback) {
            product3dFallback.classList.add("hidden");
        }

        product3dCanvas.classList.remove("hidden");

        const size = getProduct3dSize();
        const renderer = new THREE.WebGLRenderer({
            canvas: product3dCanvas,
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(size.width, size.height, false);

        if (THREE.sRGBEncoding) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, size.width / size.height, 0.1, 100);
        camera.position.set(0, 0.25, 6);

        const fabricColor = getPreviewColor(item);
        const group = new THREE.Group();
        group.rotation.x = -0.08;
        group.rotation.y = -0.35;

        const fabricMaterial = new THREE.MeshStandardMaterial({
            color: fabricColor,
            roughness: 0.72,
            metalness: 0.04
        });

        const imageMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        const body = new THREE.Mesh(new THREE.BoxGeometry(2.22, 3.02, 0.22), fabricMaterial);
        const leftSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.12, 0.18), fabricMaterial);
        const rightSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.12, 0.18), fabricMaterial);
        const imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(2.04, 2.72), imageMaterial);

        leftSleeve.position.set(-1.28, 0.58, 0);
        leftSleeve.rotation.z = -0.42;
        rightSleeve.position.set(1.28, 0.58, 0);
        rightSleeve.rotation.z = 0.42;
        imagePlane.position.set(0, -0.05, 0.121);

        group.add(body);
        group.add(leftSleeve);
        group.add(rightSleeve);
        group.add(imagePlane);

        scene.add(group);

        const ambient = new THREE.AmbientLight(0xffffff, 0.78);
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.35);
        keyLight.position.set(2.5, 3, 4);
        fillLight.position.set(-3, 1.5, 2.5);
        scene.add(ambient);
        scene.add(keyLight);
        scene.add(fillLight);

        const grid = new THREE.GridHelper(5.4, 9, 0xcbd5e1, 0xe2e8f0);
        grid.position.y = -1.82;
        scene.add(grid);

        product3dState = {
            itemId: item.id,
            THREE: THREE,
            renderer: renderer,
            scene: scene,
            camera: camera,
            group: group,
            frame: null,
            dragging: false,
            lastX: 0,
            lastY: 0,
            sceneEl: product3dScene
        };

        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("anonymous");
        textureLoader.load(item.productImage || fallbackProductImage, function (texture) {
            if (!product3dState || !isSameItemId(product3dState.itemId, item.id)) return;

            if (THREE.sRGBEncoding) {
                texture.encoding = THREE.sRGBEncoding;
            }

            imageMaterial.map = texture;
            imageMaterial.needsUpdate = true;
        }, undefined, function () {
            imageMaterial.color.set(fabricColor);
            imageMaterial.needsUpdate = true;
        });

        bindProduct3dPointerControls();
        animateProduct3dPreview();
    }

    function bindProduct3dPointerControls() {
        if (!product3dState || !product3dState.sceneEl) return;

        const sceneEl = product3dState.sceneEl;

        sceneEl.onpointerdown = function (event) {
            if (!product3dState) return;

            product3dState.dragging = true;
            product3dState.lastX = event.clientX;
            product3dState.lastY = event.clientY;
            sceneEl.setPointerCapture(event.pointerId);
        };

        sceneEl.onpointermove = function (event) {
            if (!product3dState || !product3dState.dragging) return;

            const deltaX = event.clientX - product3dState.lastX;
            const deltaY = event.clientY - product3dState.lastY;
            product3dState.group.rotation.y += deltaX * 0.012;
            product3dState.group.rotation.x += deltaY * 0.008;
            product3dState.group.rotation.x = Math.max(-0.7, Math.min(0.45, product3dState.group.rotation.x));
            product3dState.lastX = event.clientX;
            product3dState.lastY = event.clientY;
        };

        sceneEl.onpointerup = function (event) {
            if (!product3dState) return;

            product3dState.dragging = false;
            sceneEl.releasePointerCapture(event.pointerId);
        };

        sceneEl.onpointercancel = function () {
            if (product3dState) {
                product3dState.dragging = false;
            }
        };
    }

    function animateProduct3dPreview() {
        if (!product3dState) return;

        if (!product3dState.dragging) {
            product3dState.group.rotation.y += 0.007;
        }

        product3dState.renderer.render(product3dState.scene, product3dState.camera);
        product3dState.frame = window.requestAnimationFrame(animateProduct3dPreview);
    }

    function resizeProduct3dPreview() {
        if (!product3dState || !product3dScene) return;

        const size = getProduct3dSize();
        product3dState.renderer.setSize(size.width, size.height, false);
        product3dState.camera.aspect = size.width / size.height;
        product3dState.camera.updateProjectionMatrix();
    }

    function getProduct3dSize() {
        const rect = product3dScene
            ? product3dScene.getBoundingClientRect()
            : { width: 720, height: 420 };

        return {
            width: Math.max(Math.round(rect.width || 720), 320),
            height: Math.max(Math.round(rect.height || 420), 320)
        };
    }

    function showProduct3dFallback(item) {
        disposeProduct3dPreview();
        setProduct3dLoading(false);

        if (product3dCanvas) {
            product3dCanvas.classList.add("hidden");
        }

        if (product3dFallback) {
            product3dFallback.classList.remove("hidden");
        }

        populateProduct3dPreview(item);
    }

    function setProduct3dLoading(isLoading) {
        if (product3dLoading) {
            product3dLoading.classList.toggle("hidden", !isLoading);
        }

        if (product3dCanvas) {
            product3dCanvas.classList.toggle("hidden", isLoading);
        }

        if (product3dFallback && isLoading) {
            product3dFallback.classList.add("hidden");
        }
    }

    function stopProduct3dPreview() {
        disposeProduct3dPreview();

        if (product3dPreviewModal) {
            product3dPreviewModal.classList.add("hidden");
        }

        if (product3dLoading) {
            product3dLoading.classList.add("hidden");
        }
    }

    function disposeProduct3dPreview() {
        if (!product3dState) return;

        if (product3dState.frame) {
            window.cancelAnimationFrame(product3dState.frame);
        }

        if (product3dState.sceneEl) {
            product3dState.sceneEl.onpointerdown = null;
            product3dState.sceneEl.onpointermove = null;
            product3dState.sceneEl.onpointerup = null;
            product3dState.sceneEl.onpointercancel = null;
        }

        product3dState.scene.traverse(function (object) {
            if (object.geometry && typeof object.geometry.dispose === "function") {
                object.geometry.dispose();
            }

            if (object.material) {
                const materialsToDispose = Array.isArray(object.material) ? object.material : [object.material];
                materialsToDispose.forEach(function (material) {
                    if (material.map && typeof material.map.dispose === "function") {
                        material.map.dispose();
                    }

                    if (typeof material.dispose === "function") {
                        material.dispose();
                    }
                });
            }
        });

        product3dState.renderer.dispose();
        product3dState = null;
    }

    function saveProduct3dImage() {
        if (!product3dSelection.item) {
            alert("Product preview is not ready to save yet.");
            return;
        }

        const link = document.createElement("a");
        link.href = getCurrentMockupImage();
        link.download = `${getSafeFileName(product3dSelection.item.productName)}-${getSafeFileName(getCurrentMockupLabel())}-mockup.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function renderDetailSizeBreakdown(item) {
        const body = document.getElementById("detailSizeBreakdownBody");
        if (!body) return;

        if (!item.sizes.length) {
            body.innerHTML = `<tr><td colspan="3" class="empty-cell">No size data.</td></tr>`;
            return;
        }

        const rows = getSizeColorRows(item);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="3" class="empty-cell">No size/color data.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.size)}</td>
                    <td>${renderProductColorChip(item, row)}</td>
                    <td>${formatNumber(row.quantity)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderDetailMeasurements(item) {
        const body = document.getElementById("detailMeasurementBody");
        if (!body) return;

        if (!item.measurements.length) {
            body.innerHTML = `<tr><td colspan="6" class="empty-cell">No measurement data.</td></tr>`;
            return;
        }

        body.innerHTML = item.measurements.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.size)}</td>
                    <td>${escapeHtml(row.chest)}</td>
                    <td>${escapeHtml(row.shoulder)}</td>
                    <td>${escapeHtml(row.sleeve)}</td>
                    <td>${escapeHtml(row.length)}</td>
                    <td>${escapeHtml(row.unit)}</td>
                </tr>
            `;
        }).join("");
    }

    function renderDetailMaterials(item) {
        const body = document.getElementById("detailMaterialBody");
        if (!body) return;

        const rows = calculateMaterialRequirementForItems([item]);

        if (!rows.length) {
            body.innerHTML = `<tr><td colspan="5" class="empty-cell">No BOM/material data found.</td></tr>`;
            return;
        }

        body.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.materialName)}</td>
                    <td>${formatNumber(row.requiredQty)} ${escapeHtml(row.unit)}</td>
                    <td>${formatNumber(row.availableQty)} ${escapeHtml(row.unit)}</td>
                    <td>${formatNumber(row.shortageQty)} ${escapeHtml(row.unit)}</td>
                    <td>
                        <span class="${row.shortageQty > 0 ? "badge badge-danger" : "badge badge-success"}">
                            ${row.shortageQty > 0 ? "Shortage" : "Available"}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function addToPlan(id) {
        const item = catalogItems.map(normalizeCatalogItem).find(function (catalogItem) {
            return isSameItemId(catalogItem.id, id);
        });

        if (!item) return;

        if (isItemSelected(id)) {
            alert("This order item is already added to the production plan.");
            return;
        }

        selectedPlanItems.push(item);
        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function removeFromPlan(id) {
        selectedPlanItems = selectedPlanItems.filter(function (item) {
            return !isSameItemId(item.id, id);
        });

        renderBasket();
        renderCatalog();
        resetBulkMaterialTable();
    }

    function renderBasket() {
        if (!planBasketItems) return;

        if (!selectedPlanItems.length) {
            planBasketItems.innerHTML = `
                <div class="basket-empty-state">
                    No items added yet.
                </div>
            `;
        } else {
            planBasketItems.innerHTML = selectedPlanItems.map(function (item) {
                return `
                    <div class="basket-item">
                        <img src="${escapeHtml(item.productImage)}"
                             alt="${escapeHtml(item.productName)}"
                             onerror="this.src='${fallbackProductImage}'" />

                        <div>
                            <strong>${escapeHtml(item.productName)}</strong>
                            <span>${escapeHtml(item.customerName)}</span>
                            <small>${formatNumber(item.quantity)} pcs • ${formatDate(item.deliveryDate)}</small>
                        </div>

                        <button type="button"
                                class="basket-remove-btn"
                                data-id="${escapeHtml(item.id)}"
                                aria-label="Remove ${escapeHtml(item.productName)} from basket">
                            ×
                        </button>
                    </div>
                `;
            }).join("");
        }

        document.querySelectorAll(".basket-remove-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                removeFromPlan(this.getAttribute("data-id"));
            });
        });

        updateBasketSummary();
    }

    function updateBasketSummary() {
        const totalItems = selectedPlanItems.length;
        const totalQty = selectedPlanItems.reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);

        const earliestDelivery = selectedPlanItems.length
            ? selectedPlanItems.map(function (item) {
                return item.deliveryDate;
            }).sort()[0]
            : null;

        setText("selectedItemCount", totalItems);
        setText("selectedTotalQty", formatNumber(totalQty));
        setText("selectedEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");

        setText("basketTotalItems", totalItems);
        setText("basketTotalQty", formatNumber(totalQty));
        setText("basketEarliestDelivery", earliestDelivery ? formatDate(earliestDelivery) : "-");

        syncSelectedDraftJson();
        updateBasketActionState();
    }

    function syncSelectedDraftJson() {
        if (selectedDraftJson) {
            selectedDraftJson.value = JSON.stringify(selectedPlanItems);
        }
    }

    function updateBasketActionState() {
        const hasItems = selectedPlanItems.length > 0;

        if (checkBulkMaterialBtn) {
            checkBulkMaterialBtn.disabled = !hasItems;
        }

        if (clearBasketBtn) {
            clearBasketBtn.disabled = !hasItems;
        }

        if (createProductionPlanBtn) {
            createProductionPlanBtn.disabled = !hasItems;
        }
    }

    function setBasketMaterialStatus(value, state) {
        if (!basketMaterialStatus) return;

        basketMaterialStatus.textContent = value;
        basketMaterialStatus.classList.remove("material-ok-text", "material-shortage-text");

        if (state === "ok") {
            basketMaterialStatus.classList.add("material-ok-text");
        }

        if (state === "shortage") {
            basketMaterialStatus.classList.add("material-shortage-text");
        }
    }

    function checkBulkMaterials() {
        if (!selectedPlanItems.length) {
            resetBulkMaterialTable();
            alert("Please add at least one item to the production plan first.");
            return;
        }

        const rows = calculateMaterialRequirementForItems(selectedPlanItems);

        if (!rows.length) {
            if (!bulkMaterialBody) return;

            bulkMaterialBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell">
                        No BOM/material data found for selected items.
                    </td>
                </tr>
            `;

            setBasketMaterialStatus("No BOM found");
            return;
        }

        const hasShortage = rows.some(function (row) {
            return row.shortageQty > 0;
        });

        if (!bulkMaterialBody) return;

        bulkMaterialBody.innerHTML = rows.map(function (row) {
            return `
                <tr>
                    <td>${escapeHtml(row.materialCode)}</td>
                    <td>${escapeHtml(row.materialName)}</td>
                    <td>${escapeHtml(row.materialType)}</td>
                    <td>${formatNumber(row.requiredQty)}</td>
                    <td>${formatNumber(row.availableQty)}</td>
                    <td>${formatNumber(row.shortageQty)}</td>
                    <td>${escapeHtml(row.unit)}</td>
                    <td>
                        <span class="${row.shortageQty > 0 ? "badge badge-danger" : "badge badge-success"}">
                            ${row.shortageQty > 0 ? "Shortage" : "Available"}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

        setBasketMaterialStatus(hasShortage ? "Shortage" : "Available", hasShortage ? "shortage" : "ok");
    }

    function getCatalogProduct(product) {
        const productList = window.products || window.mockProducts || [];
        const candidates = [
            product.productId,
            product.productCode,
            product.id,
            product.code
        ].filter(Boolean).map(String);

        return productList.find(function (item) {
            return candidates.includes(String(item.id))
                || candidates.includes(String(item.productId))
                || candidates.includes(String(item.productCode))
                || candidates.includes(String(item.code));
        });
    }

    function calculateMaterialRequirementForItems(items) {
        const grouped = {};

        items.forEach(function (item) {
            const itemBomRows = getBomRowsForProduct(item.productId);

            itemBomRows.forEach(function (bom) {
                const material = getMaterialById(bom.materialId);
                const requiredQty = Number(item.quantity || 0) * Number(bom.qtyPerUnit || 0) * (1 + Number(bom.wastagePercent || 0) / 100);

                if (!grouped[material.id]) {
                    grouped[material.id] = {
                        materialId: material.id,
                        materialCode: material.code,
                        materialName: material.name,
                        materialType: material.type,
                        unit: material.unit,
                        requiredQty: 0,
                        availableQty: Number(material.availableQty || 0),
                        shortageQty: 0
                    };
                }

                grouped[material.id].requiredQty += requiredQty;
            });
        });

        return Object.values(grouped).map(function (row) {
            row.shortageQty = Math.max(row.requiredQty - row.availableQty, 0);
            return row;
        });
    }

    function getBomRowsForProduct(productId) {
        return bomData.map(normalizeBomRow).filter(function (row) {
            return String(row.productId) === String(productId);
        });
    }

    function normalizeBomRow(row) {
        return {
            productId: row.productId || row.ProductId || row.productCode || row.ProductCode || "",
            materialId: row.materialId || row.MaterialId || row.materialCode || row.MaterialCode || "",
            qtyPerUnit: Number(row.qtyPerUnit || row.quantityPerUnit || row.requiredQty || row.RequiredQty || 0),
            wastagePercent: Number(row.wastagePercent || row.WastagePercent || 0)
        };
    }

    function getMaterialById(materialId) {
        const material = materials.map(normalizeMaterial).find(function (row) {
            return String(row.id) === String(materialId) || String(row.code) === String(materialId);
        });

        return material || {
            id: materialId,
            code: materialId,
            name: "Unknown Material",
            type: "Material",
            unit: "pcs",
            availableQty: 0
        };
    }

    function normalizeMaterial(material) {
        return {
            id: material.id || material.materialId || material.MaterialId || material.code || material.materialCode || "",
            code: material.code || material.materialCode || material.MaterialCode || "",
            name: material.name || material.materialName || material.MaterialName || "Material",
            type: material.type || material.materialType || material.MaterialType || "Material",
            unit: material.unit || material.uom || material.Unit || "pcs",
            availableQty: Number(material.availableQty || material.currentStock || material.stock || material.AvailableQty || 0)
        };
    }

    function getItemMaterialPreview(item) {
        const rows = calculateMaterialRequirementForItems([item]);

        if (!rows.length) {
            return {
                hasShortage: false,
                label: "BOM not set"
            };
        }

        const hasShortage = rows.some(function (row) {
            return row.shortageQty > 0;
        });

        return {
            hasShortage: hasShortage,
            label: hasShortage ? "Material shortage" : "Material ready"
        };
    }

    function resetBulkMaterialTable() {
        if (!bulkMaterialBody) return;

        bulkMaterialBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cell">
                    Add items to production plan basket, then click Check Materials in Bulk.
                </td>
            </tr>
        `;

        setBasketMaterialStatus("Not checked");
    }

    function normalizeCatalogItem(item) {
        return {
            id: item.id || item.orderItemId || 0,
            orderNo: item.orderNo || "ORDER",
            customerId: item.customerId || 0,
            customerCode: item.customerCode || "",
            customerName: item.customerName || item.name || "",
            customerType: item.customerType || item.type || "",
            phone: item.phone || "",
            address: item.address || "",
            paymentTerms: item.paymentTerms || "",
            deliveryLocation: item.deliveryLocation || item.address || "",
            orderDate: item.orderDate || "",
            deliveryDate: item.deliveryDate || "",
            priority: item.priority || "Normal",
            productId: item.productId || item.productCode || "",
            productCode: item.productCode || item.productId || "",
            productName: item.productName || item.orderItem || item.itemName || "",
            category: item.category || "",
            variant: item.variant || "",
            quantity: Number(item.quantity || item.orderQty || item.qty || 0),
            productImage: item.productImage || item.orderImage || fallbackProductImage,
            customerImage: item.customerImage || "",
            materialStatus: item.materialStatus || "Unchecked",
            productionNotes: item.productionNotes || "No special notes.",
            sizes: item.sizes || [],
            measurements: item.measurements || []
        };
    }

    function getSizeColorRows(item) {
        const aggregated = {};

        function add(size, palette, qty) {
            const key = `${size}|${palette}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    size: size,
                    palette: palette,
                    quantity: 0
                };
            }
            aggregated[key].quantity += Number(qty || 0);
        }

        (item.sizes || []).forEach(function (sizeRow) {
            const size = sizeRow.size || "-";
            const colorRows = sizeRow.colors || sizeRow.colorVariants || sizeRow.variants || [];
            const itemPalette = item.variant || "-";

            if (colorRows.length) {
                colorRows.forEach(function (colorRow) {
                    const palette = colorRow.palette || colorRow.paletteName || sizeRow.palette || itemPalette;
                    add(size, palette, colorRow.quantity || colorRow.qty || 0);
                });
            } else {
                const palette = sizeRow.palette || sizeRow.paletteName || itemPalette;
                add(size, palette, sizeRow.quantity || sizeRow.qty || 0);
            }
        });

        return Object.values(aggregated);
    }

    function getColorSummary(item) {
        const colors = [];

        getSizeColorRows(item).forEach(function (row) {
            const palette = getEffectiveRowPalette(item, row);
            if (palette && palette !== "-" && !colors.includes(palette)) {
                colors.push(palette);
            }
        });

        if (!colors.length) {
            return item.variant || "-";
        }

        if (colors.length <= 3) {
            return colors.join(" / ");
        }

        return `${colors.slice(0, 3).join(" / ")} +${colors.length - 3}`;
    }

    function getUniqueColors(item) {
        const colors = [];

        getSizeColorRows(item).forEach(function (row) {
            if (row.color && row.color !== "-" && !colors.includes(row.color)) {
                colors.push(row.color);
            }
        });

        if (!colors.length && item.variant) {
            String(item.variant).split("/").forEach(function (part) {
                const color = part.trim();
                if (color && !colors.includes(color)) {
                    colors.push(color);
                }
            });
        }

        return colors;
    }

    function getPreviewColor(item) {
        const colorText = getUniqueColors(item).join(" ").toLowerCase();
        const colorMap = [
            { key: "navy", value: "#1e3a8a" },
            { key: "royal", value: "#2563eb" },
            { key: "blue", value: "#2563eb" },
            { key: "sky", value: "#38bdf8" },
            { key: "red", value: "#dc2626" },
            { key: "green", value: "#16a34a" },
            { key: "grey", value: "#64748b" },
            { key: "gray", value: "#64748b" },
            { key: "charcoal", value: "#334155" },
            { key: "black", value: "#111827" },
            { key: "white", value: "#f8fafc" },
            { key: "cream", value: "#fdecc8" },
            { key: "brown", value: "#92400e" }
        ];

        const match = colorMap.find(function (row) {
            return colorText.includes(row.key);
        });

        return match ? match.value : "#2563eb";
    }

    function getSafeFileName(value) {
        return String(value || "product")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 64) || "product";
    }

    function isItemSelected(id) {
        return selectedPlanItems.some(function (selected) {
            return isSameItemId(selected.id, id);
        });
    }

    function isSameItemId(left, right) {
        return String(left || "") === String(right || "");
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

    function getDeliveryBadgeClass(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (diffDays < 0 || diffDays <= 7) {
            return "customer-delivery-warning";
        }

        return "customer-delivery-normal";
    }

    function getDeliveryStatusText(dateValue) {
        const diffDays = getDiffDays(dateValue);

        if (!dateValue) return "No delivery date";
        if (diffDays < 0) return "Overdue";
        if (diffDays === 0) return "Due today";
        if (diffDays <= 7) return `${diffDays} days left`;

        return "On schedule";
    }

    function getDiffDays(dateValue) {
        if (!dateValue) return 9999;

        const today = new Date();
        const date = new Date(dateValue);
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
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

    function renderPalettePreviewById(id, value, options) {
        const host = document.getElementById(id);
        const picker = window.ProductionPalettePicker;
        if (!host) return;

        if (!picker) {
            host.innerHTML = "";
            host.hidden = true;
            return;
        }

        picker.applyPreview(host, value, options);
    }

    function renderPalettePreviewHtml(value, options) {
        const picker = window.ProductionPalettePicker;
        return picker ? picker.renderPreview(value, options) : "";
    }

    function renderPaletteChip(value) {
        const picker = window.ProductionPalettePicker;
        return picker
            ? picker.renderChip(value)
            : `<span class="color-variant-chip">${escapeHtml(value || "-")}</span>`;
    }

    function renderProductColorChip(item, row) {
        const picker = window.ProductionPalettePicker;
        return picker
            ? picker.renderProductColorChip(getEffectiveRowPalette(item, row), "")
            : `<span class="color-variant-chip">${escapeHtml(getEffectiveRowPalette(item, row) || "-")}</span>`;
    }

    function getEffectiveRowPalette(item, row) {
        return row?.palette || item?.variant || item?.color || "";
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
