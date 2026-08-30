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
})();