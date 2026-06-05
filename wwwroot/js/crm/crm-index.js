document.addEventListener("DOMContentLoaded", function() {
    // 1. Mock Data (Replace this with a fetch API call to your backend later)
    const mockCustomers = [
        { id: "CUS-1001", name: "Ram Bahadur Thapa", phone: "9841000000", email: "ram@example.com", location: "Kathmandu, Bagmati", type: "Retail", orders: 12, lastOrderDate: "15-02-2083", regDate: "10-01-2083", status: "Active" },
        { id: "CUS-1002", name: "Sita Sharma", phone: "9851000000", email: "sita@example.com", location: "Pokhara, Gandaki", type: "Wholesale", orders: 45, lastOrderDate: "10-01-2083", regDate: "05-11-2082", status: "Active" },
        { id: "CUS-1003", name: "Hari Khadka", phone: "9801000000", email: "hari@example.com", location: "Biratnagar, Koshi", type: "Distributor", orders: 120, lastOrderDate: "05-12-2082", regDate: "15-05-2081", status: "Inactive" },
        { id: "CUS-1004", name: "Gita Shrestha", phone: "9861000000", email: "gita@example.com", location: "Lalitpur, Bagmati", type: "Retail", orders: 2, lastOrderDate: "20-02-2083", regDate: "18-02-2083", status: "Active" },
        { id: "CUS-1005", name: "Bishnu Rai", phone: "9811000000", email: "bishnu@example.com", location: "Dharan, Koshi", type: "Retail", orders: 0, lastOrderDate: "-", regDate: "25-02-2083", status: "Blacklisted" }
    ];

    // 2. DOM Elements
    const tableBody = document.getElementById("customersTableBody");
    const typeFilter = document.getElementById("customerTypeFilter");
    const statusFilter = document.getElementById("statusFilter");
    const customerSearch = document.getElementById("customerSearch");
    const locationSearch = document.getElementById("locationSearch");
    const resetBtn = document.getElementById("resetFiltersBtn");

    const summaryTotal = document.getElementById("totalCustomers");
    const summaryActive = document.getElementById("activeCustomers");

    // 4. Render Table
    function renderTable(data) {
        // Update summary metrics if elements are present on this page
        if (summaryTotal) summaryTotal.innerText = data.length;
        if (summaryActive) summaryActive.innerText = data.filter(c => c.status === "Active").length;

        // If table doesn't exist on this page, do not proceed with table rendering
        if (!tableBody) return;

        tableBody.innerHTML = ""; // Clear current table

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-cell text-center" style="padding: 30px; color: var(--muted);">
                        No customers found matching the selected filters.
                    </td>
                </tr>`;
            return;
        }

        data.forEach(customer => {
            // Determine status color class
            let statusClass = "text-muted";
            if (customer.status === "Active") statusClass = "material-ok"; // Uses your existing green class
            if (customer.status === "Blacklisted") statusClass = "material-shortage"; // Uses your existing red class

            const row = document.createElement("tr");
            row.style.cursor = "pointer";
            // Allow clicking anywhere on the row (except on the action buttons themselves) to view the profile
            row.onclick = (e) => {
                if (!e.target.closest('.text-right')) {
                    window.location.href = `/CRM/Details/${customer.id}`;
                }
            };
            row.innerHTML = `
                <td><strong>${customer.id}</strong></td>
                <td>
                    ${customer.name}<br>
                    <small class="text-muted">Reg: ${customer.regDate}</small>
                </td>
                <td>
                    <div>${customer.phone}</div>
                    <small class="text-muted">${customer.email}</small>
                </td>
                <td>${customer.location}</td>
                <td><span class="badge badge-info">${customer.type}</span></td>
                <td>${customer.orders}</td>
                <td><span class="${statusClass}">${customer.status}</span></td>
                <td class="text-right">
                    <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                        <a href="/CRM/Edit/${customer.id}" class="btn btn-sm btn-light" title="Edit Info">Edit</a>
                        <a href="/CRM/Order/CreateOrder?customerId=${customer.id}" class="btn btn-sm btn-primary" title="Take Order">+ Order</a>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 5. Filter Logic
    function applyFilters() {
        const typeVal = typeFilter ? typeFilter.value : "";
        const statusVal = statusFilter ? statusFilter.value : "";
        const searchVal = customerSearch ? customerSearch.value.toLowerCase() : "";
        const locationVal = locationSearch ? locationSearch.value.toLowerCase() : "";

        const filteredData = mockCustomers.filter(customer => {
            // Dropdown filters
            if (typeVal && customer.type !== typeVal) return false;
            if (statusVal && customer.status !== statusVal) return false;

            // Text search filters (Name, Email, or Phone)
            if (searchVal && !(
                customer.name.toLowerCase().includes(searchVal) ||
                customer.email.toLowerCase().includes(searchVal) ||
                customer.phone.includes(searchVal)
            )) {
                return false;
            }

            // Location search filter
            if (locationVal && !customer.location.toLowerCase().includes(locationVal)) return false;

            return true;
        });

        renderTable(filteredData);
    }

    // 6. Event Listeners for standard inputs
    if (typeFilter) typeFilter.addEventListener("change", applyFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);
    if (customerSearch) customerSearch.addEventListener("input", applyFilters);
    if (locationSearch) locationSearch.addEventListener("input", applyFilters);

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (typeFilter) typeFilter.value = "";
            if (statusFilter) statusFilter.value = "";
            if (customerSearch) customerSearch.value = "";
            if (locationSearch) locationSearch.value = "";
            applyFilters();
        });
    }

    // 7. Initial Render
    renderTable(mockCustomers);
});