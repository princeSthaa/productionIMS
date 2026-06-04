document.addEventListener("DOMContentLoaded", function() {
    const nepaliDateInputs = document.querySelectorAll('.nepali-date');

    if (nepaliDateInputs.length === 0) return;

    const cssUrl = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css";
    const jsUrl = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js";

    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    if (!document.querySelector(`script[src="${jsUrl}"]`)) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = jsUrl;
        script.onload = function() {
            initializeDatePickers(nepaliDateInputs);
        };
        document.body.appendChild(script);
    } else {
        setTimeout(() => initializeDatePickers(nepaliDateInputs), 100);
    }
});

function initializeDatePickers(inputs) {
    // 1. Check if we are currently on the Create Order page
    // Using .toLowerCase() makes it perfectly safe against capitalization typos in the URL
    const isCreateOrderPage = window.location.pathname.toLowerCase().includes('/crm/order/createorder');

    // 2. Define standard options that apply to EVERY page
    const datePickerOptions = {
        miniEnglishDates: true,
        dateFormat: "DD-MM-YYYY"
    };

    // 3. (Optional) Only calculate the strict dates if we actually need them
    let minInt = null;
    if (isCreateOrderPage) {
        const earliestAllowedAD = new Date();
        earliestAllowedAD.setDate(earliestAllowedAD.getDate() + 8);

        const earliestAllowedBS = NepaliFunctions.AD2BS({
            year: earliestAllowedAD.getFullYear(),
            month: earliestAllowedAD.getMonth() + 1,
            day: earliestAllowedAD.getDate()
        });

        minInt = parseInt(`${earliestAllowedBS.year}${String(earliestAllowedBS.month).padStart(2, '0')}${String(earliestAllowedBS.day).padStart(2, '0')}`);
    }

    // 4. Initialize the inputs
    inputs.forEach(function(input) {
        if (!input.id) input.id = 'ndp-' + Math.random().toString(36).substr(2, 9);

        // Turn on the calendar UI for EVERY page
        input.nepaliDatePicker(datePickerOptions);

        // 5. IF WE ARE ON THE CREATE ORDER PAGE -> ATTACH THE TRAP
        if (isCreateOrderPage) {
            function enforceDateLimits() {
                if (!input.value) return;

                const parts = input.value.split('-');

                if (parts.length === 3) {
                    let yyyy, mm, dd;

                    if (parts[0].length === 4) {
                        yyyy = parts[0];
                        mm = String(parts[1]).padStart(2, '0');
                        dd = String(parts[2]).padStart(2, '0');
                    } else {
                        yyyy = parts[2];
                        mm = String(parts[1]).padStart(2, '0');
                        dd = String(parts[0]).padStart(2, '0');
                    }

                    const selectedInt = parseInt(`${yyyy}${mm}${dd}`);

                    if (selectedInt < minInt) {
                        input.value = "";
                        alert("You must select a date that is at least a week away.");
                    }
                }
            }

            // Attach the security watchers ONLY for this specific page
            input.addEventListener('change', enforceDateLimits);
            input.addEventListener('blur', enforceDateLimits);
            input.addEventListener('dateSelect', enforceDateLimits);

            input.addEventListener('focus', function() {
                const watcher = setInterval(function() {
                    enforceDateLimits();
                    if (document.activeElement !== input) {
                        clearInterval(watcher);
                    }
                }, 100);
            });
        }
        // IF WE ARE ON ANY OTHER PAGE -> DO NOTHING ELSE!
        // It acts like a completely normal, unrestricted datepicker.
    });
}
