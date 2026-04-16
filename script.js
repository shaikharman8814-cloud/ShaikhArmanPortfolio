import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Global State
let particlesMesh, renderer, particlesMaterial;
let isMusicPlaying = false;
let hasGreeted = false;

// Initialize
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Clear hash if any without triggering scroll
if (window.location.hash) {
    setTimeout(() => {
        window.scrollTo(0, 0);
        if (window.history.replaceState) {
            window.history.replaceState('', document.title, window.location.pathname + window.location.search);
        }
    }, 1);
}

document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initAnimations();
    initCursor();
    initTypewriter();
    initNavigation();
    initThemeSwitch();
    initStats();
    initTerminal();
    initProjectExpansion();
    initMusic();


    // JARVIS VOICE FIX: Explicitly unlock speech engine on first interaction
    const unlockSpeech = () => {
        if (window.speechSynthesis) {
            const silent = new SpeechSynthesisUtterance("");
            silent.volume = 0;
            window.speechSynthesis.speak(silent);
            window.isInteractionOccurred = true;
            if (!hasGreeted) playInitialGreeting();
        }
        window.removeEventListener('click', unlockSpeech);
        window.removeEventListener('keydown', unlockSpeech);
        window.removeEventListener('touchstart', unlockSpeech);
    };
    window.addEventListener('click', unlockSpeech);
    window.addEventListener('keydown', unlockSpeech);
    window.addEventListener('touchstart', unlockSpeech);

    window.addEventListener('scroll', updateScrollProgress);
    initChat();
    initFAQ();
    initNeuralSkills();
    initCursorTrail();
    initTypingSound();

    // Init Matrix Rain if it's the default theme
    const initialTheme = document.documentElement.getAttribute('data-theme') || 'midnight';
    if (initialTheme === 'matrix') {
        initMatrixRain();
    }
    updateThemeIcon(initialTheme);

    // Hide preloader (stay for 0.6s)
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
                // Start Jarvis Greeting automatically after preloader
                playInitialGreeting();
            }, 600);
        }
    }, 600);
});

function updateScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / scrollable) * 100 + '%';
}

function initThree() {
    const canvas = document.getElementById('canvas-bg');
    if (!canvas) return;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 3;
    const geo = new THREE.BufferGeometry();
    const count = 3500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 12;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particlesMaterial = new THREE.PointsMaterial({ size: 0.008, color: 0x00e5ff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
    particlesMesh = new THREE.Points(geo, particlesMaterial);
    scene.add(particlesMesh);
    const tick = () => {
        particlesMesh.rotation.y += 0.0005;
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };
    tick();
}

function initTerminal() {
    const input = document.getElementById('terminal-input');
    const history = document.getElementById('terminal-history');
    if (!input) return;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.toLowerCase().trim();
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = `<span class="cmd-prefix"># ></span> ${input.value}`;
            history.appendChild(line);
            gsap.to(line, { opacity: 1, x: 0, duration: 0.3 });

            processCommand(cmd, history);
            input.value = '';
            const body = document.querySelector('.terminal-body');
            body.scrollTop = body.scrollHeight;
        }
    });

    gsap.to('.terminal-line', { opacity: 1, x: 0, stagger: 0.5, scrollTrigger: { trigger: '.terminal-window', start: 'top 80%' } });
}

