// scripts.js
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
            content.setAttribute('aria-hidden', 'true');
        });

        // Add active class to the clicked tab
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Show the content corresponding to the clicked tab
        const contentId = tab.getAttribute('aria-controls');
        document.getElementById(contentId).classList.remove('hidden');
        document.getElementById(contentId).setAttribute('aria-hidden', 'false');
    });
});
