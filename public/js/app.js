// Navigation & Page Management
class SiteManager {
    constructor() {
        this.currentPage = 'home';
        this.referencesBuilt = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupAnimations();
        this.setupContactForm();
        this.setupHeroPlaylist();
        this.updateHeaderState();
        this.setupReferenceModals();
        this.setupDynamicReferences();
    }

    setupNavigation() {
        // Page navigation
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                const targetPage = pageLink.dataset.page;
                const targetSection = pageLink.dataset.section;
                
                if (targetSection) {
                    // Navigate to page and scroll to section
                    this.navigateToPage(targetPage);
                    setTimeout(() => {
                        this.scrollToSection(targetSection);
                    }, 100);
                } else {
                    this.navigateToPage(targetPage);
                }
            }
        });

        // Mobile menu optimisé
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('nav');
        
        if (mobileMenuBtn && nav) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenuBtn.classList.toggle('active');
                nav.classList.toggle('active');
            });

            // Fermer le menu mobile lors du clic sur un lien
            nav.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    mobileMenuBtn.classList.remove('active');
                    nav.classList.remove('active');
                }
            });

            // Fermer le menu mobile lors du redimensionnement
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    mobileMenuBtn.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        }
    }

    setupDynamicReferences() {
        const build = async () => {
            try {
                const grid = document.querySelector('#references .references-grid');
                if (!grid) return;
                if (this.referencesBuilt) return;

                const response = await fetch(encodeURI('/docs/Références-projet-Malek-BELKHIR.txt'));
                if (!response.ok) return;
                const text = await response.text();

                const projects = this.parseReferencesTxt(text);
                if (!projects.length) return;

                // Clear any existing static content
                grid.innerHTML = '';

                const container = grid.closest('.container') || document.getElementById('references');

                // Helper: shorten long texts to keep cards uniform
                const shorten = (value, maxLen = 80) => {
                    if (!value) return '';
                    const s = String(value).trim();
                    return s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s;
                };

                projects.forEach((p, idx) => {
                    const card = document.createElement('div');
                    card.className = 'reference-card';

                    const header = document.createElement('div');
                    header.className = 'reference-image';
                    header.textContent = p.country || 'Projet';
                    card.appendChild(header);

                    const content = document.createElement('div');
                    content.className = 'reference-content';

                    const h4 = document.createElement('h4');
                    h4.textContent = shorten(p.project, 96);
                    content.appendChild(h4);

                    const meta = document.createElement('div');
                    meta.className = 'reference-meta';
                    const addMeta = (label, value) => {
                        if (!value) return;
                        const l = document.createElement('span'); l.className = 'label'; l.textContent = label; meta.appendChild(l);
                        const v = document.createElement('span'); v.className = 'value'; v.textContent = value; meta.appendChild(v);
                    };
                    addMeta('Année', p.year);
                    addMeta("Maître d'ouvrage", shorten(p.client, 64));
                    addMeta('Financement', shorten(p.funding, 64));
                    content.appendChild(meta);

                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline ref-more';
                    const modalId = `ref-auto-${idx}`;
                    btn.setAttribute('data-ref-modal-target', modalId);
                    btn.textContent = 'Voir plus';
                    content.appendChild(btn);

                    card.appendChild(content);
                    grid.appendChild(card);

                    // Modal
                    const backdrop = document.createElement('div');
                    backdrop.className = 'modal-backdrop';
                    backdrop.id = modalId;

                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    const mHeader = document.createElement('div');
                    mHeader.className = 'modal-header';
                    const mTitle = document.createElement('div');
                    mTitle.className = 'modal-title';
                    mTitle.textContent = `${p.country || ''} — ${p.project || 'Détails du projet'}`;
                    const mClose = document.createElement('button');
                    mClose.className = 'modal-close'; mClose.setAttribute('data-ref-modal-close',''); mClose.innerHTML = '&times;';
                    mHeader.appendChild(mTitle); mHeader.appendChild(mClose);

                    const mBody = document.createElement('div');
                    mBody.className = 'modal-body';
                    const mMeta = document.createElement('div');
                    mMeta.className = 'modal-meta';
                    const addMetaBlock = (label, value) => {
                        if (!value) return;
                        const l = document.createElement('span'); l.className = 'label'; l.textContent = label; mMeta.appendChild(l);
                        const v = document.createElement('span'); v.className = 'value'; v.textContent = value; mMeta.appendChild(v);
                    };
                    addMetaBlock('Année', p.year);
                    addMetaBlock('Maître d\'ouvrage', p.client);
                    addMetaBlock('Financement', p.funding);
                    addMetaBlock('Rôle', p.role);
                    mBody.appendChild(mMeta);

                    if (p.tasks && p.tasks.length) {
                        const ul = document.createElement('ul');
                        ul.style.marginTop = '8px';
                        p.tasks.forEach(t => {
                            const li = document.createElement('li');
                            li.textContent = t;
                            ul.appendChild(li);
                        });
                        mBody.appendChild(ul);
                    }

                    modal.appendChild(mHeader); modal.appendChild(mBody);
                    backdrop.appendChild(modal);
                    container.appendChild(backdrop);
                });

                // Wire up search
                const input = document.getElementById('ref-search');
                if (input) {
                    input.addEventListener('input', () => {
                        const q = input.value.toLowerCase().trim();
                        grid.querySelectorAll('.reference-card').forEach((card) => {
                            const text = card.innerText.toLowerCase();
                            card.style.display = text.includes(q) ? '' : 'none';
                        });
                    });
                }

                this.referencesBuilt = true;
            } catch { /* noop */ }
        };

        // Build immediately and also on navigation to references
        build();
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page="references"]');
            if (pageLink) setTimeout(build, 0);
        });
    }

    parseReferencesTxt(rawText) {
        const lines = rawText.split(/\r?\n/);
        const projects = [];
        let current = null;
        let currentKey = null;
        let inTasks = false;

        const commit = () => {
            if (current) {
                // Trim strings
                ['country','project','client','funding','role','year'].forEach(k => { if (current[k]) current[k] = String(current[k]).trim(); });
                if (current.tasks) current.tasks = current.tasks.filter(Boolean);
                projects.push(current);
            }
        };

        const setKey = (key, value) => {
            if (!current) current = { tasks: [] };
            current[key] = current[key] ? (current[key] + ' ' + value.trim()) : value.trim();
            currentKey = key;
            inTasks = false;
        };

        lines.forEach((rawLine) => {
            const line = rawLine.replace(/\t/g, ' ').trimEnd();
            const mCountry = line.match(/^\s*Pays\s*:\s*(.*)$/);
            if (mCountry) {
                commit();
                current = { country: mCountry[1].trim(), tasks: [] };
                currentKey = null; inTasks = false; return;
            }
            const mProject = line.match(/^\s*Projet\s*:\s*(.*)$/);
            if (mProject) return setKey('project', mProject[1]);
            const mClient = line.match(/^\s*Client\s*:\s*(.*)$/);
            if (mClient) return setKey('client', mClient[1]);
            const mFunding = line.match(/^\s*Financement\s*:\s*(.*)$/);
            if (mFunding) return setKey('funding', mFunding[1]);
            const mRole = line.match(/^\s*Poste\s*:\s*(.*)$/);
            if (mRole) return setKey('role', mRole[1]);
            if (/^\s*Tâches\s*:/.test(line)) { inTasks = true; currentKey = null; if (!current.tasks) current.tasks = []; return; }

            const mYear = line.match(/^\s*(\d{4})\b/);
            if (mYear && !current?.year) { if (!current) current = { tasks: [] }; current.year = mYear[1]; }

            if (inTasks) {
                const mBullet = line.match(/^\s*-\s*(.*)$/);
                if (mBullet) { current.tasks.push(mBullet[1].trim()); return; }
            }

            // Continuation lines for last key (project/client/funding/role)
            if (currentKey && line && !/^\s*(Pays|Projet|Client|Financement|Poste|Tâches)\s*:/.test(line)) {
                current[currentKey] = `${current[currentKey]} ${line.trim()}`.trim();
                return;
            }
        });

        commit();
        return projects;
    }

    setupReferenceModals() {
        // Delegate clicks for all 'Voir plus' buttons
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-ref-modal-target]');
            if (btn) {
                const targetId = btn.getAttribute('data-ref-modal-target');
                const backdrop = document.getElementById(targetId);
                if (backdrop) backdrop.style.display = 'flex';
            }
            const closeBtn = e.target.closest('[data-ref-modal-close]');
            if (closeBtn) {
                const backdrop = closeBtn.closest('.modal-backdrop');
                if (backdrop) backdrop.style.display = 'none';
            }
            if (e.target.classList.contains('modal-backdrop')) {
                e.target.style.display = 'none';
            }
        });
    }

    setupHeroPlaylist() {
        const videoA = document.getElementById('heroVideoA');
        const videoB = document.getElementById('heroVideoB');
        if (!videoA || !videoB) return;

        const clips = [
            '/videos/marseille.mp4',
            '/videos/transportvert.mp4',
            '/videos/DATA.mp4',
            '/videos/tr.mp4',
            '/videos/MER.mp4'
        ];

        const TOTAL_MS = 25000;
        const FADE_MS = 800; // crossfade duration
        const perClipMs = Math.max(FADE_MS + 1200, Math.floor(TOTAL_MS / clips.length));

        let index = 0;
        let active = videoA;   // currently visible
        let standby = videoB;  // next to fade in
        let timerId = null;

        // Prepare both elements
        [videoA, videoB].forEach(v => {
            v.muted = true;
            v.playsInline = true;
            v.preload = 'metadata';
            v.style.opacity = '0';
        });

        const swap = () => {
            const tmp = active; active = standby; standby = tmp;
        };

        const playClip = () => {
            const nextSrc = `${clips[index]}#t=0`;

            // Load next on standby
            standby.src = nextSrc;
            standby.currentTime = 0;
            // Ensure it starts playing (hidden)
            const standbyPlay = standby.play();
            if (standbyPlay && typeof standbyPlay.then === 'function') {
                standbyPlay.catch(() => standby.play().catch(() => {}));
            }

            // Crossfade: fade out active, fade in standby
            standby.style.opacity = '1';
            active.style.opacity = '0';

            // After fade completes, pause the old active and swap refs
            setTimeout(() => {
                active.pause();
                swap();
            }, FADE_MS);

            clearTimeout(timerId);
            timerId = setTimeout(() => {
                index = (index + 1) % clips.length;
                playClip();
            }, perClipMs);
        };

        const observePage = () => {
            const isHomeVisible = document.getElementById('home')?.classList.contains('active');
            if (isHomeVisible) {
                // Kickoff: set first clip on active so we immediately see content
                active.src = `${clips[index]}#t=0`;
                active.currentTime = 0;
                active.style.opacity = '1';
                active.play().catch(() => {});
                index = (index + 1) % clips.length;
                clearTimeout(timerId);
                timerId = setTimeout(playClip, perClipMs);
            } else {
                [videoA, videoB].forEach(v => v.pause());
                clearTimeout(timerId);
            }
        };

        observePage();

        const navHandler = () => observePage();
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-page]')) setTimeout(navHandler, 0);
        });
        window.addEventListener('popstate', navHandler);
    }

    navigateToPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;

            // Scroll to top
            window.scrollTo(0, 0);

            // Update URL hash
            window.history.pushState({page: pageName}, '', `#${pageName}`);

            // Ensure header style matches the target page
            this.updateHeaderState();
        }
    }

    scrollToSection(sectionName) {
        const target = document.querySelector(`.${sectionName}`) || document.querySelector(`[data-section="${sectionName}"], #${sectionName}`);
        if (!target) return;

        const header = document.getElementById('header');
        const headerHeight = header ? header.offsetHeight : 0;

        // Desktop: centrer la section dans la fenêtre
        if (window.innerWidth >= 992) {
            const rect = target.getBoundingClientRect();
            const centerOffset = (window.innerHeight - target.offsetHeight) / 2;
            const top = window.scrollY + rect.top - Math.max(0, centerOffset) - (headerHeight / 2);
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
            return;
        }

        // Mobile/tablette: aligner en haut
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => this.updateHeaderState());
    }

    updateHeaderState() {
        const header = document.getElementById('header');
        if (!header) return;

        // On all pages except home, header should always be in scrolled state
        if (this.currentPage !== 'home') {
            header.classList.add('scrolled');
            return;
        }

        // On home, header becomes scrolled only after some scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    setupAnimations() {
        // Intersection Observer optimisé pour les animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    // Arrêter d'observer une fois l'animation déclenchée
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -30px 0px'
        });

        // Setup initial state and observe elements avec performance optimisée
        const elementsToAnimate = document.querySelectorAll('.fade-in-up');
        if (elementsToAnimate.length > 0) {
            elementsToAnimate.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                observer.observe(el);
            });
        }
    }

    setupContactForm() {
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Get form data
                const formData = new FormData(form);
                const data = Object.fromEntries(formData);
                
                // Simple validation
                if (!data.name || !data.email || !data.message) {
                    alert('Veuillez remplir tous les champs obligatoires.');
                    return;
                }

                // Simulate form submission
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Envoi en cours...';
                submitBtn.disabled = true;

                setTimeout(() => {
                    alert('Merci pour votre demande ! Nous vous recontacterons rapidement.');
                    form.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            });
        }
    }
}

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
    const siteManager = new SiteManager();

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || 'home';
        siteManager.navigateToPage(page);
    });

    // Handle initial hash
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
        siteManager.navigateToPage(hash);
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for potential external use
window.SiteManager = SiteManager;