document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the elements needed for the mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // FIX: Check if the mobile menu element was found before proceeding
    if (!mobileMenu || !mobileMenuButton) {
        console.error("Error: One or both of the required elements (mobile-menu-button or mobile-menu) were not found.");
        return;
    }
    
    // Get all anchor links inside the mobile menu
    const navLinks = mobileMenu.querySelectorAll('a');

    // Function to toggle the mobile menu state
    function toggleMenu() {
        // Toggle the 'aria-expanded' attribute for accessibility
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
        mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        
        // This is the key line: it adds or removes the 'hidden' class from Tailwind
        mobileMenu.classList.toggle('hidden');
    }

    // Event listener for the menu button (the hamburger icon)
    mobileMenuButton.addEventListener('click', toggleMenu);

    // Close the mobile menu when any link is clicked (improves UX on mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Check if the menu is currently open before closing it
            if (!mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });
    });

    // ---------- Theme toggle (dark / light) ----------
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    // Apply saved theme or system preference
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light');
            iconSun.classList.remove('hidden');
            iconMoon.classList.add('hidden');
        } else {
            root.classList.remove('light');
            iconSun.classList.add('hidden');
            iconMoon.classList.remove('hidden');
        }
    }

    // Initialize theme: check localStorage, then prefers-color-scheme, default to dark
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
    }

    // Toggle handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.classList.contains('light');
            const newTheme = isLight ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Ticket form handler - constructs a mailto: link and opens the user's email client
    // Exposed on window so the inline onsubmit in Contact.html can call it
    window.handleTicketSubmit = function (event) {
        event.preventDefault();
        const form = document.getElementById('ticket-form');
        const name = document.getElementById('ticket-name')?.value.trim();
        const phone = document.getElementById('ticket-phone')?.value.trim();
        const email = document.getElementById('ticket-email')?.value.trim();
        const description = document.getElementById('ticket-description')?.value.trim();
        // New fields
        const genderEls = document.getElementsByName('gender');
        const deadline = document.getElementById('ticket-deadline')?.value;
        let gender = '';
        for (const g of genderEls) {
            if (g.checked) { gender = g.value; break; }
        }
        const feedback = document.getElementById('ticket-feedback');

        // Basic validations
        if (!name || !phone || !email || !description) {
            if (feedback) feedback.textContent = 'Please provide your name, phone, email, and a short description.';
            return false;
        }

        // gender is required by form (radio required on first), but double-check
        if (!gender) {
            if (feedback) feedback.textContent = 'Please select your gender.';
            return false;
        }

        // Simple email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            if (feedback) feedback.textContent = 'Please provide a valid email address.';
            return false;
        }

        const to = 'chienproccc1@gmail.com';
        const subject = encodeURIComponent('New ticket from website');
        const bodyLines = [
            `Name: ${name}`,
            `Phone: ${phone}`,
            `Email: ${email}`,
            `Gender: ${gender}`,
            `Preferred deadline: ${deadline || 'N/A'}`,
            '',
            'Description:',
            `${description}`,
            '',
            `Submitted from: ${window.location.href}`
        ];
        const body = encodeURIComponent(bodyLines.join('\n'));

        // mailto must not contain newlines raw; use encoded body
        const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

        // Open mailto - using location.href may be blocked by some browsers, but works widely
        window.location.href = mailto;

        if (feedback) feedback.textContent = 'Opening your email client...';
        return false; // prevent default form submission
    };
});
