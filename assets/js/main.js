document.addEventListener('DOMContentLoaded', () => {
    // ====== LENIS SMOOTH SCROLLING ======
    let lenisInstance = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        lenisInstance = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.0,
            smoothTouch: false,
            touchMultiplier: 1.5,
            infinite: false
        });

        function raf(time) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // ====== PAGE TRANSITION ======
    document.body.classList.add('page-transition');

    // ====== FOOTER YEAR ======
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();

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
        if (lenisInstance) {
            lenisInstance.scrollTo(0, { duration: 1.2 });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ====== MOBILE MENU ======
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const siteNav  = document.querySelector('.site-nav');

    if (mobileBtn && siteNav) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            siteNav.classList.toggle('active');
            const isActive = siteNav.classList.contains('active');
            mobileBtn.textContent = isActive ? '✕' : '☰';
            mobileBtn.setAttribute('aria-expanded', isActive);
        });

        siteNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('active');
                mobileBtn.textContent = '☰';
                mobileBtn.setAttribute('aria-expanded', 'false');
            });
        });

        const closeMobileNav = (e) => {
            if (siteNav.classList.contains('active') &&
                !siteNav.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                siteNav.classList.remove('active');
                mobileBtn.textContent = '☰';
                mobileBtn.setAttribute('aria-expanded', 'false');
            }
        };

        document.addEventListener('click', closeMobileNav);
        document.addEventListener('pointerdown', closeMobileNav);
    }

    // ====== HEADER SCROLL & PROGRESS ======
    const header = document.querySelector('header');
    let ticking   = false;

    function updateScrollState(scrollY) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar && docHeight > 0) {
            progressBar.style.width = (scrollY / docHeight * 100) + '%';
        }
        if (header) header.classList.toggle('scrolled', scrollY > 40);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollY > 350);
    }

    if (lenisInstance) {
        lenisInstance.on('scroll', (e) => {
            updateScrollState(e.scroll);
        });
    } else {
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY || window.pageYOffset;
                    updateScrollState(scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Run initial scroll update
    updateScrollState(window.scrollY || window.pageYOffset || 0);

    // ====== SMOOTH ANCHOR SCROLLING ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                if (lenisInstance) {
                    lenisInstance.scrollTo(target, { offset: -70, duration: 1.1 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ====== SCROLL REVEAL ======
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('active');
        } else {
            revealObserver.observe(el);
        }
    });

    // ====== ANIMATED STAT COUNTERS (RAF with easeOutExpo) ======
    function animateCount(el, target, suffix = '+') {
        const duration = 1400; // ms
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);

            el.textContent = current.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                if (!isNaN(target)) animateCount(el, target);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.stat-number, .thm-stat-num').forEach(el => statObserver.observe(el));

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

    // ====== ROTATING TYPEWRITER TAGLINE ======
    const taglineEl = document.getElementById('typewriter-tagline');
    if (taglineEl) {
        const phrases = [
            'Cybersecurity Enthusiast',
            'Linux Power User',
            'Python Developer',
            'CTF Player',
            'Ethical Hacker',
        ];
        let phraseIdx = 0;
        let charIdx   = 0;
        let deleting  = false;
        const SPEED_TYPE   = 75;
        const SPEED_DELETE = 40;
        const PAUSE_END    = 1800;
        const PAUSE_START  = 400;

        function typeLoop() {
            const phrase = phrases[phraseIdx];
            if (!deleting) {
                taglineEl.textContent = phrase.slice(0, ++charIdx);
                if (charIdx === phrase.length) {
                    deleting = true;
                    setTimeout(typeLoop, PAUSE_END);
                    return;
                }
                setTimeout(typeLoop, SPEED_TYPE);
            } else {
                taglineEl.textContent = phrase.slice(0, --charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(typeLoop, PAUSE_START);
                    return;
                }
                setTimeout(typeLoop, SPEED_DELETE);
            }
        }

        // Start after a short delay
        setTimeout(typeLoop, 900);
    }

    // ====== INTERACTIVE FAKE TERMINAL ======
    const terminalInput   = document.getElementById('terminal-input');
    const terminalOutput  = document.getElementById('terminal-responses');
    const terminalCursor  = document.getElementById('terminal-cursor');
    const terminalBody    = document.getElementById('terminal-output');

    const COMMANDS = {
        help: `Available commands:\n  help       — show this list\n  whoami     — about me\n  skills     — list my skills\n  projects   — featured projects\n  contact    — how to reach me\n  thm        — TryHackMe stats\n  clear      — clear terminal\n  ls         — list directory\n  pwd        — print working directory`,
        whoami: `😎  Amit Padhan\n    Role   : Cybersecurity Enthusiast & Python Developer\n    OS     : Arch Linux + Hyprland (Wayland)\n    Mission: Mastering Web Exploitation & Ethical Hacking`,
        skills: `🔐  Cybersecurity  — OWASP Top 10 · Privilege Escalation · CTFs\n🛠️  Tools          — Nmap · Burp Suite · Metasploit · Wireshark\n💻  Languages      — Python · Bash · HTML/CSS/JS · C/C++\n🖥️  Platforms      — Kali Linux · Arch Linux · Docker · VMs`,
        projects: `📦  Port Scanner       — multithreaded Python recon tool\n🕸️  Web Vuln Scanner  — OWASP Top 10 automated scanner\n🐧  Dotfiles          — Arch Linux + Hyprland config suite\n→  See more: projects.html`,
        contact: `📧  Use the contact form   : contact.html\n🐙  GitHub              : github.com/amitpadhan525\n💼  LinkedIn            : linkedin.com/in/amit-padhan\n📸  Instagram           : instagram.com/a_m_i_t_01234`,
        thm: `🏴  TryHackMe Profile: amitpadhan525\n★  Rooms Completed : 70+\n🎖️  Badges Earned   : 30+\n🏆  Total Points    : 5000+\n→  tryhackme.com/p/amitpadhan525`,
        ls: `drwxr-xr-x  projects/\ndrwxr-xr-x  labs/\ndrwxr-xr-x  dotfiles/\n-rw-r--r--  resume.pdf\n-rw-r--r--  README.md`,
        pwd: `/home/amit/portfolio`,
        clear: '__CLEAR__',
    };

    function appendTerminalLine(html, colorClass = '') {
        if (!terminalOutput) return;
        const line = document.createElement('div');
        line.className = 'terminal-line terminal-output-text';
        if (colorClass) line.style.color = `var(${colorClass})`;
        line.innerHTML = html.replace(/\n/g, '<br>');
        terminalOutput.appendChild(line);
        terminalBody && terminalBody.scrollTo(0, terminalBody.scrollHeight);
    }

    function appendCommandEcho(cmd) {
        if (!terminalOutput) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">amit@arch ~ $</span> <span class="terminal-cmd">${cmd}</span>`;
        terminalOutput.appendChild(line);
    }

    if (terminalInput && terminalOutput) {
        // Hide built-in cursor when input is active
        terminalInput.addEventListener('focus', () => { if (terminalCursor) terminalCursor.style.display = 'none'; });
        terminalInput.addEventListener('blur',  () => { if (terminalCursor) terminalCursor.style.display = 'inline-block'; });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const raw = terminalInput.value.trim().toLowerCase();
            terminalInput.value = '';
            if (!raw) return;

            appendCommandEcho(raw);

            if (raw in COMMANDS) {
                const response = COMMANDS[raw];
                if (response === '__CLEAR__') {
                    // Remove dynamically added lines
                    terminalOutput.innerHTML = '';
                } else {
                    appendTerminalLine('&gt; ' + response.replace(/\n/g, '\n&gt; '), '--clr-txt-muted');
                }
            } else {
                appendTerminalLine(`&gt; Command not found: <span style="color:var(--clr-red)">${raw}</span>. Type <span style="color:var(--clr-primary)">help</span> for commands.`);
            }
        });

        // Click anywhere in terminal to focus input
        terminalBody && terminalBody.addEventListener('click', () => terminalInput.focus());
    }

    // ====== SPOTLIGHT CARDS (RAF Throttled) ======
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
        let cardRect = null;
        let mouseX = 0, mouseY = 0;
        let isCardUpdating = false;

        function updateSpotlight() {
            if (cardRect) {
                card.style.setProperty('--mouse-x', `${mouseX - cardRect.left}px`);
                card.style.setProperty('--mouse-y', `${mouseY - cardRect.top}px`);
            }
            isCardUpdating = false;
        }

        card.addEventListener('mouseenter', () => {
            cardRect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isCardUpdating) {
                isCardUpdating = true;
                requestAnimationFrame(updateSpotlight);
            }
        });
    });

    // ====== MODAL LOGIC ======
    const modal = document.getElementById('project-modal');
    if (modal) {
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody  = modal.querySelector('.modal-body-content');
        const closeBtn   = modal.querySelector('.modal-close');

        const closeModal = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };

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
                const title   = card.querySelector('h3')?.textContent || 'Project';
                if (details && modalTitle && modalBody) {
                    modalTitle.textContent = title;
                    modalBody.innerHTML = details.innerHTML;
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    // ====== ACTIVE NAV ======
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const currentFile = currentPath.split('/').pop() || 'index.html';
    const cleanCurrent = currentFile.replace(/\.html$/, '');

    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const cleanHref = href.replace(/\.html$/, '').replace(/^\//, '');
        if (cleanHref === cleanCurrent || (cleanCurrent === '' && cleanHref === 'index') || (cleanCurrent === 'index' && cleanHref === 'index')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ====== DOCK MAGNIFICATION (DESKTOP RAF LERP SPRING) ======
    const dockNav = document.querySelector('.site-nav .nav-links');
    if (dockNav && window.matchMedia('(hover: hover) and (min-width: 769px)').matches) {
        const dockLinks = Array.from(dockNav.querySelectorAll('a'));
        let dockItemsData = [];
        let isHoveringDock = false;
        let cursorX = -9999;
        let dockRafId = null;

        function refreshDockBounds() {
            dockItemsData = dockLinks.map(link => {
                const rect = link.getBoundingClientRect();
                return {
                    el: link,
                    center: rect.left + rect.width / 2,
                    currentScale: 1,
                    targetScale: 1
                };
            });
        }

        refreshDockBounds();
        window.addEventListener('resize', refreshDockBounds);

        function renderDock() {
            let activeAnimation = false;

            dockItemsData.forEach(item => {
                if (isHoveringDock) {
                    const dist = Math.abs(cursorX - item.center);
                    if (dist < 85) {
                        item.targetScale = 1 + 0.14 * (1 - dist / 85);
                    } else {
                        item.targetScale = 1;
                    }
                } else {
                    item.targetScale = 1;
                }

                // Smooth spring-like lerp
                const diff = item.targetScale - item.currentScale;
                if (Math.abs(diff) > 0.002) {
                    item.currentScale += diff * 0.22;
                    activeAnimation = true;
                } else {
                    item.currentScale = item.targetScale;
                }

                if (Math.abs(item.currentScale - 1) > 0.002) {
                    const translateY = -2.5 * (item.currentScale - 1) / 0.14;
                    item.el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${item.currentScale.toFixed(3)})`;
                } else {
                    item.el.style.transform = '';
                }
            });

            if (isHoveringDock || activeAnimation) {
                dockRafId = requestAnimationFrame(renderDock);
            } else {
                dockRafId = null;
            }
        }

        dockNav.addEventListener('mouseenter', () => {
            isHoveringDock = true;
            refreshDockBounds();
            if (!dockRafId) dockRafId = requestAnimationFrame(renderDock);
        });

        dockNav.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            if (!dockRafId) dockRafId = requestAnimationFrame(renderDock);
        });

        dockNav.addEventListener('mouseleave', () => {
            isHoveringDock = false;
            cursorX = -9999;
            if (!dockRafId) dockRafId = requestAnimationFrame(renderDock);
        });
    }

    // ====== SMOOTH PAGE TRANSITIONS & PREFETCH ======
    window.addEventListener('pageshow', () => {
        document.body.style.opacity = '';
        document.body.style.transform = '';
    });

    // Prefetch internal pages on hover for instant response
    const prefetchedUrls = new Set();
    function prefetchUrl(url) {
        if (!url || prefetchedUrls.has(url)) return;
        prefetchedUrls.add(url);
        const linkEl = document.createElement('link');
        linkEl.rel = 'prefetch';
        linkEl.href = url;
        document.head.appendChild(linkEl);
    }

    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (
            href &&
            !href.startsWith('#') &&
            !href.startsWith('http') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.startsWith('javascript:') &&
            link.getAttribute('target') !== '_blank' &&
            !link.hasAttribute('download')
        ) {
            // Hover prefetch
            link.addEventListener('mouseenter', () => prefetchUrl(href), { passive: true });
            link.addEventListener('focus', () => prefetchUrl(href), { passive: true });

            link.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

                const linkFile = href.split('/').pop().replace(/\.html$/, '') || 'index';
                if (linkFile === cleanCurrent) return;

                e.preventDefault();
                document.body.style.opacity    = '0';
                document.body.style.transform  = 'translate3d(0, 6px, 0)';
                document.body.style.transition = 'opacity .22s cubic-bezier(0.4, 0, 0.2, 1), transform .22s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => { window.location.href = href; }, 220);
            });
        }
    });

    // ====== PROJECT FILTER BUTTONS ======
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('#projects-grid .project-card');

    if (filterBtns.length && projectCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                projectCards.forEach(card => {
                    const cats = card.dataset.category || '';
                    if (filter === 'all' || cats.includes(filter)) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }
});
