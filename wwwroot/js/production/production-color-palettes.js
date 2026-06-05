(function (window, document) {
    "use strict";

    const palettes = [
        {
            id: "FC01",
            name: "Elegant and Versatile Fabric Brand Palette",
            colors: ["#C9B2BB", "#6F4C4B", "#F2C94C", "#D9E4F5", "#4B3A2A"]
        },
        {
            id: "FC02",
            name: "Vibrant Summer Collection",
            colors: ["#FF5733", "#FFBD33", "#DBFF33", "#75FF33", "#33FF57"]
        },
        {
            id: "FC03",
            name: "Monochrome Essentials",
            colors: ["#FFFFFF", "#CCCCCC", "#999999", "#666666", "#333333"]
        },
        {
            id: "FC04",
            name: "Earthy Tones",
            colors: ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#F4A460"]
        }
    ];

    let modal;
    let activeSelectCallback = null;

    const api = {
        getPalettes: function () {
            return palettes.slice();
        },
        findPalette: findPalette,
        getColors: getColors,
        renderPreview: renderPreview,
        renderChip: renderChip,
        renderProductColorChip: renderProductColorChip,
        applyPreview: applyPreview,
        setFieldValue: setFieldValue,
        addSelectOption: addSelectOption,
        open: openPicker,
        close: closePicker
    };

    window.ProductionPalettePicker = api;

    function openPicker(options) {
        const config = options || {};
        activeSelectCallback = typeof config.onSelect === "function" ? config.onSelect : null;

        ensureModal();
        renderPaletteCards(config.value || config.initialValue || "");
        modal.hidden = false;
        modal.classList.add("open");
    }

    function closePicker() {
        if (!modal) return;

        modal.classList.remove("open");
        modal.hidden = true;
        activeSelectCallback = null;
    }

    function ensureModal() {
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = "productionPalettePickerModal";
        modal.className = "production-palette-modal";
        modal.hidden = true;
        modal.innerHTML = `
            <div class="production-palette-backdrop" data-production-palette-close></div>
            <section class="production-palette-panel" role="dialog" aria-modal="true" aria-labelledby="productionPalettePickerTitle">
                <div class="production-palette-header">
                    <div>
                        <h2 id="productionPalettePickerTitle">Choose Fabric Palette</h2>
                        <p>Select a fabric color palette for this production product.</p>
                    </div>
                    <button type="button" class="production-palette-close" data-production-palette-close aria-label="Close palette picker">
                        &times;
                    </button>
                </div>
                <div class="production-palette-grid" id="productionPaletteGrid"></div>
            </section>
        `;

        modal.addEventListener("click", function (event) {
            const closeButton = event.target.closest("[data-production-palette-close]");
            if (closeButton) {
                closePicker();
                return;
            }

            const paletteButton = event.target.closest("[data-production-palette-id]");
            if (!paletteButton) return;

            const palette = findPalette(paletteButton.getAttribute("data-production-palette-id"));
            if (palette && activeSelectCallback) {
                activeSelectCallback(palette);
            }

            closePicker();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && modal && !modal.hidden) {
                closePicker();
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    function renderPaletteCards(currentValue) {
        const grid = modal.querySelector("#productionPaletteGrid");
        if (!grid) return;

        const selected = findPalette(currentValue);

        grid.innerHTML = palettes.map(function (palette) {
            const activeClass = selected && selected.id === palette.id ? " selected" : "";

            return `
                <button type="button"
                        class="production-palette-card${activeClass}"
                        data-production-palette-id="${escapeHtml(palette.id)}">
                    <div class="production-palette-colors">
                        ${palette.colors.map(function (hex) {
                            return `
                                <span class="production-palette-color"
                                      style="background-color: ${escapeHtml(hex)}"
                                      title="${escapeHtml(hex)}">
                                    <span>${escapeHtml(hex)}</span>
                                </span>
                            `;
                        }).join("")}
                    </div>
                    <strong>${escapeHtml(palette.name)}</strong>
                    <small>${escapeHtml(palette.id)} - ${palette.colors.length} colors</small>
                </button>
            `;
        }).join("");
    }

    function findPalette(value) {
        const normalized = normalize(value);
        if (!normalized) return null;

        return palettes.find(function (palette) {
            const paletteName = normalize(palette.name);
            const paletteId = normalize(palette.id);
            return normalized === paletteName
                || normalized === paletteId
                || normalized.includes(paletteName)
                || normalized.includes(paletteId);
        }) || null;
    }

    function getColors(value) {
        const palette = findPalette(value);
        if (palette) return palette.colors.slice();

        const matches = String(value || "").match(/#[0-9a-f]{6}\b/gi);
        return matches ? matches.map(function (hex) { return hex.toUpperCase(); }) : [];
    }

    function renderPreview(value, options) {
        const colors = getColors(value);
        if (!colors.length) return "";

        const config = options || {};
        const className = config.compact
            ? "production-palette-preview compact"
            : "production-palette-preview";
        const tagName = config.inline ? "span" : "div";

        return `
            <${tagName} class="${className}" aria-label="Selected palette colors">
                ${colors.map(function (hex) {
                    return `
                        <span class="production-palette-swatch"
                              style="background-color: ${escapeHtml(hex)}"
                              title="${escapeHtml(hex)}"></span>
                        `;
                }).join("")}
            </${tagName}>
        `;
    }

    function renderChip(value) {
        return `
            <span class="variant-chip production-palette-chip">
                <span>${escapeHtml(value || "-")}</span>
                ${renderPreview(value, { compact: true, inline: true })}
            </span>
        `;
    }

    function renderProductColorChip(paletteValue, colorValue) {
        const palette = findPalette(paletteValue);
        if (palette) {
            return `
                <span class="variant-chip production-palette-chip production-palette-chip-with-source">
                    <span>${escapeHtml(palette.name)}</span>
                    ${renderPreview(palette.name, { compact: true, inline: true })}
                </span>
            `;
        }

        const variantValue = String(paletteValue || "").trim();
        if (variantValue && variantValue !== "-") {
            return renderChip(variantValue);
        }

        return renderChip("-");
    }

    function applyPreview(host, value, options) {
        if (!host) return;
        host.innerHTML = renderPreview(value, options);
        host.hidden = !host.innerHTML;
        host.classList.toggle("hidden", !host.innerHTML);
    }

    function setFieldValue(field, value) {
        if (!field) return;

        field.value = value || "";
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function addSelectOption(select, value) {
        if (!select || !value) return;

        const exists = Array.from(select.options || []).some(function (option) {
            return String(option.value) === String(value);
        });

        if (!exists) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
})(window, document);
