document.addEventListener('DOMContentLoaded', () => {
    // ====== LENIS SMOOTH SCROLLING ======
    const lenisScript = document.createElement('script');
    lenisScript.src = 'https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
    lenisScript.onload = () => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    };
    document.head.appendChild(lenisScript);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ====== MOBILE MENU ======
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const siteNav  = document.querySelector('.site-nav');

    if (mobileBtn && siteNav) {
        mobileBtn.addEventListener('click', () => {
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
    let ticking   = false;

    function onScroll() {
        const scrollY   = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar && docHeight > 0)
            progressBar.style.width = (scrollY / docHeight * 100) + '%';
        if (header) header.classList.toggle('scrolled', scrollY > 50);
        if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollY > 400);
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    // ====== SMOOTH ANCHOR SCROLLING ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
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
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ====== ANIMATED STAT COUNTERS (global & THM) ======
    function animateCount(el, target, suffix = '+') {
        let current = 0;
        const increment = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current.toLocaleString() + suffix;
        }, 40);
    }

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                animateCount(el, target);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

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
        thm: `🏴  TryHackMe Profile: amitpadhan525\n★  Rooms Completed : 50+\n🎖️  Badges Earned   : 30+\n🏆  Total Points    : 5000+\n→  tryhackme.com/p/amitpadhan525`,
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

    // ====== SPOTLIGHT CARDS ======
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top)  + 'px');
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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ====== SMOOTH PAGE TRANSITIONS ======
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && link.getAttribute('target') !== '_blank') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.style.opacity    = '0';
                document.body.style.transform  = 'translateY(8px)';
                document.body.style.transition = 'opacity .25s ease, transform .25s ease';
                setTimeout(() => { window.location.href = href; }, 250);
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
