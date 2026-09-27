import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/* ============================================================
   FANDOMVERSE — "Ignition" cinematic experience
   Deep-space void + a single ember signal color, real WebGL
   particle/wireframe scene in the hero (Three.js r128-compatible
   API only — no OrbitControls / no CapsuleGeometry), a persistent
   canvas2D ember field drifting behind every section, and a
   glow-driven visual language instead of flat hairlines.
   ============================================================ */

const CSS = `
  .twz {
    --void: #05070c; --void-2: #0c1018; --void-deep: #020305;
    --mist: #dbe2ea; --mist-dim: #7c8896; --mist-faint: #232b36;
    --ember: #ff6a2b; --ember-bright: #ffb37a; --spark: #ffd9a8;
    background: var(--void); color: var(--mist);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative; isolation: isolate;
  }
  .twz * { box-sizing: border-box; }
  .twz .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: 0.04em; }
  .twz .dim { color: var(--mist-dim); }
  .twz .ember-text { color: var(--ember-bright); text-shadow: 0 0 18px rgba(255,106,43,.65), 0 0 46px rgba(255,106,43,.3); }
  .twz .glow-heading { text-shadow: 0 0 40px rgba(255,106,43,.18); }
  .twz .bg-layer { position: fixed; inset: 0; pointer-events: none; }
  .twz .content-layer { position: relative; z-index: 3; }
  .twz .grain {
    position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: .05; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .twz .vignette { position: fixed; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(ellipse at 50% 40%, transparent 35%, rgba(2,3,5,.7) 100%); }
  .twz .nebula { position: fixed; inset: -20%; z-index: 0; pointer-events: none; filter: blur(80px); opacity: .5; }
  .twz .nebula i { position:absolute; border-radius:50%; display:block; }
  .twz .nebula .n1 { width: 44vw; height: 44vw; left: -6vw; top: 4vh; background: radial-gradient(circle, rgba(255,106,43,.34), transparent 68%); animation: drift1 26s ease-in-out infinite; }
  .twz .nebula .n2 { width: 38vw; height: 38vw; right: -4vw; top: 38vh; background: radial-gradient(circle, rgba(120,80,255,.2), transparent 68%); animation: drift2 32s ease-in-out infinite; }
  .twz .nebula .n3 { width: 30vw; height: 30vw; left: 32vw; bottom: -6vh; background: radial-gradient(circle, rgba(255,179,122,.18), transparent 70%); animation: drift3 24s ease-in-out infinite; }
  @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6vw,-4vh) scale(1.14); } }
  @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1.06); } 50% { transform: translate(-5vw,5vh) scale(.92); } }
  @keyframes drift3 { 0%,100% { transform: translate(0,0) scale(.95); } 50% { transform: translate(4vw,-6vh) scale(1.2); } }
  .twz .beam { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, var(--mist-faint) 15%, var(--mist-faint) 85%, transparent); position: relative; }
  .twz .beam::after { content:''; position:absolute; inset:0; background: linear-gradient(90deg, transparent, var(--ember) 50%, transparent); opacity: .35; filter: blur(1px); }
  .twz .reveal { opacity: 0; transform: translateY(22px); transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1); }
  .twz .reveal.in { opacity: 1; transform: translateY(0); }
  .twz .word-wrap { display:inline-block; overflow:hidden; padding-bottom:.1em; vertical-align:bottom; }
  .twz .word { display:inline-block; transform: translateY(115%); transition: transform .9s cubic-bezier(.16,1,.3,1); }
  .twz .word.in { transform: translateY(0); }
  .twz .btn { font-family:'IBM Plex Mono'; font-size:.8rem; letter-spacing:.05em; padding: 1rem 2.2rem; display:inline-flex; align-items:center; position:relative; transition: transform .25s cubic-bezier(.2,.8,.3,1); text-transform: uppercase; }
  .twz .btn-solid { background: var(--ember); color: #170a03; box-shadow: 0 0 0 rgba(255,106,43,0); transition: box-shadow .4s, transform .25s; }
  .twz .btn-solid:hover { box-shadow: 0 0 40px rgba(255,106,43,.55); }
  .twz .btn-ghost { border: 1px solid var(--mist-faint); color: var(--mist); }
  .twz .btn-ghost:hover { border-color: var(--ember); color: var(--ember-bright); box-shadow: 0 0 24px rgba(255,106,43,.25); }
  .twz .track-row { border-top: 1px solid var(--mist-faint); transition: background .3s; }
  .twz .track-row:hover { background: linear-gradient(90deg, rgba(255,106,43,.06), transparent 60%); }
  .twz .filter-btn { font-family:'IBM Plex Mono'; font-size:.72rem; padding:.55rem 1.1rem; border:1px solid var(--mist-faint); color: var(--mist-dim); transition: all .25s; text-transform: uppercase; letter-spacing:.04em; }
  .twz .filter-btn.active { border-color: var(--ember); color: var(--ember-bright); box-shadow: 0 0 18px rgba(255,106,43,.3) inset; }
  .twz .bar-track { height:2px; background: var(--mist-faint); width:100%; position:relative; }
  .twz .bar-fill { height:100%; background: var(--ember); width:0%; transition: width 1.1s cubic-bezier(.16,1,.3,1); box-shadow: 0 0 12px var(--ember); }
  .twz .jury-row { border-top:1px solid var(--mist-faint); cursor: default; transition: background .3s; }
  .twz .jury-row:hover, .twz .jury-row.open { background: linear-gradient(90deg, rgba(255,106,43,.05), transparent 70%); }
  .twz .jury-detail { max-height:0; opacity:0; overflow:hidden; transition: max-height .4s cubic-bezier(.16,1,.3,1), opacity .35s; }
  .twz .jury-row.open .jury-detail { max-height: 140px; opacity:1; }
  .twz .avatar-ring { width: 44px; height:44px; border-radius:50%; border: 1px solid var(--mist-faint); display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono'; font-size:12px; transition: border-color .3s, box-shadow .3s; flex-shrink:0; }
  .twz .jury-row.open .avatar-ring, .twz .jury-row:hover .avatar-ring { border-color: var(--ember); box-shadow: 0 0 20px rgba(255,106,43,.4); color: var(--ember-bright); }
  .twz .index-overlay { position:fixed; inset:0; background: rgba(2,3,5,.97); z-index:50; display:flex; flex-direction:column; justify-content:center; padding: 0 4vw; clip-path: inset(0 0 100% 0); transition: clip-path .65s cubic-bezier(.76,0,.24,1); backdrop-filter: blur(6px); }
  .twz .index-overlay.open { clip-path: inset(0 0 0% 0); }
  .twz .index-item { border-bottom:1px solid var(--mist-faint); padding: 1.1rem 0; display:flex; align-items:baseline; gap:1.5rem; opacity:0; transform: translateY(20px); transition: opacity .5s, transform .5s, border-color .25s, padding-left .3s; cursor:pointer; }
  .twz .index-overlay.open .index-item { opacity:1; transform: translateY(0); }
  .twz .index-item:hover { border-color: var(--ember); padding-left: 12px; }
  .twz .index-item:hover .idx-label, .twz .index-item:hover .idx-title { color: var(--ember-bright); text-shadow: 0 0 24px rgba(255,106,43,.5); }
  .twz .hamburger span { display:block; height:1px; width:22px; background: currentColor; transition: transform .3s, opacity .3s; }
  .twz .header-bar { border-bottom: 1px solid transparent; }
  .twz .header-links button:hover { color: var(--ember-bright) !important; }
  .twz .header-cta:hover { box-shadow: 0 0 30px rgba(255,106,43,.5); }
  @media (max-width: 900px) {
    .twz .header-links { display: none; }
  }
  @media (max-width: 560px) {
    .twz .header-cta { display: none; }
  }
  .twz .pulse-ring { position:absolute; border-radius:50%; border:1px solid var(--ember); opacity:0; animation: pulseRing 3.2s ease-out infinite; }
  @keyframes pulseRing { 0% { transform: scale(.4); opacity:.5; } 100% { transform: scale(2.4); opacity:0; } }
  .twz .status-dot { width:6px; height:6px; border-radius:50%; background: var(--ember); box-shadow: 0 0 10px var(--ember); display:inline-block; animation: dotPulse 2.4s ease-in-out infinite; }
  @keyframes dotPulse { 0%,100% { opacity:1; } 50% { opacity:.35; } }
  .twz h1, .twz h2, .twz h3 { font-weight: 300; }
  .twz section { scroll-margin-top: 68px; }
  .twz .stage-copy { position:absolute; left:1.5rem; top:58%; max-width: 32rem; opacity:0; transform: translateY(16px); transition: opacity .45s, transform .45s; pointer-events:none; }
  .twz .stage-copy.active { opacity:1; transform: translateY(0); }
  .twz .timeline-track::-webkit-scrollbar { height: 4px; }
  .twz .timeline-track::-webkit-scrollbar-thumb { background: var(--mist-faint); }
  @media (prefers-reduced-motion: reduce) {
    .twz .reveal, .twz .word { transition: none !important; opacity:1 !important; transform:none !important; }
    .twz .pulse-ring, .twz .status-dot { animation: none !important; }
    .twz .nebula i { animation: none !important; }
  }
`;

