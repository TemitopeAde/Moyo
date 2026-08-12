'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type AtmospherePreset = 'entry' | 'photography' | 'art';

interface ThreeAtmosphereProps {
    preset: AtmospherePreset;
    className?: string;
}

const presetConfig = {
    entry: {
        particleCount: 980,
        depth: 58,
        spread: 38,
        base: new THREE.Color('#f7f0d8'),
        accent: new THREE.Color('#920110'),
        secondary: new THREE.Color('#8d8d8d'),
        pointSize: 0.045,
        opacity: 0.78,
        drift: 0.16,
    },
    photography: {
        particleCount: 720,
        depth: 54,
        spread: 34,
        base: new THREE.Color('#d8e7ff'),
        accent: new THREE.Color('#920110'),
        secondary: new THREE.Color('#7f93ad'),
        pointSize: 0.04,
        opacity: 0.58,
        drift: 0.12,
    },
    art: {
        particleCount: 760,
        depth: 48,
        spread: 32,
        base: new THREE.Color('#fff2d2'),
        accent: new THREE.Color('#920110'),
        secondary: new THREE.Color('#9b7a4f'),
        pointSize: 0.044,
        opacity: 0.66,
        drift: 0.14,
    },
} satisfies Record<AtmospherePreset, {
    particleCount: number;
    depth: number;
    spread: number;
    base: THREE.Color;
    accent: THREE.Color;
    secondary: THREE.Color;
    pointSize: number;
    opacity: number;
    drift: number;
}>;

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function createParticleField(config: (typeof presetConfig)[AtmospherePreset], isMobile: boolean) {
    const count = Math.floor(config.particleCount * (isMobile ? 0.52 : 1));
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
        const radiusBias = Math.pow(seededRandom(i + 10), 0.64);
        const angle = seededRandom(i + 50) * Math.PI * 2;
        const vertical = (seededRandom(i + 90) - 0.5) * config.spread * 0.62;
        const depth = (seededRandom(i + 130) - 0.5) * config.depth;
        const radius = radiusBias * config.spread;

        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = vertical;
        positions[i * 3 + 2] = depth + Math.sin(angle * 1.8) * 4;

        const color = config.base.clone();
        const warmth = seededRandom(i + 170);

        if (warmth > 0.84) {
            color.lerp(config.accent, 0.72);
        } else if (warmth < 0.28) {
            color.lerp(config.secondary, 0.55);
        }

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: config.pointSize * (isMobile ? 1.2 : 1),
        transparent: true,
        opacity: config.opacity,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
}

function createLightFilaments(config: (typeof presetConfig)[AtmospherePreset], isMobile: boolean) {
    const count = isMobile ? 18 : 34;
    const positions = new Float32Array(count * 2 * 3);

    for (let i = 0; i < count; i += 1) {
        const angle = seededRandom(i + 230) * Math.PI * 2;
        const radius = seededRandom(i + 270) * config.spread * 0.82;
        const y = (seededRandom(i + 310) - 0.5) * config.spread * 0.5;
        const z = (seededRandom(i + 350) - 0.5) * config.depth;
        const length = 1.4 + seededRandom(i + 390) * 3.2;
        const offset = i * 6;

        positions[offset] = Math.cos(angle) * radius;
        positions[offset + 1] = y;
        positions[offset + 2] = z;
        positions[offset + 3] = Math.cos(angle + 0.04) * (radius + length);
        positions[offset + 4] = y + length * 0.18;
        positions[offset + 5] = z + length * 0.45;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: config.accent,
        transparent: true,
        opacity: isMobile ? 0.12 : 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });

    return new THREE.LineSegments(geometry, material);
}

