(function () {
    "use strict";

    window.App = window.App || {};

    App.qs = function (selector, parent) {
        return (parent || document).querySelector(selector);
    };

    App.qsa = function (selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    };

    App.value = function (selector) {
        const el = App.qs(selector);
        return el ? el.value.trim() : "";
    };

    App.setText = function (selector, value) {
        const el = App.qs(selector);
        if (el) {
            el.textContent = value ?? "-";
        }
    };

    App.setValue = function (selector, value) {
        const el = App.qs(selector);
        if (el) {
            el.value = value ?? "";
        }
    };

    App.show = function (selector) {
        const el = App.qs(selector);
        if (el) {
            el.classList.remove("hidden");
        }
    };

    App.hide = function (selector) {
        const el = App.qs(selector);
        if (el) {
            el.classList.add("hidden");
        }
    };

    App.formatDate = function (value) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit"
        });
    };

    App.toInputDate = function (value) {
        if (!value) return "";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    App.number = function (value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    App.escapeHtml = function (value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };

    App.statusClass = function (status) {
        return "status-" + String(status || "")
            .toLowerCase()
            .replaceAll("/", "")
            .replaceAll(" ", "-");
    };

    App.badge = function (status) {
        const safeStatus = App.escapeHtml(status || "Unknown");
        return `<span class="status-badge ${App.statusClass(status)}">${safeStatus}</span>`;
    };

    App.getData = function (...names) {
        for (const name of names) {
            if (Array.isArray(window[name])) return window[name];
            if (window[name] && Array.isArray(window[name].items)) return window[name].items;
        }

        return [];
    };

    App.findById = function (items, id) {
        return items.find(function (item) {
            return String(item.id) === String(id)
                || String(item.customerId) === String(id)
                || String(item.outletId) === String(id)
                || String(item.productId) === String(id)
                || String(item.materialId) === String(id)
                || String(item.warehouseId) === String(id)
                || String(item.stageId) === String(id)
                || String(item.planId) === String(id)
                || String(item.planNo) === String(id);
        });
    };

    App.dateDiffDays = function (start, end) {
        if (!start || !end) return 0;

        const startDate = new Date(start);
        const endDate = new Date(end);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return 0;
        }

        const diff = endDate.getTime() - startDate.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    App.openModal = function (id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        }
    };

    App.closeModal = function (id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add("hidden");
            document.body.style.overflow = "";
        }
    };

    App.initModalClose = function () {
        App.qsa("[data-close-modal]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                App.closeModal(btn.getAttribute("data-close-modal"));
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                App.qsa(".pp-modal").forEach(function (modal) {
                    modal.classList.add("hidden");
                });
                document.body.style.overflow = "";
            }
        });
    };

    App.toast = function (message, type) {
        let toast = document.getElementById("appToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "appToast";
            toast.style.position = "fixed";
            toast.style.right = "22px";
            toast.style.bottom = "22px";
            toast.style.zIndex = "2000";
            toast.style.maxWidth = "360px";
            toast.style.padding = "14px 16px";
            toast.style.borderRadius = "12px";
            toast.style.fontWeight = "700";
            toast.style.boxShadow = "0 12px 28px rgba(15,23,42,.16)";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.background = type === "danger" ? "#fee2e2" : type === "warning" ? "#fef3c7" : "#dcfce7";
        toast.style.color = type === "danger" ? "#dc2626" : type === "warning" ? "#92400e" : "#16a34a";
        toast.style.border = "1px solid " + (type === "danger" ? "#fecaca" : type === "warning" ? "#fde68a" : "#bbf7d0");

        toast.classList.remove("hidden");

        window.clearTimeout(App.toastTimer);
        App.toastTimer = window.setTimeout(function () {
            toast.classList.add("hidden");
        }, 2600);
    };

    document.addEventListener("DOMContentLoaded", function () {
        App.initModalClose();
    });
})();