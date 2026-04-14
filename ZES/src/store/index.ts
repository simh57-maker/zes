import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// ─── Default values ──────────────────────────────────────────────────────────

export const defaultSvg = {
  url: "/asset/svg/ZES_sample.svg?v=2",
  name: "ZES_sample.svg",
  depth: 8,
  metalness: 0.9,
  roughness: 0.1,
  color: "#c0c0c0",
  autoRotate: false,
};

export const defaultText = {
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

export type LightsState = {
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalX: number;
  directionalY: number;
  directionalZ: number;
  pointIntensity: number;
  pointColor: string;
  pointX: number;
  pointY: number;
  pointZ: number;
  shadowEnabled: boolean;
  shadowResolution: number;
};

// Assets 탭 기본 조명 — 스튜디오 느낌
const defaultAssetsLights: LightsState = {
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

// Text 탭 기본 조명 — 드라마틱 느낌
const defaultTextLights: LightsState = {
  ambientIntensity: 0.2,
  ambientColor: "#1a1a2e",
  directionalIntensity: 2.0,
  directionalColor: "#ffffff",
  directionalX: -4,
  directionalY: 6,
  directionalZ: 4,
  pointIntensity: 1.0,
  pointColor: "#4488ff",
  pointX: 3,
  pointY: 2,
  pointZ: 3,
  shadowEnabled: true,
  shadowResolution: 1024,
};

export type BackgroundState = {
  type: "solid" | "gradient" | "image";
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  imageUrl: string | null;
};

// Assets 탭 기본 배경 — 상단 #020818, 하단 #1F5EFB
const defaultAssetsBackground: BackgroundState = {
  type: "gradient",
  solidColor: "#020818",
  gradientFrom: "#020818",
  gradientTo: "#1F5EFB",
  imageUrl: null,
};

// Text 탭 기본 배경 — 상단 #020818, 하단 #1F5EFB (독립 상태)
const defaultTextBackground: BackgroundState = {
  type: "gradient",
  solidColor: "#020818",
  gradientFrom: "#020818",
  gradientTo: "#1F5EFB",
  imageUrl: null,
};

export type PostProcessingState = {
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomSmoothing: number;
  ssaoEnabled: boolean;
  ssaoIntensity: number;
  ssaoRadius: number;
  vignetteEnabled: boolean;
  vignetteOffset: number;
  vignetteDarkness: number;
  noiseEnabled: boolean;
  noiseOpacity: number;
  toneMappingEnabled: boolean;
  toneMappingExposure: number;
};

// Assets 탭 기본 후처리
const defaultAssetsPostProcessing: PostProcessingState = {
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

// Text 탭 기본 후처리 — 블룸 강조
const defaultTextPostProcessing: PostProcessingState = {
  bloomEnabled: true,
  bloomIntensity: 1.2,
  bloomThreshold: 0.7,
  bloomSmoothing: 0.4,
  ssaoEnabled: false,
  ssaoIntensity: 30,
  ssaoRadius: 5,
  vignetteEnabled: true,
  vignetteOffset: 0.4,
  vignetteDarkness: 0.8,
  noiseEnabled: false,
  noiseOpacity: 0.05,
  toneMappingEnabled: true,
  toneMappingExposure: 1.1,
};

// ─── Store types ─────────────────────────────────────────────────────────────

export type ActivePanel = "assets" | "text";

export interface EditorStore {
  // ── 탭 ──
  activePanel: ActivePanel;
  setActivePanel: (v: ActivePanel) => void;

  // ── Assets 탭 전용 상태 ──
  svg: typeof defaultSvg;
  setSvg: (v: Partial<typeof defaultSvg>) => void;

  assetsBackground: BackgroundState;
  setAssetsBackground: (v: Partial<BackgroundState>) => void;

  assetsLights: LightsState;
  setAssetsLights: (v: Partial<LightsState>) => void;

  assetsPostProcessing: PostProcessingState;
  setAssetsPostProcessing: (v: Partial<PostProcessingState>) => void;

  // ── Text 탭 전용 상태 ──
  text: typeof defaultText;
  setText: (v: Partial<typeof defaultText>) => void;

  textBackground: BackgroundState;
  setTextBackground: (v: Partial<BackgroundState>) => void;

  textLights: LightsState;
  setTextLights: (v: Partial<LightsState>) => void;

  textPostProcessing: PostProcessingState;
  setTextPostProcessing: (v: Partial<PostProcessingState>) => void;

  // ── Export (공통) ──
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
    activePanel: "assets",
    setActivePanel: (v) => set({ activePanel: v }),

    // Assets
    svg: defaultSvg,
    setSvg: (v) => set((s) => ({ svg: { ...s.svg, ...v } })),

    assetsBackground: defaultAssetsBackground,
    setAssetsBackground: (v) =>
      set((s) => ({ assetsBackground: { ...s.assetsBackground, ...v } })),

    assetsLights: defaultAssetsLights,
    setAssetsLights: (v) =>
      set((s) => ({ assetsLights: { ...s.assetsLights, ...v } })),

    assetsPostProcessing: defaultAssetsPostProcessing,
    setAssetsPostProcessing: (v) =>
      set((s) => ({ assetsPostProcessing: { ...s.assetsPostProcessing, ...v } })),

    // Text
    text: defaultText,
    setText: (v) => set((s) => ({ text: { ...s.text, ...v } })),

    textBackground: defaultTextBackground,
    setTextBackground: (v) =>
      set((s) => ({ textBackground: { ...s.textBackground, ...v } })),

    textLights: defaultTextLights,
    setTextLights: (v) =>
      set((s) => ({ textLights: { ...s.textLights, ...v } })),

    textPostProcessing: defaultTextPostProcessing,
    setTextPostProcessing: (v) =>
      set((s) => ({ textPostProcessing: { ...s.textPostProcessing, ...v } })),

    // Export
    isExporting: false,
    setIsExporting: (v) => set({ isExporting: v }),
    exportResolution: 2,
    setExportResolution: (v) => set({ exportResolution: v }),
    exportFormat: "png",
    setExportFormat: (v) => set({ exportFormat: v }),
  }))
);

// ─── Selectors — 현재 탭 기준으로 상태를 읽는 헬퍼 ─────────────────────────

export function useActiveBackground() {
  return useEditorStore((s) =>
    s.activePanel === "assets" ? s.assetsBackground : s.textBackground
  );
}

export function useSetActiveBackground() {
  const panel = useEditorStore((s) => s.activePanel);
  const setAssets = useEditorStore((s) => s.setAssetsBackground);
  const setText = useEditorStore((s) => s.setTextBackground);
  return panel === "assets" ? setAssets : setText;
}

export function useActiveLights() {
  return useEditorStore((s) =>
    s.activePanel === "assets" ? s.assetsLights : s.textLights
  );
}

export function useSetActiveLights() {
  const panel = useEditorStore((s) => s.activePanel);
  const setAssets = useEditorStore((s) => s.setAssetsLights);
  const setText = useEditorStore((s) => s.setTextLights);
  return panel === "assets" ? setAssets : setText;
}

export function useActivePostProcessing() {
  return useEditorStore((s) =>
    s.activePanel === "assets" ? s.assetsPostProcessing : s.textPostProcessing
  );
}

export function useSetActivePostProcessing() {
  const panel = useEditorStore((s) => s.activePanel);
  const setAssets = useEditorStore((s) => s.setAssetsPostProcessing);
  const setText = useEditorStore((s) => s.setTextPostProcessing);
  return panel === "assets" ? setAssets : setText;
}
