import { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import TextPressure from './components/TextPressure';
import './App.css';

function getSmoothPath(points) {
  if (!points || points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1);
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1);
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1);
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1);

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function App() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('keshavb895@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    setIsSubmitted(true);
  };

  const techContainerRef = useRef(null);
  const svgRef = useRef(null);
  const trackPathRef = useRef(null);
  const progressPathRef = useRef(null);
  const runnerRef = useRef(null);
  const glowRunnerRef = useRef(null);
  const totalLengthRef = useRef(0);
  const targetDistRef = useRef(0);

  useEffect(() => {
    // Initialize Lenis for luxurious momentum smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Compute dynamic path: straight from right of "Technologies I Used", then curved between images
    const updateCurvePath = () => {
      if (!techContainerRef.current || !trackPathRef.current || !progressPathRef.current || !svgRef.current) return;
      const container = techContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const w = containerRect.width;
      const h = containerRect.height;
      if (w === 0 || h === 0) return;

      svgRef.current.setAttribute('width', `${w}`);
      svgRef.current.setAttribute('height', `${h}`);
      svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const titleEl = container.querySelector('.tech-main-title');
      const rows = container.querySelectorAll('.tech-row');
      if (rows.length < 4 || !titleEl) return;

      const titleRect = titleEl.getBoundingClientRect();
      // Start point: directly to the right of "Technologies I Used"
      const startX = titleRect.right - containerRect.left + 25;
      const startY = titleRect.top - containerRect.top + titleRect.height / 2;

      // Straight line to the right
      const straightX = Math.max(startX + 60, w * 0.85);
      const straightY = startY;

      const getRelativeBox = (el) => {
        if (!el) return { x: w * 0.5, y: 0, left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left - containerRect.left + r.width / 2,
          y: r.top - containerRect.top + r.height / 2,
          left: r.left - containerRect.left,
          right: r.right - containerRect.left,
          top: r.top - containerRect.top,
          bottom: r.bottom - containerRect.top,
          width: r.width,
          height: r.height,
        };
      };

      // Get bounding boxes for the 4 technology images
      const r1Img = getRelativeBox(rows[0].querySelector('.tech-card-bezel'));
      const r2Img = getRelativeBox(rows[1].querySelector('.tech-card-bezel'));
      const r3Img = getRelativeBox(rows[2].querySelector('.tech-card-bezel'));
      const r4Img = getRelativeBox(rows[3].querySelector('.tech-card-bezel'));

      // 1. Straight horizontal segment from right of title
      // 2. Then curved path through the images:
      //    MongoDB (Left) -> Node.js (Right) -> React (Left) -> DevOps (Right)
      const curvePoints = [
        { x: straightX, y: straightY },
        // Smooth swoop down and across towards Image 1 (MongoDB on Left)
        { x: straightX + 15, y: straightY + (r1Img.top - straightY) * 0.35 },
        { x: (straightX + r1Img.x) / 2, y: straightY + (r1Img.top - straightY) * 0.7 },
        // Enters Image 1 (MongoDB on Left)
        { x: r1Img.x, y: r1Img.top },
        { x: r1Img.x, y: r1Img.y },
        { x: r1Img.x, y: r1Img.bottom },

        // Curves across from Image 1 (Left) to Image 2 (Right)
        { x: (r1Img.x + r2Img.x) / 2, y: (r1Img.bottom + r2Img.top) / 2 },

        // Enters Image 2 (Node.js on Right)
        { x: r2Img.x, y: r2Img.top },
        { x: r2Img.x, y: r2Img.y },
        { x: r2Img.x, y: r2Img.bottom },

        // Curves across from Image 2 (Right) to Image 3 (Left)
        { x: (r2Img.x + r3Img.x) / 2, y: (r2Img.bottom + r3Img.top) / 2 },

        // Enters Image 3 (React on Left)
        { x: r3Img.x, y: r3Img.top },
        { x: r3Img.x, y: r3Img.y },
        { x: r3Img.x, y: r3Img.bottom },

        // Curves across from Image 3 (Left) to Image 4 (Right)
        { x: (r3Img.x + r4Img.x) / 2, y: (r3Img.bottom + r4Img.top) / 2 },

        // Enters Image 4 (DevOps on Right) and traverses completely through top, center, and bottom
        { x: r4Img.x, y: r4Img.top },
        { x: r4Img.x, y: r4Img.y },
        { x: r4Img.x, y: r4Img.bottom },
        { x: r4Img.x, y: r4Img.bottom + 60 },
      ];

      // Form path: start with straight line L straightX straightY, then cubic spline C ...
      let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${straightX.toFixed(1)} ${straightY.toFixed(1)}`;
      for (let i = 0; i < curvePoints.length - 1; i++) {
        const p0 = curvePoints[i === 0 ? 0 : i - 1];
        const p1 = curvePoints[i];
        const p2 = curvePoints[i + 1];
        const p3 = curvePoints[i + 2] || p2;

        const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1);
        const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1);
        const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1);
        const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1);

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }

      trackPathRef.current.setAttribute('d', d);
      progressPathRef.current.setAttribute('d', d);

      const length = progressPathRef.current.getTotalLength();
      totalLengthRef.current = length;
      targetDistRef.current = r4Img.bottom + 60;
      progressPathRef.current.style.strokeDasharray = `${length}`;
      progressPathRef.current.style.strokeDashoffset = `${length}`;
    };

    // Smooth scroll-driven animation along the path
    const handleScroll = () => {
      if (!techContainerRef.current || !progressPathRef.current || !runnerRef.current || !totalLengthRef.current) return;
      const rect = techContainerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Starts when the title / top of section enters viewport (windowHeight * 0.75)
      // Completes when Image 4 (DevOps) bottom is reached and in view
      const targetDist = targetDistRef.current || (rect.height * 0.85);
      const totalDist = Math.max(1, targetDist - windowHeight * 0.05);
      const currentDist = (windowHeight * 0.75) - rect.top;

      let progress = currentDist / totalDist;

      // Guarantee 100% completion if user scrolls to/near bottom of page
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - windowHeight;
      if (maxScroll > 0 && scrollY >= maxScroll - 40) {
        progress = 1.0;
      }

      progress = Math.max(0, Math.min(1, progress));

      const totalLength = totalLengthRef.current;
      const drawLength = totalLength * progress;

      progressPathRef.current.style.strokeDashoffset = `${totalLength - drawLength}`;

      if (totalLength > 0) {
        const point = progressPathRef.current.getPointAtLength(drawLength);
        runnerRef.current.setAttribute('cx', point.x.toFixed(1));
        runnerRef.current.setAttribute('cy', point.y.toFixed(1));
        if (glowRunnerRef.current) {
          glowRunnerRef.current.setAttribute('cx', point.x.toFixed(1));
          glowRunnerRef.current.setAttribute('cy', point.y.toFixed(1));
        }
      }
    };

    let rafId;
    function raf(time) {
      lenis.raf(time);
      handleScroll();
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Initial setup and resize listeners
    updateCurvePath();
    handleScroll();

    const handleResize = () => {
      updateCurvePath();
      handleScroll();
    };

    lenis.on('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    const timer1 = setTimeout(handleResize, 150);
    const timer2 = setTimeout(handleResize, 500);

    // IntersectionObserver for scroll-reveal animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll('.tech-row');
    revealElements.forEach((el) => observer.observe(el));

    // Handle smooth anchor clicks with Lenis
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor) {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: 0, duration: 1.3 });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <>
      {/* Ambient Background & Grid */}
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-orb-1"></div>
        <div className="ambient-orb-2"></div>
        <div className="ambient-grid"></div>
      </div>

      <div className="portfolio-wrapper">
        {/* HERO SECTION */}
        <main className="hero-wrapper">
          {/* Top Navigation Bar */}
          <header className="hero-header">
            <div className="header-left">
              <div className="top-brand" aria-label="Flash Dev">
                <span>FLASH DEV</span>
              </div>
            </div>

            <div className="header-right">
              <a href="#contact" className="btn-contact" aria-label="Contact Me">
                <span>Contact Me</span>
              </a>
            </div>
          </header>

          {/* Center Section with FLASH */}
          <div className="hero-center">
            <div className="pressure-wrapper">
              <TextPressure
                text="FLASH"
                flex={true}
                scale={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#ffffff"
                minFontSize={72}
              />
            </div>
          </div>

          {/* Bottom Bar: Left Tagline, Center Scroll, Right CTA */}
          <footer className="hero-bottom-bar">
            <div className="bottom-left">
              <p className="hero-tagline">
                Full-Stack Developer with a track record of delivering for 10+ clients, currently documenting my journey in tech.
              </p>
            </div>

            <div className="bottom-center" aria-hidden="true">
              <span className="scroll-indicator">SCROLL</span>
            </div>

            <div className="bottom-right-actions">
              <a href="#work" className="btn-explore" aria-label="Explore Work">
                <span className="btn-explore-icon">↗</span>
                <span>Explore Work →</span>
              </a>
            </div>
          </footer>
        </main>

        {/* PROJECTS SECTION */}
        <section id="work" className="projects-section">
          <div className="projects-header">
            <h2 className="projects-heading">My Projects</h2>
          </div>

          <div className="projects-images-container">
            {/* Project 1: Flash Jewels */}
            <a 
              href="https://jewellery-lime-three.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-image-link"
              aria-label="Visit Flash Jewels website"
            >
              <img 
                src="/projects/project1.png" 
                alt="Flash Jewels" 
                className="project-image" 
              />
            </a>

            {/* Project 2: VG Portfolio */}
            <a 
              href="https://personal-portfolio-two-blush-81.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="project-image-link"
              aria-label="Visit Vaibhav Gupta portfolio website"
            >
              <img 
                src="/projects/project2.png" 
                alt="Vaibhav Gupta Portfolio" 
                className="project-image" 
              />
            </a>
          </div>
        </section>

        {/* TECHNOLOGIES SECTION (Alternating MERN Stack on Scroll) */}
        <section id="technologies" className="technologies-section">
          <div className="tech-container" ref={techContainerRef}>
            {/* SVG Path Weaving from Right of Title through Images */}
            <svg 
              className="tech-svg-canvas" 
              aria-hidden="true"
              ref={svgRef}
            >
              <defs>
                <linearGradient id="techPathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="25%" stopColor="#06b6d4" />
                  <stop offset="60%" stopColor="#6366f1" />
                  <stop offset="85%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <radialGradient id="runnerCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>

                <filter id="laserGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Faint Background Guide Track */}
              <path
                ref={trackPathRef}
                className="tech-path-track"
                fill="none"
              />

              {/* Active Glowing Scroll Progress Path */}
              <path
                ref={progressPathRef}
                className="tech-path-progress"
                fill="none"
                filter="url(#laserGlowFilter)"
              />

              {/* Moving Energy Orb along the curve */}
              <circle
                ref={glowRunnerRef}
                r="24"
                fill="url(#runnerCoreGlow)"
                filter="url(#laserGlowFilter)"
              />
              <circle
                ref={runnerRef}
                r="7"
                fill="#ffffff"
              />
            </svg>

            {/* Section Header */}
            <div className="tech-header">
              <h2 className="tech-main-title">Technologies I Used</h2>
            </div>

            {/* Alternating Tech Rows */}
            <div className="tech-rows-wrapper">
              {/* Row 1: MongoDB (Image Left, Text Right) */}
              <div className="tech-row row-image-left">
                <div className="tech-visual-col tech-reveal-left">
                  <div className="tech-card-bezel">
                    <div className="tech-image-card">
                      <img 
                        src="/technologies/mongodb.jpg" 
                        alt="MongoDB Database Architecture" 
                        className="tech-showcase-img"
                      />
                    </div>
                  </div>
                </div>

                <div className="tech-text-col tech-reveal-right">
                  <h3 className="tech-item-title">MongoDB & Data Modeling</h3>
                  <ul className="tech-bullet-list">
                    <li>Schema design, indexing strategies, and aggregation pipelines</li>
                    <li>Mongoose ORM modeling and high-throughput query optimization</li>
                    <li>Handling data persistence for high-concurrency production apps</li>
                    <li>Database clustering, security, and Atlas AWS deployment</li>
                  </ul>
                </div>
              </div>

              {/* Row 2: Express.js & Node.js (Text Left, Image Right) */}
              <div className="tech-row row-image-right">
                <div className="tech-text-col tech-reveal-left">
                  <h3 className="tech-item-title">Express.js & Node.js Server Architecture</h3>
                  <ul className="tech-bullet-list">
                    <li>Scalable RESTful API engineering and event-driven microservices</li>
                    <li>JWT / OAuth authentication, rate limiting, and custom middleware</li>
                    <li>Live bi-directional client communications with WebSockets & Socket.io</li>
                    <li>Asynchronous runtime workflows and optimized server performance</li>
                  </ul>
                </div>

                <div className="tech-visual-col tech-reveal-right">
                  <div className="tech-card-bezel">
                    <div className="tech-image-card">
                      <img 
                        src="/technologies/node.jpg" 
                        alt="Node.js & Express Server Architecture" 
                        className="tech-showcase-img"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: React & Modern Client (Image Left, Text Right) */}
              <div className="tech-row row-image-left">
                <div className="tech-visual-col tech-reveal-left">
                  <div className="tech-card-bezel">
                    <div className="tech-image-card">
                      <img 
                        src="/technologies/react.jpg" 
                        alt="React & Reactive Interfaces" 
                        className="tech-showcase-img"
                      />
                    </div>
                  </div>
                </div>

                <div className="tech-text-col tech-reveal-right">
                  <h3 className="tech-item-title">React & Reactive Interfaces</h3>
                  <ul className="tech-bullet-list">
                    <li>Fluid, high-performance user interfaces with React 19 & Next.js</li>
                    <li>Custom hooks, atomic state management, and server components</li>
                    <li>GPU-accelerated micro-animations with GSAP and Framer Motion</li>
                    <li>Responsive, accessible design systems tailored for all viewports</li>
                  </ul>
                </div>
              </div>

              {/* Row 4: Full Stack Integration & DevOps (Text Left, Image Right) */}
              <div className="tech-row row-image-right">
                <div className="tech-text-col tech-reveal-left">
                  <h3 className="tech-item-title">End-to-End MERN Deployment & DevOps</h3>
                  <ul className="tech-bullet-list">
                    <li>Full-stack containerization with Docker and multi-stage builds</li>
                    <li>Automated CI/CD deployment pipelines on Vercel and cloud platforms</li>
                    <li>End-to-end type safety, API validation, and testing workflows</li>
                    <li>Production server monitoring, health checks, and 99.99% uptime metrics</li>
                  </ul>
                </div>

                <div className="tech-visual-col tech-reveal-right">
                  <div className="tech-card-bezel">
                    <div className="tech-image-card">
                      <img 
                        src="/technologies/devops.jpg" 
                        alt="End-to-End MERN Deployment & DevOps" 
                        className="tech-showcase-img"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="contact-section">
          <div className="contact-container">
            {/* Left Column: Direct channels, availability, and socials */}
            <div className="contact-info-col">
              <div className="contact-status-badge">
                <span className="tech-status-dot green-pulse"></span>
                <span>Available for new opportunities</span>
              </div>

              <h2 className="contact-headline">
                Let’s Build Something <span className="text-gradient">Exceptional</span>
              </h2>

              <p className="contact-subtext">
                Have a project in mind, an engineering role to discuss, or just want to connect? Send me a message or reach out directly through any channel below.
              </p>

              {/* Direct Email Card with 1-Click Copy */}
              <div className="contact-email-card">
                <div className="contact-email-details">
                  <span className="contact-card-label">DIRECT EMAIL</span>
                  <a href="mailto:keshavb895@gmail.com" className="contact-email-link">
                    keshavb895@gmail.com
                  </a>
                </div>
                <button
                  type="button"
                  className="btn-copy-email"
                  onClick={handleCopyEmail}
                  aria-label="Copy email address"
                >
                  {copiedEmail ? (
                    <>
                      <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Channels */}
              <div className="contact-socials">
                <span className="contact-card-label">SOCIAL PROFILES</span>
                <div className="social-links-row">
                  <a
                    href="https://github.com/Keshavb895"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-pill"
                    aria-label="GitHub Profile"
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-pill"
                    aria-label="LinkedIn Profile"
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-pill"
                    aria-label="X / Twitter Profile"
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Twitter</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form */}
            <div className="contact-form-col">
              <div className="contact-card-bezel">
                <div className="contact-card-inner">
                  {isSubmitted ? (
                    <div className="form-success-state">
                      <div className="success-icon-wrap">
                        <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <h3 className="success-title">Message Received!</h3>
                      <p className="success-desc">
                        Thank you for reaching out. I’ll review your note and get back to you within 24 hours.
                      </p>
                      <button
                        type="button"
                        className="btn-send-another"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormState({ name: '', email: '', subject: '', message: '' });
                        }}
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="contact-form">
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label htmlFor="contact-name" className="form-label">Your Name</label>
                          <input
                            type="text"
                            id="contact-name"
                            required
                            placeholder="John Doe"
                            className="form-input"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="contact-email" className="form-label">Email Address</label>
                          <input
                            type="email"
                            id="contact-email"
                            required
                            placeholder="john@example.com"
                            className="form-input"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-subject" className="form-label">Subject / Project Type</label>
                        <input
                          type="text"
                          id="contact-subject"
                          placeholder="Full-Stack Web App / Freelance / Job Opportunity"
                          className="form-input"
                          value={formState.subject}
                          onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="contact-message" className="form-label">Your Message</label>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          placeholder="Tell me about your project, timeline, or requirements..."
                          className="form-textarea"
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        ></textarea>
                      </div>

                      <button type="submit" className="btn-submit-contact">
                        <span>Send Message</span>
                        <svg className="btn-submit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SITE FOOTER */}
        <footer className="site-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span className="footer-brand">FLASH DEV</span>
              <span className="footer-copy">© {new Date().getFullYear()} Flash Dev. All rights reserved.</span>
            </div>
            <div className="footer-right">
              <a href="#" className="footer-back-to-top" aria-label="Back to top">
                <span>Back to Top</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;

