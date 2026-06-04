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
    // 1. Calculate the EARLIEST ALLOWED DATE (Today + 8 days)
    // If today is the 4th, this sets the minimum limit to the 12th.
    const earliestAllowedAD = new Date();
    earliestAllowedAD.setDate(earliestAllowedAD.getDate() + 8);

    const earliestAllowedBS = NepaliFunctions.AD2BS({
        year: earliestAllowedAD.getFullYear(),
        month: earliestAllowedAD.getMonth() + 1,
        day: earliestAllowedAD.getDate()
    });

    // Create our strict 8-digit number (e.g., 20830212)
    const minInt = parseInt(`${earliestAllowedBS.year}${String(earliestAllowedBS.month).padStart(2, '0')}${String(earliestAllowedBS.day).padStart(2, '0')}`);

    const datePickerOptions = {
        miniEnglishDates: true,
        dateFormat: "DD-MM-YYYY"
    };

    inputs.forEach(function(input) {
        if (!input.id) input.id = 'ndp-' + Math.random().toString(36).substr(2, 9);

        input.nepaliDatePicker(datePickerOptions);

        // 2. The Native Trap Function
        function enforceDateLimits() {
            if (!input.value) return;

            const parts = input.value.split('-');

            if (parts.length === 3) {
                let yyyy, mm, dd;

                // SMART DETECT + FORCE PADDING
                if (parts[0].length === 4) {
                    // Format: YYYY-MM-DD
                    yyyy = parts[0];
                    mm = String(parts[1]).padStart(2, '0');
                    dd = String(parts[2]).padStart(2, '0');
                } else {
                    // Format: DD-MM-YYYY
                    yyyy = parts[2];
                    mm = String(parts[1]).padStart(2, '0');
                    dd = String(parts[0]).padStart(2, '0');
                }

                const selectedInt = parseInt(`${yyyy}${mm}${dd}`);

                // THE NEW TRAP: Block anything BEFORE the minimum allowed date
                if (selectedInt < minInt) {
                    input.value = "";
                    alert("You must select a date that is at least a week away.");
                }
            }
        }

        // 3. Attach standard native event listeners
        input.addEventListener('change', enforceDateLimits);
        input.addEventListener('blur', enforceDateLimits);
        input.addEventListener('dateSelect', enforceDateLimits);

        // 4. The rapid-fire safety net
        input.addEventListener('focus', function() {
            const watcher = setInterval(function() {
                enforceDateLimits();
                if (document.activeElement !== input) {
                    clearInterval(watcher);
                }
            }, 100);
        });
    });
}
