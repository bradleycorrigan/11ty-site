function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.querySelector('.sidebar-toggle');
    const content = document.querySelector('.content');

    // Toggle the collapsed class
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('collapsed');

    // Adjust the button's position dynamically
    if (sidebar.classList.contains('collapsed')) {
        toggleButton.style.left = '10px'; // Position near the edge of the page
    } else {
        toggleButton.style.left = `${sidebar.offsetWidth + 10}px`; // 10px to the right of the sidebar
    }
}