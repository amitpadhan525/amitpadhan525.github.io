document.addEventListener('DOMContentLoaded', () => {

    // ================================================================
    // 🌿 LIQUID GRASS ENGINE
    // ================================================================
    (function initGrass() {
        const canvas = document.getElementById('grass-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W, H;
        let blades = [];

        // ── Config ──────────────────────────────────────────
        const CFG = {
            count:      700,          // number of blades
            minH:       45,           // min blade height px
            maxH:       145,          // max blade height px
            minW:       2.0,          // base width min
            maxW:       5.5,          // base width max
            windSpeed:  0.0007,       // how fast the wave moves across time
            waveFreq:   0.008,        // spatial wave frequency
            maxSway:    32,           // max tip horizontal sway px
            groundLines: 8,           // number of horizontal ground lines
        };

        // ── Create blades ────────────────────────────────────
        function buildBlades() {
            blades = [];
            for (let i = 0; i < CFG.count; i++) {
                // Assign blade to a "ground line" — evenly spaced across full height
                const lineIdx = Math.floor(Math.random() * CFG.groundLines);
                const lineT   = lineIdx / (CFG.groundLines - 1); // 0=top, 1=bottom

                // Ground lines spread from 30% height to 100% (bottom)
                const baseY = H * (0.30 + lineT * 0.72) + (Math.random() - 0.5) * 20;

                const x = Math.random() * W;

                // Front (lower) lines get taller, wider, brighter blades
                const scaleFactor = 0.35 + lineT * 0.75;
                const h     = (CFG.minH + Math.random() * (CFG.maxH - CFG.minH)) * scaleFactor;
                const baseW = (CFG.minW + Math.random() * (CFG.maxW - CFG.minW)) * scaleFactor;

                // Colour: back rows darker/cooler, front rows vivid green
                const hue  = 95 + lineT * 45;                     // 95–140
                const sat  = 40 + lineT * 35;                     // 40–75%
                const lite = 10 + lineT * 25 + Math.random() * 8; // 10–43%

                const lean  = (Math.random() - 0.5) * 0.55;
                const phase = x * CFG.waveFreq + Math.random() * 0.8;

                blades.push({ x, baseY, h, baseW, hue, sat, lite, lean, phase, lineIdx });
            }

            // Sort so back lines draw first (painter's algorithm)
            blades.sort((a, b) => a.lineIdx - b.lineIdx);
        }

        // ── Resize ───────────────────────────────────────────
        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
            buildBlades();
        }

        // ── Draw a single blade ──────────────────────────────
        function drawBlade(b, wind) {
            // Wind displacement: smooth wave moving across x
            const sway = Math.sin(wind + b.phase) * CFG.maxSway * (b.h / CFG.maxH);
            const lean  = b.lean * b.h * 0.35;

            const bx = b.x;
            const by = b.baseY;
            const tipX = bx + sway + lean;
            const tipY = by - b.h;

            // Control points for bezier — bottom third stays rigid
            const cp1x = bx + (sway + lean) * 0.1;
            const cp1y = by - b.h * 0.33;
            const cp2x = bx + (sway + lean) * 0.65;
            const cp2y = by - b.h * 0.72;

            // Gradient: dark at root, bright at tip, transparent at very tip
            const grad = ctx.createLinearGradient(bx, by, tipX, tipY);
            grad.addColorStop(0,   `hsla(${b.hue}, ${b.sat}%, ${b.lite * 0.6}%, 0.95)`);
            grad.addColorStop(0.4, `hsla(${b.hue}, ${b.sat + 10}%, ${b.lite}%, 0.85)`);
            grad.addColorStop(0.75,`hsla(${b.hue + 15}, ${b.sat + 15}%, ${b.lite + 15}%, 0.6)`);
            grad.addColorStop(1,   `hsla(${b.hue + 25}, 70%, 75%, 0)`);

            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tipX, tipY);

            ctx.strokeStyle = grad;
            ctx.lineWidth   = b.baseW;
            ctx.lineCap     = 'round';
            ctx.stroke();

            // Draw a slightly thinner secondary strand shifted by 1-2px for "liquid" volume
            if (b.baseW > 3) {
                const offset = b.baseW * 0.3;
                const g2 = ctx.createLinearGradient(bx + offset, by, tipX + offset * 0.5, tipY);
                g2.addColorStop(0,   `hsla(${b.hue + 8}, ${b.sat}%, ${b.lite * 0.8}%, 0.5)`);
                g2.addColorStop(0.6, `hsla(${b.hue + 20}, ${b.sat}%, ${b.lite + 10}%, 0.25)`);
                g2.addColorStop(1,   `hsla(${b.hue + 30}, 70%, 80%, 0)`);

                ctx.beginPath();
                ctx.moveTo(bx + offset, by);
                ctx.bezierCurveTo(cp1x + offset, cp1y, cp2x + offset * 0.5, cp2y, tipX + offset * 0.3, tipY);
                ctx.strokeStyle = g2;
                ctx.lineWidth   = b.baseW * 0.4;
                ctx.stroke();
            }
        }

        // ── Animate ──────────────────────────────────────────
        let t = 0;
        function animate() {
            t += CFG.windSpeed * 16; // ~16ms per frame
            ctx.clearRect(0, 0, W, H);

            // Draw a subtle ground shadow / glow at page bottom
            const groundGrad = ctx.createLinearGradient(0, H - 30, 0, H + 20);
            groundGrad.addColorStop(0, 'rgba(10, 40, 10, 0)');
            groundGrad.addColorStop(1, 'rgba(5, 20, 5, 0.4)');
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, H - 30, W, 50);

            for (const b of blades) {
                drawBlade(b, t);
            }

            requestAnimationFrame(animate);
        }

        resize();
        window.addEventListener('resize', () => {
            // Debounce resize
            clearTimeout(window._grassResizeTimer);
            window._grassResizeTimer = setTimeout(resize, 200);
        }, { passive: true });

        requestAnimationFrame(animate);
    })();


    // ================================================================
    // 📄 PAGE TRANSITION
    // ================================================================
    document.body.classList.add('page-transition');


    // ================================================================
    // 📅 FOOTER YEAR
    // ================================================================
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = new Date().getFullYear();


    // ================================================================
    // 📊 SCROLL PROGRESS BAR (native-scroll compatible)
    // ================================================================
    let progressBar = document.getElementById('scroll-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        document.body.prepend(progressBar);
    }


    // ================================================================
    // ⬆️ SCROLL TO TOP BUTTON
    // ================================================================
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


    // ================================================================
    // 📱 MOBILE MENU
    // ================================================================
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const siteNav   = document.querySelector('.site-nav');

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


    // ================================================================
    // 📜 HEADER SCROLL + PROGRESS BAR
    // ================================================================
    const header = document.querySelector('header');
    let ticking  = false;

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


    // ================================================================
    // 🔗 SMOOTH ANCHOR SCROLLING
    // ================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });


    // ================================================================
    // 👁️ SCROLL REVEAL
    // ================================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


    // ================================================================
    // 🔢 ANIMATED STAT COUNTERS
    // ================================================================
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
                animateCount(entry.target, parseInt(entry.target.dataset.target, 10));
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number, .thm-stat-num').forEach(el => statObserver.observe(el));


    // ================================================================
    // 📈 PROGRESS BAR ANIMATION
    // ================================================================
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.learning-card').forEach(el => progressObserver.observe(el));


    // ================================================================
    // ⌨️ ROTATING TYPEWRITER TAGLINE
    // ================================================================
    const taglineEl = document.getElementById('typewriter-tagline');
    if (taglineEl) {
        const phrases = [
            'Cybersecurity Enthusiast',
            'Linux Power User',
            'Python Developer',
            'CTF Player',
            'Ethical Hacker',
        ];
        let phraseIdx = 0, charIdx = 0, deleting = false;
        const SPEED_TYPE = 75, SPEED_DELETE = 40, PAUSE_END = 1800, PAUSE_START = 400;

        function typeLoop() {
            const phrase = phrases[phraseIdx];
            if (!deleting) {
                taglineEl.textContent = phrase.slice(0, ++charIdx);
                if (charIdx === phrase.length) { deleting = true; setTimeout(typeLoop, PAUSE_END); return; }
                setTimeout(typeLoop, SPEED_TYPE);
            } else {
                taglineEl.textContent = phrase.slice(0, --charIdx);
                if (charIdx === 0) {
                    deleting = false;
                    phraseIdx = (phraseIdx + 1) % phrases.length;
                    setTimeout(typeLoop, PAUSE_START); return;
                }
                setTimeout(typeLoop, SPEED_DELETE);
            }
        }
        setTimeout(typeLoop, 900);
    }


    // ================================================================
    // 💻 INTERACTIVE FAKE TERMINAL
    // ================================================================
    const terminalInput  = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-responses');
    const terminalCursor = document.getElementById('terminal-cursor');
    const terminalBody   = document.getElementById('terminal-output');

    const COMMANDS = {
        help:     `Available commands:\n  help       — show this list\n  whoami     — about me\n  skills     — list my skills\n  projects   — featured projects\n  contact    — how to reach me\n  thm        — TryHackMe stats\n  clear      — clear terminal\n  ls         — list directory\n  pwd        — print working directory`,
        whoami:   `😎  Amit Padhan\n    Role   : Cybersecurity Enthusiast & Python Developer\n    OS     : Arch Linux + Hyprland (Wayland)\n    Mission: Mastering Web Exploitation & Ethical Hacking`,
        skills:   `🔐  Cybersecurity  — OWASP Top 10 · Privilege Escalation · CTFs\n🛠️  Tools          — Nmap · Burp Suite · Metasploit · Wireshark\n💻  Languages      — Python · Bash · HTML/CSS/JS · C/C++\n🖥️  Platforms      — Kali Linux · Arch Linux · Docker · VMs`,
        projects: `📦  Port Scanner       — multithreaded Python recon tool\n🕸️  Web Vuln Scanner  — OWASP Top 10 automated scanner\n🐧  Dotfiles          — Arch Linux + Hyprland config suite\n→  See more: projects.html`,
        contact:  `📧  Contact form   : contact.html\n🐙  GitHub         : github.com/amitpadhan525\n💼  LinkedIn       : linkedin.com/in/amit-padhan`,
        thm:      `🏴  TryHackMe Profile: amitpadhan525\n★  Rooms Completed : 50+\n🎖️  Badges Earned   : 30+\n🏆  Total Points    : 5000+`,
        ls:       `drwxr-xr-x  projects/\ndrwxr-xr-x  labs/\ndrwxr-xr-x  dotfiles/\n-rw-r--r--  resume.pdf\n-rw-r--r--  README.md`,
        pwd:      `/home/amit/portfolio`,
        clear:    '__CLEAR__',
    };

    function appendTerminalLine(html, colorVar = '') {
        if (!terminalOutput) return;
        const line = document.createElement('div');
        line.className = 'terminal-line terminal-output-text';
        if (colorVar) line.style.color = `var(${colorVar})`;
        line.innerHTML = html.replace(/\n/g, '<br>');
        terminalOutput.appendChild(line);
        if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function appendCommandEcho(cmd) {
        if (!terminalOutput) return;
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="terminal-prompt">amit@arch ~ $</span> <span class="terminal-cmd">${cmd}</span>`;
        terminalOutput.appendChild(line);
    }

    if (terminalInput && terminalOutput) {
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
                if (response === '__CLEAR__') terminalOutput.innerHTML = '';
                else appendTerminalLine('&gt; ' + response.replace(/\n/g, '\n&gt; '), '--clr-txt-muted');
            } else {
                appendTerminalLine(`&gt; Command not found: <span style="color:var(--clr-red)">${raw}</span>. Type <span style="color:var(--clr-primary)">help</span>.`);
            }
        });
        if (terminalBody) terminalBody.addEventListener('click', () => terminalInput.focus());
    }


    // ================================================================
    // 🔦 SPOTLIGHT CARDS
    // ================================================================
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top)  + 'px');
        });
    });


    // ================================================================
    // 🪟 MODAL LOGIC
    // ================================================================
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


    // ================================================================
    // 🔗 ACTIVE NAV
    // ================================================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });


    // ================================================================
    // 🎬 SMOOTH PAGE TRANSITIONS (on link click)
    // ================================================================
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('http') &&
            !href.startsWith('mailto:') && link.getAttribute('target') !== '_blank') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.style.opacity    = '0';
                document.body.style.transform  = 'translateY(8px)';
                document.body.style.transition = 'opacity .25s ease, transform .25s ease';
                setTimeout(() => { window.location.href = href; }, 250);
            });
        }
    });


    // ================================================================
    // 🗂️ PROJECT FILTER BUTTONS
    // ================================================================
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('#projects-grid .project-card');

    if (filterBtns.length && projectCards.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                projectCards.forEach(card => {
                    const cats = card.dataset.category || '';
                    card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
                });
            });
        });
    }

});
