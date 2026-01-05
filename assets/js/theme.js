document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check local storage or system preference
    const currentTheme = localStorage.getItem('theme');
    const htmlElement = document.documentElement;

    // Apply initial theme
    if (currentTheme == 'dark') {
        htmlElement.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    } else if (currentTheme == 'light') {
        htmlElement.setAttribute('data-theme', 'light');
        updateIcon('light');
    } else if (prefersDarkScheme.matches) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateIcon('dark');
    }

    themeToggle.addEventListener('click', () => {
        let theme = htmlElement.getAttribute('data-theme');

        if (theme === 'dark') {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateIcon('light');
        } else {
            htmlElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateIcon('dark');
        }
    });

    function updateIcon(theme) {
        const iconInfo = theme === 'dark' ? '☀️' : '🌙';
        if (themeToggle) themeToggle.textContent = iconInfo;
    }
});
