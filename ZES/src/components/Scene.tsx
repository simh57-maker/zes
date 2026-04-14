"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  useEffect,
  Suspense,
  useLayoutEffect,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Center,
  GizmoHelper,
  GizmoViewport,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ToneMapping,
  SSAO,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Font, TextGeometry } from "three-stdlib";
import {
  useEditorStore,
  type LightsState,
  type PostProcessingState,
  type BackgroundState,
} from "@/store";
import type { ExportRef } from "./TopBar";

// ─── SVG Extruder ─────────────────────────────────────────────────────────────

const svgCache = new Map<string, any>();
const svgCallbacks = new Map<string, Array<(d: any) => void>>();

function SVGMesh({ data }: { data: any }) {
  const svg = useEditorStore((s) => s.svg);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (svg.autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.5 * delta;
    }
  });

  const geometry = useMemo(() => {
    const shapes: THREE.Shape[] = [];

    for (const path of data.paths) {
      const fill = path.userData?.style?.fill;
      // 흰색 / 투명 / none → 배경이므로 제외
      if (!fill || fill === "none") continue;
      const c = typeof fill === "string" ? fill.trim().toLowerCase() : "";
      if (c === "#fff" || c === "#ffffff" || c === "white" ||
          c === "rgb(255,255,255)" || c === "rgb(255, 255, 255)") continue;

      // SVGLoader.createShapes가 fill-rule(evenodd/nonzero) + 구멍 처리를 모두 담당
      const s = SVGLoader.createShapes(path);
      shapes.push(...s);
    }

    // 필터 후 shape가 없으면 전체 포함 (fill 정보 없는 SVG 대응)
    if (shapes.length === 0) {
      for (const path of data.paths) {
        shapes.push(...SVGLoader.createShapes(path));
      }
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 1,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.025,
      bevelSegments: 5,
      curveSegments: 32,
    };

    const geoms = shapes.map((s) => new THREE.ExtrudeGeometry(s, extrudeSettings));
    if (geoms.length === 0) return new THREE.BufferGeometry();
    const merged = mergeGeometries(geoms, false) ?? geoms[0];
    // SVG Y축 반전 (SVG는 아래가 +Y)
    merged.scale(1, -1, 1);
    merged.computeBoundingBox();
    const size = new THREE.Vector3();
    merged.boundingBox!.getSize(size);
    const maxDim = Math.max(size.x, size.y);
    const scale = maxDim > 0 ? 2.5 / maxDim : 1;
    merged.scale(scale, scale, svg.depth * scale);
    merged.computeBoundingBox();
    merged.computeVertexNormals();
    return merged;
  }, [data, svg.depth]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(svg.color),
        metalness: svg.metalness,
        roughness: svg.roughness,
        envMapIntensity: 2.5,
        side: THREE.DoubleSide,
      }),
    [svg.color, svg.metalness, svg.roughness]
  );

  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  return (
    <group ref={groupRef}>
      <Center>
        <mesh geometry={geometry} material={material} castShadow receiveShadow />
      </Center>
    </group>
  );
}

function SVGLoader3D() {
  const url = useEditorStore((s) => s.svg.url);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!url) { setData(null); return; }
    setData(null);
    const cb = (d: any) => setData(d);
    const cached = svgCache.get(url);
    if (cached === "loading") {
      svgCallbacks.get(url)!.push(cb);
    } else if (cached === "error") {
      setData(null);
    } else if (cached) {
      cb(cached.data);
    } else {
      svgCache.set(url, "loading");
      svgCallbacks.set(url, [cb]);
      const loader = new SVGLoader();
      loader.load(
        url,
        (result) => {
          svgCache.set(url, { data: result });
          svgCallbacks.get(url)!.forEach((f) => f(result));
          svgCallbacks.delete(url);
        },
        undefined,
        () => {
          svgCache.set(url, "error");
          svgCallbacks.get(url)!.forEach((f) => f(null));
          svgCallbacks.delete(url);
        }
      );
    }
  }, [url]);

  return data ? <SVGMesh data={data} /> : null;
}

