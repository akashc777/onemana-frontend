"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { gsap } from "gsap";

/**
 * Interactive WebGL hero backdrop: a slowly rotating spherical field of glowing
 * brand-coloured points with depth fade and GSAP-eased pointer parallax.
 *
 * Production guards:
 * - Respects prefers-reduced-motion (renders a single static frame, no loop).
 * - Pauses the render loop when the tab is hidden or the hero scrolls offscreen.
 * - Caps DPR at 2, disposes all GPU resources on unmount, and fails silently
 *   (leaving the CSS HeroAmbient as the backdrop) if WebGL is unavailable.
 */
export function HeroThree() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isDark = resolvedTheme !== "light";

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL — CSS ambient remains the backdrop.
    }

    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || 600;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 30;

    // Soft circular sprite so points read as glowing dots, not squares.
    const sprite = (() => {
      const s = 64;
      const c = document.createElement("canvas");
      c.width = c.height = s;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.4, "rgba(255,255,255,0.6)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      const tex = new THREE.CanvasTexture(c);
      return tex;
    })();

    // Spherical shell of points with slight radial jitter.
    const COUNT = isDark ? 1300 : 850;
    const RADIUS = 16;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = RADIUS + (Math.random() - 0.5) * 4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      map: sprite,
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      color: new THREE.Color("#FF4D00"),
      opacity: isDark ? 0.95 : 0.55,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    const group = new THREE.Group();
    group.add(points);
    // A faint inner core of cooler dots for depth.
    const coreMat = material.clone();
    coreMat.color = new THREE.Color(isDark ? "#FF8A4C" : "#FF6B2E");
    coreMat.size = 0.32;
    coreMat.opacity = isDark ? 0.5 : 0.3;
    const core = new THREE.Points(geometry, coreMat);
    core.scale.setScalar(0.55);
    group.add(core);
    scene.add(group);

    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    group.rotation.x = 0.5;

    // GSAP-eased pointer parallax. We tween a plain object and read it in the
    // loop so the parallax never fights the continuous auto-rotation.
    const parallax = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      if (prefersReduced) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      gsap.to(parallax, { x: nx * 0.35, y: ny * 0.3, duration: 1.2, ease: "power3.out", overwrite: true });
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let autoY = 0;
    let raf = 0;
    let running = false;
    let last = performance.now();

    const renderFrame = () => {
      group.rotation.y = autoY + parallax.x;
      group.rotation.x = 0.5 + parallax.y * 0.5;
      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      autoY += dt * 0.05;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Initial paint (covers the reduced-motion path too).
    renderFrame();

    // Pause when the hero scrolls offscreen.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 },
    );
    io.observe(mount);

    // Pause on tab blur.
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderFrame();
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf(parallax);
      geometry.dispose();
      material.dispose();
      coreMat.dispose();
      sprite.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [resolvedTheme]);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(120%_85%_at_50%_15%,black_30%,transparent_75%)]"
    />
  );
}