function processCommand(cmd, history) {
    let response = '';
    let isEasterEgg = false;

    if (cmd === 'help') response = 'Available: bio, tech, projects, contact, whoami, clear';
    else if (cmd === 'bio') response = 'Shaikh Arman - AI Systems Builder based in Pune, India.';
    else if (cmd === 'tech') response = 'Stack: OpenAI, SnyderAI, Meta AI, Gemini, LangChain, React, Python.';
    else if (cmd === 'clear') { history.innerHTML = ''; return; }
    else if (cmd === 'projects') response = 'Aetheris, Jarvis-style Assistant, Student Social Network...';
    else if (cmd === 'contact') response = 'Email: shaikharman8814@gmail.com | GitHub: github.com/shaikharman8814-cloud';
    else if (cmd === 'whoami') {
        isEasterEgg = true;
        response = '> IDENTITY SCAN...\n> SUBJECT: SHAIKH ARMAN\n> ROLE: AI Systems Builder\n> ORIGIN: Pune, India 🇮🇳\n> STATUS: Building the future, one model at a time.\n> ACCESS GRANTED. Welcome back, Architect. 🟢';
    }
    else if (cmd === 'matrix') {
        isEasterEgg = true;
        response = 'Wake up, Arman... The Matrix has you. Follow the white rabbit. 🐇';
    }
    else if (cmd === 'sudo hire arman') {
        isEasterEgg = true;
        response = `[sudo] password for recruiter: ••••••••\n✅ Authentication successful.\n🚀 INITIATING HIRE SEQUENCE...\n📧 Request sent to: shaikharman8814@gmail.com\n🎉 ACCESS GRANTED — Hire Request Sent!\nCongratulations, you made an excellent decision. 😎`;
    }
    else if (cmd === 'sudo') response = 'Nice try. Try: sudo hire arman 👀';
    else response = `Command not found: ${cmd}. Type 'help' for options.`;

    const resLine = document.createElement('div');
    resLine.className = 'terminal-line';
    resLine.style.color = isEasterEgg ? 'var(--primary-color)' : 'var(--text-dim)';
    resLine.style.marginTop = '-5px';
    resLine.style.whiteSpace = 'pre-line';
    resLine.innerHTML = `<span class="cmd-prefix" style="visibility:hidden"># ></span> ${response}`;
    history.appendChild(resLine);
    gsap.to(resLine, { opacity: 1, x: 0, duration: 0.3 });

    if (window.isJarvisActive) {
        speakResponse(response.replace(/>/g, '').replace(/#/g, ''));
    }
}



function speakResponse(text) {
    if (!window.speechSynthesis) return;

    const utter = () => {
        // Only proceed if interaction occurred (Chrome requirement)
        if (!window.isInteractionOccurred && !window.hasFiredInitial) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Find a high-quality voice
        const preferredVoice = voices.find(v =>
            (v.name.includes('Google') || v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('English')) &&
            (v.lang.startsWith('en'))
        );

        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            utter();
            window.speechSynthesis.onvoiceschanged = null; // Prevent multi-triggers
        };
    } else {
        utter();
    }
}

function playInitialGreeting() {
    if (hasGreeted) return;
    const greeting = "System Online, Shaikh Arman's Core initialized";
    speakResponse(greeting);

    // Only mark as greeted if the browser actually allows speech
    if (window.speechSynthesis.speaking || window.isInteractionOccurred) {
        hasGreeted = true;
    }

    const history = document.getElementById('terminal-history');
    if (history) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.style.color = 'var(--primary-color)';
        line.innerHTML = `<span class="cmd-prefix"># ></span> [AUTO-BOOT] ${greeting}`;
        history.appendChild(line);
    }
}

function initProjectExpansion() {
    const modal = document.getElementById('project-modal');
    const cards = document.querySelectorAll('.project-card, .featured-project');
    const close = document.querySelector('.close-modal');
    if (!modal) return;

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;

            const title = card.querySelector('h3').textContent;
            const desc = card.querySelector('p').textContent;
            const tags = card.querySelector('.card-tags')?.innerHTML || '';
            const demoLink = card.querySelector('a')?.href || '';
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-description').textContent = desc;
            document.getElementById('modal-tags').innerHTML = tags;

            const arch = card.querySelector('.mini-arch')?.outerHTML || '';
            const graph = card.querySelector('.mini-graph')?.outerHTML || '';
            const modalArch = document.getElementById('modal-arch');
            if (modalArch) modalArch.innerHTML = arch + graph;
            const linksContainer = document.getElementById('modal-links-container');
            if (linksContainer) {
                if (title.includes('Social Network') || title.includes('SnyderAI') || title.includes('Aetheris') || (demoLink && demoLink !== '#' && !demoLink.includes('localhost'))) {
                    linksContainer.classList.add('active');
                    const linkBtn = document.getElementById('modal-link-demo');
                    if (linkBtn) {
                        if (title.includes('Social Network')) linkBtn.href = "https://nearby-students-rose.vercel.app";
                        else if (title.includes('Aetheris')) linkBtn.href = "https://aetheris-ai-iota.vercel.app";
                        else if (title.includes('SnyderAI')) linkBtn.href = "https://snyderai-mainsite.vercel.app";
                        else linkBtn.href = demoLink;
                    }
                } else {
                    linksContainer.classList.remove('active');
                }
            }
            modal.classList.add('active');
            gsap.from('.modal-content', { scale: 0.9, opacity: 0, duration: 0.3 });
        });
    });

    if (close) close.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
}