// ─── Text 3D ──────────────────────────────────────────────────────────────────
// drei Text3D/useFont는 suspend-react 캐시 키 불일치 문제가 있어서
// three-stdlib의 Font + TextGeometry를 직접 사용

function buildTextMaterial(
  type: string,
  color: string,
  emissiveColor: string,
  emissiveIntensity: number,
  metalness: number,
  roughness: number,
  opacity: number
): THREE.Material {
  const c = new THREE.Color(color);
  const e = new THREE.Color(emissiveColor);
  switch (type) {
    case "metallic":
      return new THREE.MeshStandardMaterial({ color: c, metalness: 0.95, roughness: 0.05, envMapIntensity: 2 });
    case "glass":
      return new THREE.MeshPhysicalMaterial({ color: c, metalness: 0, roughness: 0, transmission: 0.85, thickness: 0.5, ior: 1.5, transparent: true, opacity: 0.5 });
    case "neon":
      return new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: Math.max(emissiveIntensity, 2.5), metalness: 0, roughness: 0.3, toneMapped: false });
    case "holographic":
      return new THREE.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: 0.8, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.75 });
    case "matte":
      return new THREE.MeshLambertMaterial({ color: c, transparent: opacity < 1, opacity });
    default:
      return new THREE.MeshStandardMaterial({
        color: c,
        emissive: emissiveIntensity > 0 ? e : new THREE.Color(0),
        emissiveIntensity, metalness, roughness,
        transparent: opacity < 1, opacity, envMapIntensity: 1,
      });
  }
}

// opentype.js → drei FontData 포맷 변환 (string path)
function pathToTroikaOutline(commands: any[], scale: number): string {
  const r = (v: number) => String(Math.round(v * scale));
  const rn = (v: number) => String(Math.round(-v * scale));
  let d = "";
  for (const cmd of commands) {
    switch (cmd.type) {
      case "M": d += ` M ${r(cmd.x)} ${rn(cmd.y)}`; break;
      case "L": d += ` L ${r(cmd.x)} ${rn(cmd.y)}`; break;
      case "C": d += ` C ${r(cmd.x1)} ${rn(cmd.y1)} ${r(cmd.x2)} ${rn(cmd.y2)} ${r(cmd.x)} ${rn(cmd.y)}`; break;
      case "Q": d += ` Q ${r(cmd.x1)} ${rn(cmd.y1)} ${r(cmd.x)} ${rn(cmd.y)}`; break;
      case "Z": d += " Z"; break;
    }
  }
  return d.trim();
}

// ─── Font cache ───────────────────────────────────────────────────────────────
// 구조: url → { opentypeFont, upem, scale, glyphs(캐시), fontData, threeFont }
// 글리프는 필요한 문자만 on-demand 추출 → 한글 11172자 사전 변환 제거

interface FontEntry {
  opentypeFont: any;
  upem: number;
  scale: number;
  glyphs: Record<string, any>;
  fontData: any;    // three-stdlib FontData shape (glyphs는 공유 참조)
  threeFont: Font;
}

const fontCache = new Map<string, FontEntry>();
const fontLoadingSet = new Set<string>();

function extractGlyph(entry: FontEntry, ch: string): boolean {
  if (entry.glyphs[ch]) return true;
  const g = entry.opentypeFont.charToGlyph(ch);
  if (!g || g.index === 0) return false;
  const ha = Math.round((g.advanceWidth ?? 0) * entry.scale);
  const outline = pathToTroikaOutline(g.getPath(0, 0, entry.upem).commands, entry.scale);
  entry.glyphs[ch] = { _cachedOutline: outline.split(" "), ha, o: outline };
  return true;
}

