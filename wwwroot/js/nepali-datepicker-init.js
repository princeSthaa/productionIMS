document.addEventListener("DOMContentLoaded", function() {
    // 1. Find all input fields that need the datepicker
    const nepaliDateInputs = document.querySelectorAll('.nepali-date');

    // If there are no such inputs on this page, do nothing!
    if (nepaliDateInputs.length === 0) return;

    // URLs for the Nepali Datepicker dependencies
    const cssUrl = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css";
    const jsUrl = "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js";

    // 2. Dynamically load the CSS (if not already loaded)
    if (!document.querySelector(`link[href="${cssUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = cssUrl;
        document.head.appendChild(link);
    }

    // 3. Dynamically load the JS (if not already loaded)
    if (!document.querySelector(`script[src="${jsUrl}"]`)) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = jsUrl;

        // 4. Wait for the script to finish downloading before initializing
        script.onload = function() {
            initializeDatePickers(nepaliDateInputs);
        };

        document.body.appendChild(script);
    } else {
        // If the script tag is already there, just initialize
        // Small delay ensures the library has completely mounted
        setTimeout(() => initializeDatePickers(nepaliDateInputs), 100);
    }
});

// The initialization function
function initializeDatePickers(inputs) {
    const datePickerOptions = {
        miniEnglishDates: true,
        dateFormat: "DD-MM-YYYY",
        // Force the input to broadcast a standard 'change' event when a date is selected
        onChange: function(e) {
            if (e && e.object) {
                const changeEvent = new Event('change', { bubbles: true });
                e.object.dispatchEvent(changeEvent);
            }
        }
    };

    inputs.forEach(function(input) {
        // The library requires an ID to work, so generate a random one if missing
        if (!input.id) {
            input.id = 'ndp-' + Math.random().toString(36).substr(2, 9);
        }
        input.nepaliDatePicker(datePickerOptions);
    });
}
