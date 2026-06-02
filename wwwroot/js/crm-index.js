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
    const fromDateInput = document.getElementById("fromDateFilter");
    const toDateInput = document.getElementById("toDateFilter");
    const resetBtn = document.getElementById("resetFiltersBtn");

    const summaryTotal = document.getElementById("totalCustomers");
    const summaryActive = document.getElementById("activeCustomers");

    // 3. Helper: Convert DD-MM-YYYY to YYYYMMDD for numerical comparison
    function parseDateToNumber(dateStr) {
        if (!dateStr || dateStr === "-") return 0;
        const parts = dateStr.split("-");
        if (parts.length !== 3) return 0;
        // parts[0] = DD, parts[1] = MM, parts[2] = YYYY
        return parseInt(parts[2] + parts[1] + parts[0], 10);
    }

    // 4. Render Table
    function renderTable(data) {
        tableBody.innerHTML = ""; // Clear current table

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-cell text-center" style="padding: 30px; color: var(--muted);">
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
                <td>${customer.lastOrderDate}</td>
                <td><span class="${statusClass}">${customer.status}</span></td>
                <td class="text-right">
                    <div class="btn-group">
                        <a href="/CRM/Details/${customer.id}" class="btn btn-sm btn-light" title="View Profile">👁️</a>
                        <a href="/CRM/Edit/${customer.id}" class="btn btn-sm btn-light" title="Edit Info">✏️</a>
                        <a href="/CRM/CreateOrder?customerId=${customer.id}" class="btn btn-sm btn-primary" title="Take Order">+ Order</a>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Update Summary Cards
        summaryTotal.innerText = data.length;
        summaryActive.innerText = data.filter(c => c.status === "Active").length;
    }

    // 5. Filter Logic
    function applyFilters() {
        const typeVal = typeFilter.value;
        const statusVal = statusFilter.value;
        const searchVal = customerSearch.value.toLowerCase();
        const locationVal = locationSearch.value.toLowerCase();

        const fromDateNum = parseDateToNumber(fromDateInput.value);
        const toDateNum = parseDateToNumber(toDateInput.value);

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

            // Date Range filter based on Registration Date (regDate)
            const customerRegDateNum = parseDateToNumber(customer.regDate);
            if (fromDateNum > 0 && customerRegDateNum < fromDateNum) return false;
            if (toDateNum > 0 && customerRegDateNum > toDateNum) return false;

            return true;
        });

        renderTable(filteredData);
    }

    // 6. Event Listeners for standard inputs
    typeFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    customerSearch.addEventListener("input", applyFilters);
    locationSearch.addEventListener("input", applyFilters);

    resetBtn.addEventListener("click", () => {
        typeFilter.value = "";
        statusFilter.value = "";
        customerSearch.value = "";
        locationSearch.value = "";
        fromDateInput.value = "";
        toDateInput.value = "";
        applyFilters();
    });

    // 7. Initial Render
    renderTable(mockCustomers);

    // 8. Nepali Datepicker Integration
    // Override your existing datepicker init to trigger filtering when dates change
    var datePickerOptions = {
        miniEnglishDates: true,
        dateFormat: "DD-MM-YYYY",
        onChange: function() {
            // The nepali datepicker fires this when a date is selected from the calendar
            applyFilters();
        }
    };

    if (fromDateInput) fromDateInput.nepaliDatePicker(datePickerOptions);
    if (toDateInput) toDateInput.nepaliDatePicker(datePickerOptions);
});