async function loadFont(url: string): Promise<FontEntry> {
  const { parse } = await import("opentype.js");
  const buf = await fetch(url).then((r) => r.arrayBuffer());
  const opentypeFont = parse(buf);
  const upem = opentypeFont.unitsPerEm || 1000;
  const scale = 1000 / upem;
  const glyphs: Record<string, any> = {};

  // ASCII 가시 문자만 사전 추출 (95자 — 가볍고 빠름)
  for (let cp = 32; cp <= 126; cp++) {
    const ch = String.fromCodePoint(cp);
    const g = opentypeFont.charToGlyph(ch);
    if (!g || g.index === 0) continue;
    const ha = Math.round((g.advanceWidth ?? 0) * scale);
    const outline = pathToTroikaOutline(g.getPath(0, 0, upem).commands, scale);
    glyphs[ch] = { _cachedOutline: outline.split(" "), ha, o: outline };
  }

  const fontData = {
    familyName: opentypeFont.names?.fontFamily?.en ?? "Custom",
    resolution: 1000,
    boundingBox: {
      yMin: Math.round((opentypeFont.descender ?? -200) * scale),
      yMax: Math.round((opentypeFont.ascender ?? 800) * scale),
    },
    underlineThickness: 50,
    glyphs, // 공유 참조 — extractGlyph가 여기에 직접 추가
  };

  const threeFont = new Font(fontData);
  return { opentypeFont, upem, scale, glyphs, fontData, threeFont };
}

// 텍스트에 필요한 글리프를 on-demand로 확보하고 Font 인스턴스를 갱신
// 새 문자가 추가될 때만 Font를 재생성해 TextGeometry 재빌드 유발
function ensureGlyphs(entry: FontEntry, text: string): Font {
  let added = false;
  for (const ch of text) {
    if (ch === " " || ch === "\n") continue;
    if (!entry.glyphs[ch]) {
      const ok = extractGlyph(entry, ch);
      if (ok) added = true;
    }
  }
  if (added) {
    // fontData.glyphs는 공유 참조이므로 이미 최신 — Font만 재생성
    entry.threeFont = new Font(entry.fontData);
  }
  return entry.threeFont;
}

// FontLoader는 Canvas 밖(Scene)에서 호출 — display:none 영향 없음
// 로드 완료 시 store.fontReadyUrl 업데이트 → Text3DMesh 자동 리렌더
export function FontPreloader() {
  const fontVariant = useEditorStore((s) => s.text.fontVariant);
  const setFontReadyUrl = useEditorStore((s) => s.setFontReadyUrl);

  useEffect(() => {
    if (!fontVariant) return;
    if (fontCache.has(fontVariant)) {
      setFontReadyUrl(fontVariant);
      return;
    }
    if (fontLoadingSet.has(fontVariant)) return;
    fontLoadingSet.add(fontVariant);
    loadFont(fontVariant)
      .then((entry) => {
        fontCache.set(fontVariant, entry);
        fontLoadingSet.delete(fontVariant);
        setFontReadyUrl(fontVariant); // ← store 업데이트 → 전체 구독자 리렌더
      })
      .catch(() => { fontLoadingSet.delete(fontVariant); });
  }, [fontVariant, setFontReadyUrl]);

  return null; // DOM 렌더 없음
}