function initStats() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        ScrollTrigger.create({
            trigger: stat,
            start: "top 90%",
            onEnter: () => {
                let obj = { val: 0 };
                gsap.to(obj, { val: target, duration: 2, onUpdate: () => { stat.innerHTML = Math.floor(obj.val); } });
            }
        });
    });
}

function initAnimations() {
    gsap.set(".hero-text > *", { opacity: 1, y: 0, visibility: 'visible' });
    document.querySelectorAll('.reveal').forEach(el => {
        gsap.from(el, { y: 30, opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: "top 95%" } });
    });
    document.querySelectorAll('.btn, .theme-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }));
    });
}

function initThemeSwitch() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'midnight';
        let next = 'openai';
        if (current === 'openai') next = 'matrix';
        else if (current === 'matrix') next = 'midnight';
        document.documentElement.setAttribute('data-theme', next);

        if (particlesMaterial) {
            if (next === 'openai') particlesMaterial.color.set(0x10a37f);
            else if (next === 'midnight') particlesMaterial.color.set(0x00e5ff);
        }
        const threeCanvas = document.getElementById('canvas-bg');
        const matrixCanvas = document.getElementById('matrix-canvas');
        if (next === 'matrix') {
            if (threeCanvas) threeCanvas.style.opacity = '0';
            if (matrixCanvas) {
                matrixCanvas.style.opacity = '0.5';
                matrixCanvas.style.zIndex = '-1';
                initMatrixRain();
            }
        } else {
            if (matrixCanvas) {
                matrixCanvas.style.opacity = '0';
                matrixCanvas.style.zIndex = '-2';
                if (window.matrixInterval) clearInterval(window.matrixInterval);
            }
            if (threeCanvas) threeCanvas.style.opacity = '0.5';
        }
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) icon.className = theme === 'midnight' ? 'fas fa-moon' : (theme === 'openai' ? 'fas fa-brain' : 'fas fa-code');
}

function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]";
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops = [];
    for (let x = 0; x < columns; x++) drops[x] = Math.random() * -100;
    if (window.matrixInterval) clearInterval(window.matrixInterval);
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        ctx.fillStyle = primaryColor || '#0F0';
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    window.matrixInterval = setInterval(draw, 35);
}

function initTypewriter() {
    const typewriter = document.getElementById('typewriter');
    if (!typewriter) return;
    const words = ["AI Systems Builder", "LLM Developer", "Problem Solver"];
    let wordIndex = 0, charIndex = 0, isDeleting = false;
    function type() {
        const cur = words[wordIndex];
        typewriter.textContent = isDeleting ? cur.substring(0, charIndex - 1) : cur.substring(0, charIndex + 1);
        charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        let speed = isDeleting ? 40 : 80;
        if (!isDeleting && charIndex === cur.length) { isDeleting = true; speed = 1500; }
        else if (isDeleting && charIndex === 0) { isDeleting = false; wordIndex = (wordIndex + 1) % words.length; speed = 500; }
        setTimeout(type, speed);
    }
    type();
}

function initNavigation() {
    const btn = document.getElementById('mobile-menu');
    const links = document.querySelector('.nav-links');
    if (btn) btn.addEventListener('click', () => { links.classList.toggle('active'); btn.classList.toggle('is-active'); });
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) {
                window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                if (links && links.classList.contains('active')) { links.classList.remove('active'); btn.classList.remove('is-active'); }
            }
        });
    });
}

function initCursor() {
    const dot = document.querySelector('.cursor-dot'), out = document.querySelector('.cursor-outline');
    if (!dot || !out) return;
    window.addEventListener('mousemove', e => {
        gsap.set(dot, { x: e.clientX, y: e.clientY });
        gsap.to(out, { x: e.clientX, y: e.clientY, duration: 0.15 });
    });
    document.querySelectorAll('a, button, .project-card, .stat-card, #chat-toggle, .logo').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(out, { scale: 1.5, borderColor: 'var(--primary-color)', backgroundColor: 'rgba(255,255,255,0.05)', duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(out, { scale: 1, borderColor: 'var(--primary-color)', backgroundColor: 'transparent', duration: 0.3 }));
    });
}

