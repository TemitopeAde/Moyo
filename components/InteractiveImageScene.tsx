'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface InteractiveImageSceneProps {
    imageSrc: string;
    mobileImageSrc?: string;
    className?: string;
}

const portraitVertexShader = `
    uniform vec2 uMouse;
    uniform float uScroll;
    varying vec2 vUv;
    varying float vDepth;

    float ellipse(vec2 point, vec2 center, vec2 radius) {
        vec2 normalized = (point - center) / radius;
        return 1.0 - smoothstep(0.72, 1.0, dot(normalized, normalized));
    }

    void main() {
        vUv = uv;

        vec3 pos = position;
        float head = ellipse(uv, vec2(0.5, 0.67), vec2(0.19, 0.2));
        float shoulders = ellipse(uv, vec2(0.5, 0.35), vec2(0.38, 0.22));
        float background = 1.0 - max(head, shoulders * 0.75);
        float pointerFocus = 1.0 - smoothstep(0.0, 0.5, distance(uv, uMouse));

        vDepth = head * 0.78 + shoulders * 0.42 + pointerFocus * 0.16;
        pos.z += head * 0.09;
        pos.z += shoulders * 0.045;
        pos.z -= background * 0.035;
        pos.z += uScroll * 0.035;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const portraitFragmentShader = `
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vDepth;

    void main() {
        vec4 base = texture2D(uTexture, vUv);
        float monochrome = dot(base.rgb, vec3(0.299, 0.587, 0.114));
        float focus = 1.0 - smoothstep(0.0, 0.42, distance(vUv, uMouse));
        float vignette = smoothstep(0.9, 0.2, distance(vUv, vec2(0.5, 0.52)));
        vec3 color = vec3(monochrome);

        color = mix(color * 0.82, color * 1.08, vignette);
        color += focus * vec3(0.018, 0.014, 0.006);
        color += vDepth * vec3(0.012, 0.01, 0.004);

        gl_FragColor = vec4(color, 1.0);
    }
`;

function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function createPointLayer(count: number, spread: number, depth: number, color: string, size: number, opacity: number, seedOffset: number) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const base = new THREE.Color(color);
    const accent = new THREE.Color('#920110');

    for (let i = 0; i < count; i += 1) {
        const x = (seededRandom(i + seedOffset) - 0.5) * spread;
        const y = (seededRandom(i + seedOffset + 40) - 0.5) * spread * 0.68;
        const z = -depth - seededRandom(i + seedOffset + 80) * depth;
        const pointColor = base.clone().lerp(accent, seededRandom(i + seedOffset + 120) > 0.92 ? 0.45 : 0);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        colors[i * 3] = pointColor.r;
        colors[i * 3 + 1] = pointColor.g;
        colors[i * 3 + 2] = pointColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size,
        transparent: true,
        opacity,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
}

function createNebulaTexture(color: string, opacity: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext('2d');
    if (!context) return null;

    const gradient = context.createRadialGradient(256, 256, 18, 256, 256, 256);
    gradient.addColorStop(0, `rgba(${color}, ${opacity})`);
    gradient.addColorStop(0.42, `rgba(${color}, ${opacity * 0.38})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createNebulaPlane(texture: THREE.Texture, scale: number, x: number, y: number, z: number, rotation: number) {
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotation;
    mesh.scale.setScalar(scale);
    return mesh;
}