// Canvas 내부 — store.fontReadyUrl을 구독해서 로드 완료를 감지
function Text3DMesh() {
  const text = useEditorStore((s) => s.text);
  const fontReadyUrl = useEditorStore((s) => s.fontReadyUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  // fontReadyUrl이 현재 fontVariant와 일치할 때만 entry 사용
  const entry = (fontReadyUrl === text.fontVariant)
    ? fontCache.get(text.fontVariant) ?? null
    : null;

  // 필요한 글리프 확보 + Font 최신화
  const threeFont = useMemo(() => {
    if (!entry) return null;
    return ensureGlyphs(entry, text.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, text.content]);

  const geometry = useMemo(() => {
    if (!threeFont || !text.content.trim()) return null;
    try {
      const geo = new TextGeometry(text.content, {
        font: threeFont,
        size: text.size,
        height: text.depth,
        curveSegments: 12,
        bevelEnabled: text.bevelEnabled,
        bevelThickness: text.bevelThickness,
        bevelSize: text.bevelSize,
        letterSpacing: text.letterSpacing,
      });
      geo.computeBoundingBox();
      const offset = new THREE.Vector3();
      geo.boundingBox!.getCenter(offset);
      geo.translate(-offset.x, -offset.y, -offset.z);
      geo.computeVertexNormals();
      return geo;
    } catch {
      return null;
    }
  }, [threeFont, text.content, text.size, text.depth, text.bevelEnabled, text.bevelThickness, text.bevelSize]);

  const material = useMemo(
    () => buildTextMaterial(text.materialType, text.color, text.emissiveColor, text.emissiveIntensity, text.metalness, text.roughness, text.opacity),
    [text.materialType, text.color, text.emissiveColor, text.emissiveIntensity, text.metalness, text.roughness, text.opacity]
  );

  useEffect(() => () => { geometry?.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(({ clock }) => {
    if (text.materialType !== "holographic") return;
    const mat = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat?.emissive) mat.emissiveIntensity = 0.4 + 0.6 * Math.abs(Math.sin(1.8 * clock.getElapsedTime()));
  });

  if (!geometry || !text.visible) return null;

  return (
    <group position={[0, text.positionY, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
    </group>
  );
}

function FontLoader() {
  return <Text3DMesh />;
}

// ─── Per-tab lights / postprocessing (props 기반) ─────────────────────────────

function SceneLights({ lights }: { lights: LightsState }) {
  return (
    <>
      <ambientLight intensity={lights.ambientIntensity} color={lights.ambientColor} />
      <directionalLight
        intensity={lights.directionalIntensity}
        color={lights.directionalColor}
        position={[lights.directionalX, lights.directionalY, lights.directionalZ]}
        castShadow={lights.shadowEnabled}
        shadow-mapSize={[lights.shadowResolution, lights.shadowResolution]}
      />
      <pointLight
        intensity={lights.pointIntensity}
        color={lights.pointColor}
        position={[lights.pointX, lights.pointY, lights.pointZ]}
      />
    </>
  );
}

function ScenePostProcessing({ pp }: { pp: PostProcessingState }) {
  if (!pp.bloomEnabled && !pp.ssaoEnabled && !pp.vignetteEnabled && !pp.noiseEnabled && !pp.toneMappingEnabled)
    return null;
  return (
    <EffectComposer multisampling={4}>
      {pp.bloomEnabled ? <Bloom intensity={pp.bloomIntensity} luminanceThreshold={pp.bloomThreshold} luminanceSmoothing={pp.bloomSmoothing} mipmapBlur /> : <></>}
      {pp.ssaoEnabled ? <SSAO intensity={pp.ssaoIntensity} radius={pp.ssaoRadius} bias={0.005} samples={16} /> : <></>}
      {pp.vignetteEnabled ? <Vignette offset={pp.vignetteOffset} darkness={pp.vignetteDarkness} blendFunction={BlendFunction.NORMAL} /> : <></>}
      {pp.noiseEnabled ? <Noise opacity={pp.noiseOpacity} blendFunction={BlendFunction.ADD} /> : <></>}
      {pp.toneMappingEnabled ? <ToneMapping mode={ToneMappingMode.ACES_FILMIC} exposure={pp.toneMappingExposure} /> : <></>}
    </EffectComposer>
  );
}

// ─── Export helper ────────────────────────────────────────────────────────────

const ExportHelper = forwardRef<ExportRef>(function ExportHelper(_, ref) {
  const { gl, scene, camera } = useThree();
  useImperativeHandle(ref, () => ({
    exportImage(format: "png" | "jpg", resolution: number) {
      const size = new THREE.Vector2();
      gl.getSize(size);
      gl.setSize(size.x * resolution, size.y * resolution, false);
      gl.setPixelRatio(window.devicePixelRatio * resolution);
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL(format === "jpg" ? "image/jpeg" : "image/png", 0.95);
      gl.setSize(size.x, size.y, false);
      gl.setPixelRatio(window.devicePixelRatio);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `render.${format}`;
      a.click();
    },
  }));
  return null;
});

// ─── Background (CSS, per-tab) ────────────────────────────────────────────────

function BgLayer({ bg }: { bg: BackgroundState }) {
  let style: React.CSSProperties = {};
  if (bg.type === "solid") {
    style = { backgroundColor: bg.solidColor };
  } else if (bg.type === "gradient") {
    style = { background: `linear-gradient(180deg, ${bg.gradientFrom} 0%, ${bg.gradientTo} 100%)` };
  } else if (bg.type === "image" && bg.imageUrl) {
    style = { backgroundImage: `url(${bg.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" };
  } else {
    style = { backgroundColor: "#020818" };
  }
  return <div className="absolute inset-0 z-0" style={style} />;
}

// ─── Single tab canvas ────────────────────────────────────────────────────────

interface TabCanvasProps {
  lights: LightsState;
  pp: PostProcessingState;
  bg: BackgroundState;
  exportRef: React.RefObject<ExportRef | null>;
  children: React.ReactNode;
}

function TabCanvas({ lights, pp, bg, exportRef, children }: TabCanvasProps) {
  return (
    <div className="absolute inset-0">
      <BgLayer bg={bg} />
      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: THREE.NoToneMapping,
          }}
          dpr={[1, 2]}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <PerspectiveCamera makeDefault fov={45} position={[0, 3, 8]} near={0.1} far={500} />
          <Environment preset="studio" background={false} />
          <SceneLights lights={lights} />
          {children}
          <ScenePostProcessing pp={pp} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={1} maxDistance={60} maxPolarAngle={0.9 * Math.PI} />
          <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
            <GizmoViewport axisColors={["#ef4444", "#22c55e", "#3b82f6"]} labelColor="white" />
          </GizmoHelper>
          <ExportHelper ref={exportRef} />
        </Canvas>
      </div>
    </div>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export interface SceneHandle {
  exportImage: (format: "png" | "jpg", resolution: number) => void;
}

interface SceneProps {
  exportRef: React.RefObject<ExportRef | null>;
}

export default function Scene({ exportRef }: SceneProps) {
  const activePanel   = useEditorStore((s) => s.activePanel);
  const isExporting   = useEditorStore((s) => s.isExporting);

  const assetsBg    = useEditorStore((s) => s.assetsBackground);
  const assetsLights = useEditorStore((s) => s.assetsLights);
  const assetsPP    = useEditorStore((s) => s.assetsPostProcessing);

  const textBg      = useEditorStore((s) => s.textBackground);
  const textLights  = useEditorStore((s) => s.textLights);
  const textPP      = useEditorStore((s) => s.textPostProcessing);

  const assetsExportRef = useRef<ExportRef>(null);
  const textExportRef   = useRef<ExportRef>(null);

  useLayoutEffect(() => {
    if (!exportRef) return;
    (exportRef as React.MutableRefObject<ExportRef | null>).current = {
      exportImage(format: "png" | "jpg", resolution: number) {
        if (activePanel === "assets") assetsExportRef.current?.exportImage(format, resolution);
        else textExportRef.current?.exportImage(format, resolution);
      },
    };
  }, [activePanel, exportRef]);

  return (
    <div className="absolute inset-0 z-10" style={{ pointerEvents: "auto" }}>
      {/* Canvas 밖에서 폰트 로딩 — display:none 영향 없이 항상 실행 */}
      <FontPreloader />

      {/* Assets Canvas */}
      <div
        className="absolute inset-0"
        style={{ display: activePanel === "assets" ? "block" : "none" }}
      >
        <TabCanvas lights={assetsLights} pp={assetsPP} bg={assetsBg} exportRef={assetsExportRef}>
          <Suspense fallback={null}>
            <SVGLoader3D />
          </Suspense>
        </TabCanvas>
      </div>

      {/* Text Canvas */}
      <div
        className="absolute inset-0"
        style={{ display: activePanel === "text" ? "block" : "none" }}
      >
        <TabCanvas lights={textLights} pp={textPP} bg={textBg} exportRef={textExportRef}>
          <FontLoader />
        </TabCanvas>
      </div>

      {isExporting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-300">Rendering…</span>
          </div>
        </div>
      )}
    </div>
  );
}