/* ---------- generic hooks ---------- */

function usePrefersReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const upd = () => setRm(mql.matches);
    upd();
    mql.addEventListener("change", upd);
    return () => mql.removeEventListener("change", upd);
  }, []);
  return rm;
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function RevealWords({ text, className = "", delay = 0, stagger = 0.04 }) {
  const [ref, inView] = useInView();
  const words = text.split(" ");
  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span className="word-wrap" key={i}>
          <span className={`word ${inView ? "in" : ""}`} style={{ transitionDelay: `${delay + i * stagger}s` }}>
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

function AnimatedNumber({ value, suffix = "", className = "" }) {
  const [ref, inView] = useInView();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf;
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

function Magnetic({ children, className = "" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
    setStyle({ transform: `translate(${x}px, ${y}px)` });
  };
  const onLeave = () => setStyle({ transform: "translate(0,0)" });
  return (
    <span ref={ref} className={className} style={{ display: "inline-block", transition: "transform .25s cubic-bezier(.2,.8,.3,1)", ...style }} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </span>
  );
}

/* ---------- ambient ember field (canvas2D, spans whole page) ---------- */

function EmberField() {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w, h, particles, raf;
    const isSmall = window.innerWidth < 768;
    const COUNT = isSmall ? 34 : 78;
    const LINK_DIST = isSmall ? 110 : 150;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();

    particles = new Array(COUNT).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.06,
      a: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.75 ? "255,179,122" : "255,106,43",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // constellation links — drawn first so embers sit on top
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const strength = (1 - dist / LINK_DIST) * 0.18;
            ctx.strokeStyle = `rgba(255,106,43,${strength})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // gentle cursor repulsion — the field parts around the pointer
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 130 && mdist > 0.1) {
          const push = (1 - mdist / 130) * 0.9;
          p.x += (mdx / mdist) * push;
          p.y += (mdy / mdist) * push;
        }

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.y > h + 10) p.y = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        grad.addColorStop(0, `rgba(${p.hue},${p.a})`);
        grad.addColorStop(1, `rgba(${p.hue},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    if (!reducedMotion && !isSmall) {
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseout", onLeave);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="bg-layer" style={{ zIndex: 0, opacity: 0.9 }} />;
}

/* ---------- hero 3D core (Three.js) ---------- */

function CoreScene() {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer, scene, camera, group, particles, raf;
    let startTime = performance.now();
    let disposed = false;

    try {
      const w = mount.clientWidth || 600;
      const h = mount.clientHeight || 600;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      mount.appendChild(renderer.domElement);

      group = new THREE.Group();
      scene.add(group);

      const emberColor = new THREE.Color("#ff6a2b");
      const spark = new THREE.Color("#ffd9a8");

      // layered wireframe "core" — poor-man's bloom via nested scaled shells
      const layers = [
        { scale: 1, opacity: 0.9 },
        { scale: 1.16, opacity: 0.32 },
        { scale: 1.34, opacity: 0.14 },
      ];
      layers.forEach((l) => {
        const geo = new THREE.IcosahedronGeometry(1.7, 1);
        const wire = new THREE.WireframeGeometry(geo);
        const mat = new THREE.LineBasicMaterial({ color: emberColor, transparent: true, opacity: l.opacity });
        const mesh = new THREE.LineSegments(wire, mat);
        mesh.scale.setScalar(l.scale);
        group.add(mesh);
      });

      // bright reactor core
      const coreGeo = new THREE.IcosahedronGeometry(0.32, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: spark, transparent: true, opacity: 0.9 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      // particle shell that assembles inward on load
      const M = 900;
      const dirs = new Float32Array(M * 3);
      const startR = new Float32Array(M);
      const targetR = new Float32Array(M);
      const positions = new Float32Array(M * 3);
      for (let i = 0; i < M; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dx = Math.sin(phi) * Math.cos(theta);
        const dy = Math.sin(phi) * Math.sin(theta);
        const dz = Math.cos(phi);
        dirs[i * 3] = dx; dirs[i * 3 + 1] = dy; dirs[i * 3 + 2] = dz;
        targetR[i] = 2.1 + Math.random() * 0.35;
        startR[i] = targetR[i] + 2.5 + Math.random() * 3;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: spark, size: 0.028, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      });
      const points = new THREE.Points(pGeo, pMat);
      group.add(points);
      particles = { points, dirs, startR, targetR, positions, pGeo };

      const ASSEMBLE_MS = reducedMotion ? 1 : 2200;
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const animate = () => {
        if (disposed) return;
        const now = performance.now();
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / ASSEMBLE_MS);
        const eased = easeOutCubic(t);

        for (let i = 0; i < M; i++) {
          const r = particles.startR[i] + (particles.targetR[i] - particles.startR[i]) * eased;
          particles.positions[i * 3] = particles.dirs[i * 3] * r;
          particles.positions[i * 3 + 1] = particles.dirs[i * 3 + 1] * r;
          particles.positions[i * 3 + 2] = particles.dirs[i * 3 + 2] * r;
        }
        particles.pGeo.attributes.position.needsUpdate = true;

        if (!reducedMotion) {
          const scrollP = Math.min(1, window.scrollY / (window.innerHeight * 0.85));
          group.rotation.y = elapsed * 0.00022 * (1 + scrollP * 2.2);
          group.rotation.x = Math.sin(elapsed * 0.00015) * 0.15;
          const s = 1 - scrollP * 0.3;
          group.scale.setScalar(s);
          mount.style.opacity = String(1 - scrollP * 0.9);
          core.material.opacity = 0.7 + Math.sin(elapsed * 0.003) * 0.25;
        }

        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        const nw = mount.clientWidth || 600;
        const nh = mount.clientHeight || 600;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener("resize", onResize);

      return () => {
        disposed = true;
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(raf);
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    } catch (e) {
      setFailed(true);
    }
  }, [reducedMotion]);

  if (failed) {
    return (
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,106,43,.5), transparent 70%)",
        filter: "blur(2px)",
      }} />
    );
  }

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
}

