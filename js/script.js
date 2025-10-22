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

function linkAction(e) {
    // Remove menu mobile
    if (navMenu) {
        navMenu.classList.remove('show');
    }
    
    // Let scroll spy handle the active state naturally
    // The active class will be updated by scroll spy after smooth scroll
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

    // Scroll-based navbar highlighting
    initScrollSpy();
});


// Load GitHub projects after DOM and functions are ready
document.addEventListener('DOMContentLoaded', function() {
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

// Scroll spy functionality for navbar highlighting
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    
    // Function to update active nav link
    function updateActiveNavLink() {
        let scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100; // 100px offset for better UX
            const sectionId = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section's nav link
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavLink();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set active state on page load
    updateActiveNavLink();
}