export default function ThreeAtmosphere({ preset, className = '' }: ThreeAtmosphereProps) {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const config = presetConfig[preset];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let renderer: THREE.WebGLRenderer;

        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: false,
                powerPreference: 'low-power',
            });
        } catch (error) {
            console.warn('[three-atmosphere] WebGL unavailable, skipping atmosphere layer', error);
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 140);
        const group = new THREE.Group();
        const pointer = new THREE.Vector2(0, 0);
        const target = new THREE.Vector2(0, 0);
        let animationFrame = 0;
        let width = 0;
        let height = 0;
        let isVisible = true;
        let isPageVisible = document.visibilityState === 'visible';

        const isMobile = window.innerWidth < 768;
        const particles = createParticleField(config, isMobile);
        const filaments = createLightFilaments(config, isMobile);

        camera.position.set(0, 0, 36);
        scene.add(group);
        group.add(particles);
        group.add(filaments);

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.1 : 1.35));
        renderer.domElement.setAttribute('aria-hidden', 'true');
        renderer.domElement.className = 'h-full w-full';
        mount.appendChild(renderer.domElement);

        const resize = () => {
            width = mount.clientWidth || window.innerWidth;
            height = mount.clientHeight || window.innerHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const handlePointerMove = (event: PointerEvent) => {
            target.x = (event.clientX / window.innerWidth - 0.5) * 2;
            target.y = (event.clientY / window.innerHeight - 0.5) * 2;
        };

        const shouldAnimate = () => !reducedMotion && isVisible && isPageVisible;

        const stopLoop = () => {
            if (!animationFrame) return;
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        };

        const startLoop = () => {
            if (animationFrame || !shouldAnimate()) return;
            animationFrame = window.requestAnimationFrame(render);
        };

        const render = (time = 0) => {
            animationFrame = 0;
            const seconds = time * 0.001;

            pointer.lerp(target, 0.045);
            group.rotation.y = seconds * config.drift + pointer.x * 0.12;
            group.rotation.x = Math.sin(seconds * 0.25) * 0.045 - pointer.y * 0.08;
            particles.rotation.z = Math.sin(seconds * 0.18) * 0.035;
            filaments.rotation.y = group.rotation.y * -0.55;
            camera.position.x = pointer.x * 1.2;
            camera.position.y = -pointer.y * 0.8;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);

            if (shouldAnimate()) {
                animationFrame = window.requestAnimationFrame(render);
            }
        };

        const handleVisibilityChange = () => {
            isPageVisible = document.visibilityState === 'visible';
            if (shouldAnimate()) {
                startLoop();
            } else {
                stopLoop();
            }
        };

        resize();
        window.addEventListener('resize', resize);

        if (!reducedMotion) {
            window.addEventListener('pointermove', handlePointerMove, { passive: true });
            document.addEventListener('visibilitychange', handleVisibilityChange);
            const observer = new IntersectionObserver(([entry]) => {
                isVisible = entry?.isIntersecting ?? true;
                if (shouldAnimate()) {
                    startLoop();
                } else {
                    stopLoop();
                }
            });
            observer.observe(mount);
            startLoop();

            return () => {
                observer.disconnect();
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('resize', resize);
                window.removeEventListener('pointermove', handlePointerMove);
                stopLoop();

                particles.geometry.dispose();
                filaments.geometry.dispose();
                (particles.material as THREE.Material).dispose();
                (filaments.material as THREE.Material).dispose();
                renderer.dispose();

                if (renderer.domElement.parentElement === mount) {
                    mount.removeChild(renderer.domElement);
                }
            };
        } else {
            group.rotation.y = preset === 'entry' ? 0.18 : 0.1;
            group.rotation.x = preset === 'photography' ? -0.05 : 0.04;
            renderer.render(scene, camera);
        }

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', handlePointerMove);
            stopLoop();

            particles.geometry.dispose();
            filaments.geometry.dispose();
            (particles.material as THREE.Material).dispose();
            (filaments.material as THREE.Material).dispose();
            renderer.dispose();

            if (renderer.domElement.parentElement === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [preset]);

    return (
        <div
            ref={mountRef}
            className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
        />
    );
}
