document.addEventListener('DOMContentLoaded', () => {
    // ====== PAGE TRANSITION ======
    document.body.classList.add('page-transition');


    // ====== SCROLL PROGRESS BAR ======
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        document.body.prepend(progressBar);
    }

    // ====== SCROLL TO TOP BUTTON ======
    let scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top-btn';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollTopBtn.innerHTML = '↑';
        document.body.appendChild(scrollTopBtn);
    }

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ====== MOBILE MENU ======
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const siteNav = document.querySelector('.site-nav');

    if (mobileBtn && siteNav) {
        mobileBtn.addEventListener('click', () => {
            siteNav.classList.toggle('active');
            const isActive = siteNav.classList.contains('active');
            mobileBtn.textContent = isActive ? '✕' : '☰';
            mobileBtn.setAttribute('aria-expanded', isActive);
        });

        // Close menu on link click
        siteNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('active');
                mobileBtn.textContent = '☰';
                mobileBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (siteNav.classList.contains('active') &&
                !siteNav.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                siteNav.classList.remove('active');
                mobileBtn.textContent = '☰';
                mobileBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ====== HEADER SCROLL ======
    const header = document.querySelector('header');
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Progress bar
        if (progressBar && docHeight > 0) {
            const progress = (scrollY / docHeight) * 100;
            progressBar.style.width = progress + '%';
        }

        // Header shrink
        if (header) {
            header.classList.toggle('scrolled', scrollY > 50);
        }

        // Scroll-to-top button
        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', scrollY > 400);
        }

        lastScroll = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    // ====== SMOOTH ANCHOR SCROLLING ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ====== SCROLL REVEAL (Intersection Observer) ======
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ====== ANIMATED STAT COUNTERS ======
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                let current = 0;
                const increment = Math.max(1, Math.floor(target / 30));
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current + '+';
                }, 50);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number').forEach(el => statObserver.observe(el));

    // ====== PROGRESS BAR ANIMATION ======
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.learning-card').forEach(el => progressObserver.observe(el));

    // ====== TYPING EFFECT FOR HERO TAGLINE ======
    const tagline = document.querySelector('.hero-tagline');
    if (tagline && tagline.textContent.trim()) {
        const text = tagline.textContent.trim();
        tagline.textContent = '';
        tagline.style.borderRight = '2px solid var(--color-accent)';

        let i = 0;
        const speed = 35;
        function typeWriter() {
            if (i < text.length) {
                tagline.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // Blink cursor then remove
                setTimeout(() => {
                    tagline.style.borderRight = 'none';
                }, 2000);
            }
        }

        // Start with a short delay for page load
        setTimeout(typeWriter, 800);
    }

    // ====== MODAL LOGIC ======
    const modal = document.getElementById('project-modal');
    if (modal) {
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body-content');
        const closeBtn = modal.querySelector('.modal-close');

        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });

        document.querySelectorAll('.project-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const details = card.querySelector('.card-details');
                const title = card.querySelector('h3')?.textContent || 'Project Details';
                if (details && modalTitle && modalBody) {
                    modalTitle.textContent = title;
                    modalBody.innerHTML = details.innerHTML;
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }


    // ====== ACTIVE NAV HIGHLIGHTING ======
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ====== SMOOTH LINK TRANSITIONS ======
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && link.getAttribute('target') !== '_blank') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transform = 'translateY(8px)';
                document.body.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
                setTimeout(() => {
                    window.location.href = href;
                }, 250);
            });
        }
    });
});