function createLightStreaks() {
    const count = 22;
    const positions = new Float32Array(count * 2 * 3);

    for (let i = 0; i < count; i += 1) {
        const base = i * 6;
        const x = (seededRandom(i + 500) - 0.5) * 16;
        const y = (seededRandom(i + 540) - 0.5) * 8;
        const z = -8 - seededRandom(i + 580) * 10;
        const length = 1.2 + seededRandom(i + 620) * 2.6;

        positions[base] = x;
        positions[base + 1] = y;
        positions[base + 2] = z;
        positions[base + 3] = x + length;
        positions[base + 4] = y + length * 0.1;
        positions[base + 5] = z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
        color: '#920110',
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    return new THREE.LineSegments(geometry, material);
}

export default function InteractiveImageScene({ imageSrc, mobileImageSrc, className = '' }: InteractiveImageSceneProps) {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        } catch (error) {
            console.warn('[interactive-image-scene] WebGL unavailable, skipping 3D image layer', error);
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        const loader = new THREE.TextureLoader();
        const targetMouse = new THREE.Vector2(0.5, 0.5);
        const mouse = new THREE.Vector2(0.5, 0.5);
        const targetPointer = new THREE.Vector2(0, 0);
        const pointer = new THREE.Vector2(0, 0);
        const targetScroll = { value: 0 };
        const scroll = { value: 0 };
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const portraitGroup = new THREE.Group();
        const starGroup = new THREE.Group();
        const dustGroup = new THREE.Group();
        const nebulaGroup = new THREE.Group();
        const streakGroup = new THREE.Group();
        let animationFrame = 0;
        let width = 1;
        let height = 1;
        let mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial> | null = null;
        let glow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | null = null;
        let texture: THREE.Texture | null = null;
        let activeImageSrc = '';
        let disposed = false;

        const stars = createPointLayer(760, 22, 12, '#d9e4ff', 0.018, 0.58, 10);
        const dust = createPointLayer(430, 15, 6, '#f3e5bd', 0.028, 0.22, 210);
        const streaks = createLightStreaks();
        const nebulaTextureA = createNebulaTexture('212, 175, 55', 0.24);
        const nebulaTextureB = createNebulaTexture('138, 158, 210', 0.18);
        const nebulaTextureC = createNebulaTexture('255, 255, 255', 0.12);
        const nebulaTextures = [nebulaTextureA, nebulaTextureB, nebulaTextureC].filter(Boolean) as THREE.Texture[];

        camera.position.set(0, 0, 7.2);
        scene.add(starGroup, nebulaGroup, streakGroup, dustGroup, portraitGroup);
        starGroup.add(stars);
        dustGroup.add(dust);
        streakGroup.add(streaks);

        if (nebulaTextureA) nebulaGroup.add(createNebulaPlane(nebulaTextureA, 8.5, -2.7, 1.1, -11, -0.22));
        if (nebulaTextureB) nebulaGroup.add(createNebulaPlane(nebulaTextureB, 10.5, 2.9, -0.8, -13, 0.18));
        if (nebulaTextureC) nebulaGroup.add(createNebulaPlane(nebulaTextureC, 7.8, 0.2, 0.0, -9, 0.03));

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
        renderer.domElement.className = 'h-full w-full interactive-image-canvas';
        renderer.domElement.setAttribute('aria-label', 'Interactive 3D portrait image');
        renderer.domElement.dataset.scene = 'interactive-image';
        mount.appendChild(renderer.domElement);
        window.requestAnimationFrame(() => renderer.domElement.classList.add('is-focused'));

        const resizeMesh = () => {
            if (!mesh || !texture?.image) return;

            const distance = camera.position.z;
            const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
            const visibleWidth = visibleHeight * camera.aspect;
            const textureImage = texture.image as { width: number; height: number };
            const imageAspect = textureImage.width / textureImage.height;
            const viewportAspect = width / height;
            const scale = imageAspect > viewportAspect
                ? [visibleHeight * imageAspect, visibleHeight]
                : [visibleWidth, visibleWidth / imageAspect];

            mesh.scale.set(scale[0] * 1.05, scale[1] * 1.05, 1);
            glow?.scale.set(scale[0] * 1.12, scale[1] * 1.12, 1);
        };

        const resize = () => {
            width = mount.clientWidth || window.innerWidth;
            height = mount.clientHeight || window.innerHeight;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            resizeMesh();
        };

        const getResponsiveImageSrc = () => {
            if (!mobileImageSrc) return imageSrc;
            return window.matchMedia('(max-width: 767px)').matches ? mobileImageSrc : imageSrc;
        };

        const updateScroll = () => {
            targetScroll.value = window.scrollY / Math.max(window.innerHeight, 1);
        };

        const handlePointerMove = (event: PointerEvent) => {
            const rect = mount.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            targetMouse.set(THREE.MathUtils.clamp(x, 0, 1), THREE.MathUtils.clamp(1 - y, 0, 1));
            targetPointer.set(
                THREE.MathUtils.clamp((x - 0.5) * 2, -1, 1),
                THREE.MathUtils.clamp((y - 0.5) * 2, -1, 1)
            );
        };

        const render = (time = 0) => {
            const seconds = time * 0.001;

            mouse.lerp(targetMouse, reducedMotion ? 1 : 0.075);
            pointer.lerp(targetPointer, reducedMotion ? 1 : 0.06);
            scroll.value += (targetScroll.value - scroll.value) * 0.08;

            if (mesh) {
                mesh.material.uniforms.uMouse.value.copy(mouse);
                mesh.material.uniforms.uScroll.value = scroll.value;
                portraitGroup.position.set(pointer.x * 0.075, -scroll.value * 0.2 - pointer.y * 0.055, 0);
                portraitGroup.rotation.x = reducedMotion ? -0.018 : -pointer.y * 0.018;
                portraitGroup.rotation.y = reducedMotion ? 0.028 : pointer.x * 0.028;
            }

            starGroup.position.set(pointer.x * -0.045, scroll.value * 0.08 + pointer.y * 0.035, 0);
            dustGroup.position.set(pointer.x * 0.095, -scroll.value * 0.34 - pointer.y * 0.065, 0);
            nebulaGroup.position.set(pointer.x * 0.13, -scroll.value * 0.22 - pointer.y * 0.08, 0);
            streakGroup.position.set(pointer.x * -0.11, -scroll.value * 0.42 + pointer.y * 0.045, 0);
            starGroup.rotation.z = seconds * 0.003;
            dustGroup.rotation.z = Math.sin(seconds * 0.16) * 0.015;
            nebulaGroup.rotation.z = Math.sin(seconds * 0.08) * 0.018;

            camera.position.x = reducedMotion ? 0 : pointer.x * 0.04;
            camera.position.y = reducedMotion ? 0 : -pointer.y * 0.03;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);

            if (!reducedMotion) {
                animationFrame = window.requestAnimationFrame(render);
            }
        };

        const ensureMeshes = (loadedTexture: THREE.Texture) => {
            if (mesh) {
                mesh.material.uniforms.uTexture.value = loadedTexture;
                resizeMesh();
                return;
            }

            const geometry = new THREE.PlaneGeometry(1, 1, 120, 120);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTexture: { value: loadedTexture },
                    uMouse: { value: mouse },
                    uScroll: { value: 0 },
                },
                vertexShader: portraitVertexShader,
                fragmentShader: portraitFragmentShader,
            });

            const glowGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: '#920110',
                transparent: true,
                opacity: 0.16,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });

            glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.position.z = -0.16;
            mesh = new THREE.Mesh(geometry, material);
            portraitGroup.add(glow, mesh);
            resizeMesh();
            render();
        };

        const loadResponsiveTexture = () => {
            const nextImageSrc = getResponsiveImageSrc();
            if (nextImageSrc === activeImageSrc) return;
            activeImageSrc = nextImageSrc;

            loader.load(
                nextImageSrc,
                (loadedTexture) => {
                    if (disposed || nextImageSrc !== activeImageSrc) {
                        loadedTexture.dispose();
                        return;
                    }

                    const previousTexture = texture;
                    texture = loadedTexture;
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    ensureMeshes(texture);
                    previousTexture?.dispose();
                },
                undefined,
                (error) => {
                    console.error('[interactive-image-scene] Failed to load image', error);
                }
            );
        };

        loadResponsiveTexture();

        const handleResponsiveResize = () => {
            resize();
            loadResponsiveTexture();
        };

        resize();
        updateScroll();
        window.addEventListener('resize', handleResponsiveResize);
        window.addEventListener('scroll', updateScroll, { passive: true });
        window.addEventListener('pointermove', handlePointerMove, { passive: true });

        if (!reducedMotion) {
            animationFrame = window.requestAnimationFrame(render);
        }

        return () => {
            disposed = true;
            window.removeEventListener('resize', handleResponsiveResize);
            window.removeEventListener('scroll', updateScroll);
            window.removeEventListener('pointermove', handlePointerMove);
            if (animationFrame) window.cancelAnimationFrame(animationFrame);

            if (mesh) {
                portraitGroup.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }

            if (glow) {
                portraitGroup.remove(glow);
                glow.geometry.dispose();
                glow.material.dispose();
            }

            stars.geometry.dispose();
            dust.geometry.dispose();
            streaks.geometry.dispose();
            (stars.material as THREE.Material).dispose();
            (dust.material as THREE.Material).dispose();
            (streaks.material as THREE.Material).dispose();
            nebulaGroup.children.forEach((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((material) => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            nebulaTextures.forEach((nebulaTexture) => nebulaTexture.dispose());
            texture?.dispose();
            renderer.dispose();

            if (renderer.domElement.parentElement === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [imageSrc, mobileImageSrc]);

    return (
        <div
            ref={mountRef}
            className={`absolute inset-0 overflow-hidden ${className}`}
        />
    );
}
