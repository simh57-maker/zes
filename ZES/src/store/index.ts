import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ─── Default values ──────────────────────────────────────────────────────────

const defaultSvg = {
  url: "/asset/svg/ZES_sample.svg?v=2",
  name: "ZES_sample.svg",
  depth: 8,
  metalness: 0.9,
  roughness: 0.1,
  color: "#c0c0c0",
  autoRotate: false,
};

const defaultText = {
  content: "",
  fontFamily: "Roboto",
  fontVariant: "/asset/font/Roboto/static/Roboto-Bold.ttf",
  size: 1,
  depth: 0.2,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.015,
  letterSpacing: 0,
  materialType: "standard",
  color: "#ffffff",
  emissiveColor: "#2563eb",
  emissiveIntensity: 0,
  metalness: 0.3,
  roughness: 0.4,
  opacity: 1,
  positionY: 0,
  visible: true,
};

const defaultLights = {
  ambientIntensity: 0.4,
  ambientColor: "#ffffff",
  directionalIntensity: 1.2,
  directionalColor: "#fff5e0",
  directionalX: 5,
  directionalY: 8,
  directionalZ: 3,
  pointIntensity: 0.6,
  pointColor: "#e0f0ff",
  pointX: -5,
  pointY: 4,
  pointZ: -3,
  shadowEnabled: true,
  shadowResolution: 1024,
};

const lightingPresets: Record<string, Partial<typeof defaultLights>> = {
  studio: {
    ambientIntensity: 0.4,
    ambientColor: "#ffffff",
    directionalIntensity: 1.2,
    directionalColor: "#fff5e0",
    directionalX: 5,
    directionalY: 8,
    directionalZ: 3,
    pointIntensity: 0.6,
    pointColor: "#e0f0ff",
    pointX: -5,
    pointY: 4,
    pointZ: -3,
  },
  outdoor: {
    ambientIntensity: 0.7,
    ambientColor: "#d0e8ff",
    directionalIntensity: 1.8,
    directionalColor: "#fff8d0",
    directionalX: 10,
    directionalY: 15,
    directionalZ: 5,
    pointIntensity: 0.2,
    pointColor: "#ffffff",
    pointX: 0,
    pointY: 5,
    pointZ: 0,
  },
  dramatic: {
    ambientIntensity: 0.1,
    ambientColor: "#1a1a2e",
    directionalIntensity: 2.5,
    directionalColor: "#ff6b35",
    directionalX: -8,
    directionalY: 5,
    directionalZ: -3,
    pointIntensity: 1.2,
    pointColor: "#4040ff",
    pointX: 5,
    pointY: -2,
    pointZ: 5,
  },
};

const defaultBackground = {
  type: "solid" as "solid" | "gradient" | "image",
  solidColor: "#0f1117",
  gradientFrom: "#1e1b4b",
  gradientTo: "#0f172a",
  imageUrl: null as string | null,
};

const defaultPostProcessing = {
  bloomEnabled: true,
  bloomIntensity: 0.8,
  bloomThreshold: 0.85,
  bloomSmoothing: 0.3,
  ssaoEnabled: false,
  ssaoIntensity: 30,
  ssaoRadius: 5,
  vignetteEnabled: true,
  vignetteOffset: 0.5,
  vignetteDarkness: 0.7,
  noiseEnabled: false,
  noiseOpacity: 0.05,
  toneMappingEnabled: true,
  toneMappingExposure: 1,
};

// ─── Store types ─────────────────────────────────────────────────────────────

export type ActivePanel = "assets" | "text";

export interface EditorStore {
  svg: typeof defaultSvg;
  setSvg: (v: Partial<typeof defaultSvg>) => void;

  model: { url: string | null; name: string | null; format: string | null };
  setModel: (v: { url: string | null; name: string | null; format: string | null }) => void;

  background: typeof defaultBackground;
  setBackground: (v: Partial<typeof defaultBackground>) => void;

  lights: typeof defaultLights;
  setLights: (v: Partial<typeof defaultLights>) => void;
  lightingPreset: string;
  setLightingPreset: (v: string) => void;

  postProcessing: typeof defaultPostProcessing;
  setPostProcessing: (v: Partial<typeof defaultPostProcessing>) => void;

  autoRotate: boolean;
  setAutoRotate: (v: boolean) => void;

  text: typeof defaultText;
  setText: (v: Partial<typeof defaultText>) => void;

  activePanel: ActivePanel;
  setActivePanel: (v: ActivePanel) => void;

  isExporting: boolean;
  setIsExporting: (v: boolean) => void;

  exportResolution: number;
  setExportResolution: (v: number) => void;

  exportFormat: "png" | "jpg";
  setExportFormat: (v: "png" | "jpg") => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set) => ({
    svg: defaultSvg,
    setSvg: (v) => set((s) => ({ svg: { ...s.svg, ...v } })),

    model: { url: null, name: null, format: null },
    setModel: (v) => set({ model: v }),

    background: defaultBackground,
    setBackground: (v) => set((s) => ({ background: { ...s.background, ...v } })),

    lights: defaultLights,
    setLights: (v) =>
      set((s) => ({ lights: { ...s.lights, ...v }, lightingPreset: "custom" })),
    lightingPreset: "studio",
    setLightingPreset: (v) =>
      set((s) => ({
        lightingPreset: v,
        lights: { ...s.lights, ...(lightingPresets[v] ?? {}) },
      })),

    postProcessing: defaultPostProcessing,
    setPostProcessing: (v) =>
      set((s) => ({ postProcessing: { ...s.postProcessing, ...v } })),

    autoRotate: false,
    setAutoRotate: (v) => set({ autoRotate: v }),

    text: defaultText,
    setText: (v) => set((s) => ({ text: { ...s.text, ...v } })),

    // 탭별 상태는 각자 독립적으로 유지됨
    activePanel: "assets",
    setActivePanel: (v) => set({ activePanel: v }),

    isExporting: false,
    setIsExporting: (v) => set({ isExporting: v }),

    exportResolution: 2,
    setExportResolution: (v) => set({ exportResolution: v }),

    exportFormat: "png",
    setExportFormat: (v) => set({ exportFormat: v }),
  }))
);
