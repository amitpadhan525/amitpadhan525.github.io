document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });


    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Optional: Typing effect for Hero Title if needed later
    // const heroTitle = document.querySelector('.hero-title span');
    // if(heroTitle) { ... }

    // Modal Logic
    const modal = document.getElementById('project-modal');
    if (modal) {
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body-content');
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal; // The modal div itself acts as overlay with the current CSS structure

        // Close functions
        const closeModal = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
        });

        // Open functions
        document.querySelectorAll('.project-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                // Ignore clicks on buttons/links inside the card
                if (e.target.closest('a') || e.target.closest('button')) return;

                const hiddenDetails = card.querySelector('.card-details');
                const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Project Details';

                if (hiddenDetails) {
                    modalTitle.textContent = title;
                    modalBody.innerHTML = hiddenDetails.innerHTML;
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent background scrolling
                }
            });
        });
    }

    // Spotlight Effect (Mouse Tracking)
    const spotlightCards = document.querySelectorAll('.glass-card, .project-card');

    spotlightCards.forEach(card => {
        card.classList.add('spotlight-card'); // Ensure CSS class is present

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
