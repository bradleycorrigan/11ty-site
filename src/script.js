// Toggle the sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const content = document.querySelector('.content');

    sidebar.classList.toggle('collapsed');
    content.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
        toggleButton.style.left = '10px';
    } else {
        toggleButton.style.left = `${sidebar.offsetWidth + 10}px`;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.contains('dark-theme');

    // Toggle theme class
    body.classList.toggle('dark-theme', !isDarkMode);
    body.classList.toggle('light-theme', isDarkMode);

    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
}

// Set theme based on system settings or saved preference
function setInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.body.classList.add(savedTheme === 'dark' ? 'dark-theme' : 'light-theme');
    } else {
        document.body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', setInitialTheme);