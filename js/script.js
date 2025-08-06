const navMenu = document.getElementById('nav-menu'),
    toggleMenu = document.getElementById('nav-toggle'),
    closeMenu = document.getElementById('nav-close')

toggleMenu.addEventListener('click', () => {
    navMenu.classList.toggle('show')
})

closeMenu.addEventListener('click', () => {
    navMenu.classList.remove('show')
})

const navLink = document.querySelectorAll('.nav__link')

function linkAction() {
    // Active link
    navLink.forEach(n => n.classList.remove('active'))
    this.classList.add('active')

    // Remove menu mobile
    if (navMenu) {
        navMenu.classList.remove('show');
    }
}

navLink.forEach(n => n.addEventListener('click', linkAction))

// Add to your existing initialization
document.addEventListener('DOMContentLoaded', function() {
    // Existing navbar initialization...
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navClose = document.getElementById('nav-close');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show');
        });
    }

    // Load publications with correct ORCID ID
    if (typeof printList === 'function') {
        printList('0000-0002-1517-3815', 'publications-content', true, true);
    } else {
        console.error('printList function not found');
    }
    
    // Load GitHub projects with error handling
    if (typeof printGitHubProjects === 'function') {
        printGitHubProjects('dcupolillo', 'github-projects', 6);
    } else {
        console.error('printGitHubProjects function not found - check if getGitHubRepos.js is loading');
        
        // Fallback: show error in projects container
        const projectsContainer = document.getElementById('github-projects');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<div class="error">GitHub integration not available</div>';
        }
    }
});