/* ---------- data ---------- */

const SECTIONS = [
  { id: "intro", code: "01", label: "Brief" },
  { id: "hub", code: "02", label: "Tracks" },
  { id: "process", code: "03", label: "Process" },
  { id: "numbers", code: "04", label: "Numbers" },
  { id: "timeline", code: "05", label: "Timeline" },
  { id: "jury", code: "06", label: "Jury" },
  { id: "enter", code: "07", label: "Enter" },
];

const TRACKS = [
  { id: "web", name: "Web & Mobile Apps", group: "Software", diff: "Open", note: "Ship a product people can actually use on day one." },
  { id: "ai", name: "Applied AI", group: "Software", diff: "Advanced", note: "Wrap a model in something that solves a real problem." },
  { id: "sec", name: "Cybersecurity", group: "Software", diff: "Advanced", note: "Break something safely, then show us how you'd fix it." },
  { id: "iot", name: "Hardware & IoT", group: "Hardware", diff: "Open", note: "Sensors, boards, and something that moves or lights up." },
  { id: "robo", name: "Robotics", group: "Hardware", diff: "Advanced", note: "Bring your own chassis or build one from the kit list." },
  { id: "data", name: "Data & Analytics", group: "Data", diff: "Open", note: "Find the story hiding in a dataset nobody has cleaned." },
  { id: "viz", name: "Data Visualization", group: "Data", diff: "Open", note: "Make a dashboard someone would choose to look at." },
];

