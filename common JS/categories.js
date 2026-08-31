(function () {
    const toggle = document.querySelector('.categories-toggle');
    const dropdown = document.querySelector('.category-dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
        e.preventDefault();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', function (e) {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    dropdown.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            dropdown.classList.remove('show');
        });
    });

    // ===== Mobile hamburger nav toggle =====
    const navToggle = document.getElementById('navToggle');
    const bottomNav = document.querySelector('.bottom-nav');

    if (navToggle && bottomNav) {
        navToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            bottomNav.classList.toggle('show');
            navToggle.classList.toggle('active');
        });

        // Close menu when a nav link is clicked (but keep "Categories" open so its dropdown works)
        bottomNav.querySelectorAll('ul a:not(.categories-toggle)').forEach(function (link) {
            link.addEventListener('click', function () {
                bottomNav.classList.remove('show');
                navToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !bottomNav.contains(e.target)) {
                bottomNav.classList.remove('show');
                navToggle.classList.remove('active');
            }
        });

        // Close on resize back to desktop
        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) {
                bottomNav.classList.remove('show');
                navToggle.classList.remove('active');
            }
        });
    }
})();