function initChat() {
    const toggle = document.getElementById('chat-toggle');
    const window_ = document.getElementById('chat-window');
    const close = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const send = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');
    if (!toggle || !window_ || !input || !send) return;
    toggle.addEventListener('click', () => window_.classList.toggle('active'));
    close.addEventListener('click', () => window_.classList.remove('active'));
    const addMessage = (text, sender) => {
        const msg = document.createElement('div');
        msg.className = `msg ${sender}`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
        gsap.from(msg, { opacity: 0, y: 10, duration: 0.3 });
    };
    const getBotResponse = (input) => {
        const ui = input.toLowerCase();
        if (ui.includes('hello') || ui.includes('hi')) return "Hi there! How can I help you today?";
        if (ui.includes('project') || ui.includes('work')) return "Arman has built several premium projects like the SnyderAI Ecosystem, Aetheris AI, and a Jarvis-style assistant.";
        if (ui.includes('snyder')) return "SnyderAI is Arman's core ecosystem, hub for projects like Aetheris and SocialNet. You can view it live at snyderai-mainsite.vercel.app";
        return "That's interesting! I'm just a simple assistant, but Arman can tell you more.";
    };
    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';
        setTimeout(() => { addMessage(getBotResponse(text), 'bot'); }, 600);
    };
    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
}

function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            items.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

function initNeuralSkills() {
    fillContributionGraph();
    document.querySelectorAll('.neural-skill-item').forEach(item => {
        const fill = item.querySelector('.skill-bar-fill');
        const target = item.getAttribute('data-percent');
        ScrollTrigger.create({
            trigger: item,
            start: "top 90%",
            onEnter: () => { fill.style.width = target + '%'; }
        });
    });
}

function fillContributionGraph() {
    const graph = document.getElementById('contribution-graph');
    if (!graph) return;
    for (let i = 0; i < 280; i++) {
        const dot = document.createElement('div');
        const level = Math.floor(Math.random() * 5);
        dot.className = `dot ${level > 0 ? 'level-' + level : ''}`;
        graph.appendChild(dot);
    }
}

function initCursorTrail() {
    const canvas = document.getElementById('cursor-trail');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const chars = '01アイウエオカキクケコ#$%@!';
    const trail = [];
    window.addEventListener('mousemove', (e) => {
        trail.push({ x: e.clientX, y: e.clientY, char: chars[Math.floor(Math.random() * chars.length)], life: 1.0, size: Math.random() * 12 + 8 });
        if (trail.length > 20) trail.shift();
    });
    function drawTrail() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of trail) {
            ctx.globalAlpha = p.life * 0.6;
            ctx.fillStyle = '#00ff41';
            ctx.font = `${p.size}px 'Fira Code', monospace`;
            ctx.fillText(p.char, p.x, p.y);
            p.life -= 0.07;
        }
        requestAnimationFrame(drawTrail);
    }
    drawTrail();
}

function initTypingSound() {
    const input = document.getElementById('terminal-input');
    if (!input) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    let audioCtx = null;
    const playClick = () => {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(Math.random() * 200 + 400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.09);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.09);
    };
    input.addEventListener('keydown', (e) => {
        if (['Enter', 'Shift', 'Control', 'Alt', 'Tab'].includes(e.key)) return;
        playClick();
    });
}

function initMusic() {
    const toggle = document.getElementById('music-toggle');
    const audio = document.getElementById('bg-audio');
    if (!toggle || !audio) return;

    let isMuted = true; // State variable tracking if music is stopped

    const toggleMusic = () => {
        if (audio) {
            if (isMuted) {
                // Start playback (modern browsers require a user gesture first)
                audio.play().then(() => {
                    isMuted = false;
                    updateUI();
                }).catch(e => {
                    console.error("Audio play failed:", e);
                    alert("Please click anywhere on the page first to allow audio playback.");
                });
            } else {
                // Pause playback
                audio.pause();
                isMuted = true;
                updateUI();
            }
        }
    };

    const updateUI = () => {
        const icon = toggle.querySelector('i');
        if (isMuted) {
            icon.className = 'fas fa-volume-mute';
            icon.style.color = '#9ca3af'; // Gray-400
            toggle.title = "Play Music";
            toggle.classList.remove('playing');
        } else {
            icon.className = 'fas fa-volume-up';
            icon.style.color = '#00ff41'; // Matrix Green
            toggle.title = "Mute Music";
            toggle.classList.add('playing');
        }
    };

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
    });

    // Initialize UI
    updateUI();
}