const STAGES = [
  { code: "01", title: "Register", body: "Form a team of two to four, pick a track, claim your slot." },
  { code: "02", title: "Build", body: "Five weeks. Weekly check-ins with a mentor who has shipped production code." },
  { code: "03", title: "Review", body: "Submit mid-way for a working-draft review before demo day." },
  { code: "04", title: "Demo", body: "Ten minutes in front of the jury. They run your build, not your slides." },
  { code: "05", title: "Award", body: "Winners announced by track. Every finalist keeps the hardware they used." },
];

const MILESTONES = [
  { date: "14 SEP", label: "Registration opens", note: "Teams claim a track and a slot." },
  { date: "30 SEP", label: "Registration closes", note: "Rosters lock at 23:59." },
  { date: "14 OCT", label: "Mid-build review", note: "Submit a working draft for feedback." },
  { date: "01 NOV", label: "Build freeze", note: "No new features — polish only." },
  { date: "08 NOV", label: "Demo day", note: "Ten-minute live sessions with the jury." },
  { date: "12 NOV", label: "Awards", note: "Results published by track." },
];

const JURY = [
  { initials: "AH", name: "Amira Haddad", role: "Staff Engineer, fintech infra", focus: "Web & Mobile, Cybersecurity", note: "Will ask what happens when your API times out mid-demo." },
  { initials: "RM", name: "Rohan Mehta", role: "ML Lead, healthcare analytics", focus: "Applied AI, Data & Analytics", note: "Cares more about your eval set than your model card." },
  { initials: "SL", name: "Sofia Lindqvist", role: "Embedded Systems Consultant", focus: "Hardware & IoT, Robotics", note: "Will pick up your board and look at the soldering." },
  { initials: "DO", name: "Daniel Osei", role: "Security Researcher", focus: "Cybersecurity, Applied AI", note: "Has already found the bug in your auth flow." },
];

/* ---------- nav ---------- */

function Nav({ active, scrollTo }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const linksRef = useRef({});
  const [underline, setUnderline] = useState({ left: 0, width: 0, opacity: 0 });
  const navLinks = SECTIONS.filter((s) => s.id !== "enter");

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setScrolled(window.scrollY > 40);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = linksRef.current[active];
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth, opacity: 1 });
    else setUnderline((u) => ({ ...u, opacity: 0 }));
  }, [active]);

  return (
    <>
      <header
        className="mono header-bar"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 45,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 4vw", height: 68,
          background: scrolled ? "rgba(5,7,12,.72)" : "linear-gradient(rgba(5,7,12,.5), transparent)",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          transition: "background .4s, backdrop-filter .4s",
        }}
      >
        <button onClick={() => scrollTo("hero")} style={{ fontSize: 12, color: "var(--mist)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="status-dot" /> FANDOMVERSE <span className="dim">/ rev.05</span>
        </button>

        <nav className="header-links" style={{ position: "relative" }}>
          {navLinks.map((s) => (
            <button
              key={s.id}
              ref={(el) => { linksRef.current[s.id] = el; }}
              onClick={() => scrollTo(s.id)}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 11.5, padding: "10px 14px",
                color: active === s.id ? "var(--ember-bright)" : "var(--mist-dim)",
                textTransform: "uppercase", letterSpacing: ".05em", transition: "color .3s",
              }}
            >
              {s.label}
            </button>
          ))}
          <span
            style={{
              position: "absolute", bottom: 2, height: 2, borderRadius: 2,
              background: "var(--ember)", boxShadow: "0 0 10px var(--ember)",
              transition: "left .35s cubic-bezier(.16,1,.3,1), width .35s cubic-bezier(.16,1,.3,1), opacity .3s",
              left: underline.left, width: underline.width, opacity: underline.opacity,
            }}
          />
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={() => scrollTo("enter")} className="btn btn-solid header-cta" style={{ padding: ".55rem 1.3rem", fontSize: 10.5 }}>
            Register
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--mist)", background: "none", border: "none", cursor: "pointer" }}
          >
            <span>{open ? "CLOSE" : "INDEX"}</span>
            <span className="hamburger" style={{ display: "flex", flexDirection: "column", gap: 5, width: 22 }}>
              <span style={{ transform: open ? "rotate(45deg) translateY(6px)" : "none" }} />
              <span style={{ opacity: open ? 0 : 1 }} />
              <span style={{ transform: open ? "rotate(-45deg) translateY(-6px)" : "none" }} />
            </span>
          </button>
        </div>

        <span
          aria-hidden="true"
          style={{
            position: "absolute", left: 0, bottom: 0, height: 1, width: `${progress * 100}%`,
            background: "var(--ember)", boxShadow: "0 0 8px var(--ember)", transition: "width .1s linear",
          }}
        />
      </header>

      <div className={`index-overlay ${open ? "open" : ""}`}>
        {SECTIONS.map((s, i) => (
          <div
            key={s.id}
            className="index-item"
            style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
            onClick={() => { scrollTo(s.id); setOpen(false); }}
          >
            <span className="mono idx-label dim" style={{ fontSize: 14 }}>{s.code}</span>
            <span className="idx-title" style={{ fontSize: "clamp(1.8rem,5vw,3.6rem)", fontWeight: 300, transition: "color .3s, text-shadow .3s" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "7rem 4vw 2.5rem", overflow: "hidden" }}>
      <div style={{ position: "relative", flex: 1, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20, alignItems: "center" }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <p className="mono dim" style={{ fontSize: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="status-dot" /> APTECH INTERNATIONAL — ANNUAL COMPETITION
          </p>
          <h1 className="glow-heading" style={{ fontSize: "clamp(2.7rem,5.6vw,4.8rem)", lineHeight: 0.98, letterSpacing: "-0.01em" }}>
            <RevealWords text="Build the thing" delay={0.1} /><br />
            <RevealWords text="that shouldn't" delay={0.35} /><br />
            <span className="ember-text"><RevealWords text="exist yet." delay={0.6} /></span>
          </h1>
          <Reveal delay={0.9}>
            <p className="dim" style={{ marginTop: 28, maxWidth: "46ch", fontSize: "1.15rem", fontWeight: 300 }}>
              FANDOMVERSE is a five-week build competition for students who'd rather ship a working prototype than
              write another slide deck. Pick a track, form a team, present to a jury of working engineers.
            </p>
          </Reveal>
          <Reveal delay={1.05}>
            <div style={{ marginTop: 36, display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Magnetic><span className="btn btn-solid">Register a team</span></Magnetic>
              <Magnetic><span className="btn btn-ghost">View the brief</span></Magnetic>
            </div>
          </Reveal>
        </div>
        <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", maxHeight: 560 }}>
          <CoreScene />
        </div>
      </div>
      <Reveal delay={1.3}>
        <div className="mono dim beam" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingTop: 18, fontSize: 11 }}>
          <span>SUBMISSIONS OPEN — 14 SEP</span>
          <span>DOHA · REMOTE-FRIENDLY</span>
          <span>SCROLL TO BEGIN ↓</span>
        </div>
      </Reveal>
    </section>
  );
}

/* ---------- intro ---------- */

function Intro() {
  const facts = [
    { k: "Format", v: "Team build, 5 weeks" },
    { k: "Team size", v: "2 – 4 students" },
    { k: "Eligibility", v: "Enrolled Aptech students" },
    { k: "Cost", v: "Free to enter" },
  ];
  return (
    <section id="intro" style={{ padding: "6rem 4vw" }}>
      <div className="beam" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 48, marginTop: 48 }}>
        <Reveal><span className="mono ember-text" style={{ fontSize: 12 }}>01 / Brief</span></Reveal>
        <div>
          <Reveal>
            <p style={{ fontSize: "clamp(1.6rem,3vw,2.6rem)", fontWeight: 300, lineHeight: 1.25 }}>
              Most competitions reward the pitch. FANDOMVERSE rewards the thing that runs. Five weeks turning a rough
              idea into a working prototype, then defending it in front of people who build software for a living.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="dim" style={{ marginTop: 28, maxWidth: "62ch", fontSize: "1.1rem", fontWeight: 300 }}>
              No case studies, no theoretical frameworks. Every track ends with a live demo — budget your five
              weeks accordingly.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, paddingTop: 28 }}>
              <div style={{ gridColumn: "1 / -1" }}><div className="beam" /></div>
              {facts.map((f) => (
                <div key={f.k}>
                  <div className="mono dim" style={{ fontSize: 11 }}>{f.k}</div>
                  <div style={{ marginTop: 8, fontSize: "1.1rem", fontWeight: 300 }}>{f.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- hub ---------- */

function Hub() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Software", "Hardware", "Data"];
  const visible = useMemo(() => (filter === "All" ? TRACKS : TRACKS.filter((t) => t.group === filter)), [filter]);

  return (
    <section id="hub" style={{ padding: "6rem 4vw" }}>
      <div className="beam" />
      <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 28, marginBottom: 44 }}>
        <Reveal>
          <span className="mono ember-text" style={{ fontSize: 12 }}>02 / Tracks</span>
          <h2 style={{ marginTop: 14, maxWidth: 560, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 300 }}>
            Seven tracks. Pick the one your team is excited to lose sleep over.
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? "active" : ""}`} style={{ background: "none", cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div>
        {visible.map((t) => (
          <div key={t.id} className="track-row" style={{ display: "grid", gridTemplateColumns: "0.8fr 2.5fr 4fr 0.8fr", gap: 16, padding: "1.4rem 0.6rem", alignItems: "baseline" }}>
            <span className="mono dim" style={{ fontSize: 12 }}>{t.group}</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 300 }}>{t.name}</span>
            <span className="dim" style={{ fontSize: 14, fontWeight: 300 }}>{t.note}</span>
            <span className="mono dim" style={{ fontSize: 11, textAlign: "right" }}>{t.diff}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- process (scroll-pinned) ---------- */

function Process() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const n = STAGES.length;

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        setProgress(p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeIndex = Math.min(n - 1, Math.floor(progress * n));

  return (
    <section id="process" ref={containerRef} style={{ position: "relative", height: `${n * 100}vh` }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", padding: "68px 4vw 0", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
        <div className="beam" />
        <span className="mono ember-text" style={{ marginTop: 40, fontSize: 12 }}>03 / Process</span>
        <h2 style={{ marginTop: 14, maxWidth: 520, fontSize: "clamp(1.4rem,2.6vw,2rem)", fontWeight: 300 }}>
          Five stages, five weeks — the same pipeline every track follows.
        </h2>

        <div style={{ position: "relative", marginTop: 60 }}>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${progress * 100}%`, transition: "width .1s linear" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${n},1fr)`, marginTop: -1 }}>
            {STAGES.map((s, i) => (
              <div key={s.code} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                {i === activeIndex && <span className="pulse-ring" style={{ width: 10, height: 10, top: 0 }} />}
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ember)", boxShadow: i <= activeIndex ? "0 0 12px var(--ember)" : "none", opacity: i <= activeIndex ? 1 : 0.3, transform: i <= activeIndex ? "scale(1)" : "scale(0.6)", transition: "opacity .3s, transform .3s, box-shadow .3s" }} />
                <span className="mono dim" style={{ marginTop: 12, fontSize: 11 }}>{s.code}</span>
              </div>
            ))}
          </div>
        </div>

        {STAGES.map((s, i) => (
          <div key={s.code} className={`stage-copy ${i === activeIndex ? "active" : ""}`}>
            <h3 className="glow-heading" style={{ fontSize: "clamp(2rem,4.5vw,3.4rem)", fontWeight: 300 }}>{s.title}</h3>
            <p className="dim" style={{ marginTop: 14, maxWidth: "44ch", fontSize: "1.05rem", fontWeight: 300 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- numbers ---------- */

function Numbers() {
  const dist = [
    { label: "Web & Mobile", pct: 32 },
    { label: "Applied AI", pct: 24 },
    { label: "Data & Analytics", pct: 18 },
    { label: "Hardware & IoT", pct: 14 },
    { label: "Cybersecurity", pct: 12 },
  ];
  const [barsRef, barsIn] = useInView();
  return (
    <section id="numbers" style={{ padding: "6rem 4vw" }}>
      <div className="beam" />
      <div style={{ marginTop: 48 }}>
        <Reveal><span className="mono ember-text" style={{ fontSize: 12 }}>04 / Numbers</span></Reveal>
      </div>
      <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 60 }}>
        <Reveal>
          <p className="mono dim" style={{ fontSize: 12 }}>Last cycle</p>
          <div className="ember-text" style={{ fontSize: "clamp(3.5rem,9vw,7rem)", fontWeight: 300, lineHeight: 1 }}>
            <AnimatedNumber value={214} />
          </div>
          <p className="dim" style={{ marginTop: 14, maxWidth: "36ch", fontSize: "1.1rem", fontWeight: 300 }}>
            teams entered the last cycle, from 11 campuses. About 6 in 10 shipped a working demo by the deadline.
          </p>
          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingTop: 28 }}>
            <div style={{ gridColumn: "1 / -1" }}><div className="beam" /></div>
            <div><div style={{ fontSize: "1.8rem", fontWeight: 300 }}><AnimatedNumber value={58} suffix="%" /></div><div className="mono dim" style={{ fontSize: 11, marginTop: 4 }}>Completion rate</div></div>
            <div><div style={{ fontSize: "1.8rem", fontWeight: 300 }}><AnimatedNumber value={340} suffix="+" /></div><div className="mono dim" style={{ fontSize: 11, marginTop: 4 }}>Mentor hours</div></div>
            <div><div style={{ fontSize: "1.8rem", fontWeight: 300 }}><AnimatedNumber value={7} /></div><div className="mono dim" style={{ fontSize: 11, marginTop: 4 }}>Tracks offered</div></div>
          </div>
        </Reveal>
        <div ref={barsRef}>
          <p className="mono dim" style={{ fontSize: 12 }}>Entries by track</p>
          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20 }}>
            {dist.map((d, i) => (
              <div key={d.label}>
                <div className="mono dim" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8 }}>
                  <span>{d.label}</span><span>{d.pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: barsIn ? `${d.pct}%` : "0%", transitionDelay: `${i * 0.08}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- timeline ---------- */

function Timeline() {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };
  return (
    <section id="timeline" style={{ padding: "6rem 0" }}>
      <div style={{ padding: "0 4vw" }}>
        <div className="beam" />
        <Reveal>
          <span className="mono ember-text" style={{ marginTop: 40, display: "inline-block", fontSize: 12 }}>05 / Timeline</span>
          <h2 style={{ marginTop: 14, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 300 }}>Six dates worth writing down.</h2>
        </Reveal>
      </div>
      <div style={{ padding: "0 4vw", marginTop: 48 }}>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${progress * 100}%`, transitionDuration: ".1s" }} /></div>
        <div ref={trackRef} onScroll={onScroll} className="timeline-track" style={{ marginTop: 32, display: "flex", gap: 48, overflowX: "auto", paddingBottom: 20 }}>
          {MILESTONES.map((m) => (
            <div key={m.date} style={{ width: 220, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ember)", boxShadow: "0 0 10px var(--ember)" }} />
                <span className="mono dim" style={{ fontSize: 12 }}>{m.date}</span>
              </div>
              <h3 style={{ marginTop: 14, fontSize: "1.5rem", fontWeight: 300 }}>{m.label}</h3>
              <p className="dim" style={{ marginTop: 8, fontSize: 13, fontWeight: 300 }}>{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- jury ---------- */

function Jury() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section id="jury" style={{ padding: "6rem 4vw" }}>
      <div className="beam" />
      <Reveal>
        <span className="mono ember-text" style={{ marginTop: 40, display: "inline-block", fontSize: 12 }}>06 / Jury</span>
        <h2 style={{ marginTop: 14, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 300 }}>People who ship, judging people who are learning to.</h2>
      </Reveal>
      <div style={{ marginTop: 48 }}>
        {JURY.map((p, i) => (
          <div
            key={p.name}
            className={`jury-row ${openIdx === i ? "open" : ""}`}
            onMouseEnter={() => setOpenIdx(i)}
            onMouseLeave={() => setOpenIdx(null)}
            style={{ padding: "1.6rem 0.6rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span className="avatar-ring">{p.initials}</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 300 }}>{p.name}</span>
              </div>
              <span className="mono dim" style={{ fontSize: 12 }}>{p.role}</span>
            </div>
            <div className="jury-detail">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, paddingTop: 16 }}>
                <p className="dim" style={{ fontSize: 14, fontWeight: 300 }}>{p.note}</p>
                <p className="mono dim" style={{ fontSize: 11, textAlign: "right" }}>Focus — {p.focus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- enter — the ignition climax ---------- */

function Enter() {
  const statement = "Nobody remembers the team that had the best idea. They remember the one that had a working demo.";
  const [ref, inView] = useInView({ threshold: 0.4 });
  return (
    <section id="enter" ref={ref} style={{ position: "relative", padding: "8rem 4vw", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 10, height: 10, pointerEvents: "none" }}>
        {inView && [0, 1, 2].map((i) => (
          <span key={i} className="pulse-ring" style={{ width: 10, height: 10, left: 0, top: 0, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>
      <span className="mono ember-text" style={{ position: "relative", fontSize: 12 }}>07 / Enter</span>
      <div style={{ position: "relative", marginTop: 32, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <RevealWords text={statement} delay={0.05} stagger={0.035} />
      </div>
      <style>{`#enter .word { font-size: clamp(1.8rem, 3.8vw, 3.2rem); font-weight: 300; }`}</style>
      <div style={{ position: "relative", marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <p className="dim" style={{ maxWidth: "42ch", fontSize: "1.1rem", fontWeight: 300 }}>
          Registration closes 30 September. Teams are first-come, first-slotted — popular tracks fill up inside
          the first week.
        </p>
        <Magnetic><span className="btn btn-solid">Register your team</span></Magnetic>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "0 4vw 2.5rem" }}>
      <div className="beam" style={{ marginBottom: 20 }} />
      <div className="mono dim" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 11 }}>
        <span>©️ 2026 Aptech International. Template for the FANDOMVERSE competition site.</span>
        <div style={{ display: "flex", gap: 20 }}>
          <span>Top</span><span>Tracks</span><span>Register</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- app ---------- */

export default function App() {
  const ids = SECTIONS.map((s) => s.id);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="twz">
      <style>{CSS}</style>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}</style>
      <div className="nebula" aria-hidden="true">
        <i className="n1" /><i className="n2" /><i className="n3" />
      </div>
      <EmberField />
      <div className="grain" />
      <div className="vignette" />
      <div className="content-layer">
        <Nav active={active} scrollTo={scrollTo} />
        <Hero />
        <Intro />
        <Hub />
        <Process />
        <Numbers />
        <Timeline />
        <Jury />
        <Enter />
        <Footer />
      </div>
    </div>
  );
}