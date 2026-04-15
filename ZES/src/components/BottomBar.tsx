"use client";

import { useState, useCallback } from "react";
import {
  Layers,
  Type,
  Box,
  Palette,
  ImageIcon,
  Sparkles,
  Sun,
  Download,
  Upload,
  FileText,
  X,
  ChevronDown,
} from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import {
  useEditorStore,
  useActiveBackground,
  useSetActiveBackground,
  useActiveLights,
  useSetActiveLights,
  useActivePostProcessing,
  useSetActivePostProcessing,
} from "@/store";
import type { ExportRef } from "./TopBar";

// ─── Font list ────────────────────────────────────────────────────────────────

const FONTS = [
  { name: "Roboto", variants: [{ label: "Regular", path: "/asset/font-json/Roboto-Regular.json" }, { label: "Bold", path: "/asset/font-json/Roboto-Bold.json" }] },
  { name: "Montserrat", variants: [{ label: "Regular", path: "/asset/font-json/Montserrat-Regular.json" }, { label: "Bold", path: "/asset/font-json/Montserrat-Bold.json" }] },
  { name: "Google Sans", variants: [{ label: "Regular", path: "/asset/font-json/GoogleSans-Regular.json" }, { label: "Bold", path: "/asset/font-json/GoogleSans-Bold.json" }] },
  { name: "Instrument Serif", variants: [{ label: "Regular", path: "/asset/font-json/InstrumentSerif-Regular.json" }] },
  { name: "Noto Sans KR", variants: [{ label: "Regular", path: "/asset/font-json/NotoSansKR-Regular.json" }, { label: "Bold", path: "/asset/font-json/NotoSansKR-Bold.json" }] },
];

function getFontVariants(name: string) {
  return FONTS.find((f) => f.name === name)?.variants ?? [];
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Divider() {
  return <div className="my-4 border-t border-white/[0.06]" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
      {label}
    </p>
  );
}

function SliderRow({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[12px] text-slate-400">{label}</span>
        <span className="text-[11px] text-slate-500 font-mono bg-white/[0.05] px-2 py-0.5 rounded-md">
          {value.toFixed(step < 0.1 ? 2 : 1)}
        </span>
      </div>
      <Slider.Root min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])}
        className="relative flex items-center w-full h-5">
        <Slider.Track className="relative grow rounded-full h-[3px] bg-white/[0.08]">
          <Slider.Range className="absolute rounded-full h-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-grab active:cursor-grabbing" />
      </Slider.Root>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
        style={{ padding: "2px" }} />
      <span className="text-[12px] text-slate-400 flex-1">{label}</span>
      <span className="text-[11px] text-slate-500 font-mono">{value.toUpperCase()}</span>
    </div>
  );
}

function SwitchRow({ id, label, checked, onCheckedChange, children }: {
  id: string; label: string; checked: boolean; onCheckedChange: (v: boolean) => void; children?: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3 py-2.5">
        <span className="flex-1 text-[12px] text-slate-300">{label}</span>
        <Switch.Root id={id} checked={checked} onCheckedChange={onCheckedChange}
          className="w-9 h-5 rounded-full bg-white/10 data-[state=checked]:bg-blue-600 transition-colors relative flex-shrink-0">
          <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
        </Switch.Root>
      </div>
      {checked && <div className="mt-2 pl-1">{children}</div>}
    </div>
  );
}

// ─── Panel contents ───────────────────────────────────────────────────────────

// Object panel — SVG upload / Text input / font
function ObjectPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const svg = useEditorStore((s) => s.svg);
  const setSvg = useEditorStore((s) => s.setSvg);
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  const handleSvgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSvg({ url: URL.createObjectURL(file), name: file.name });
  }, [setSvg]);

  if (activePanel === "assets") {
    return (
      <div className="flex gap-8">
        {/* SVG Upload */}
        <div className="w-56 flex-shrink-0">
          <SectionLabel label="SVG File" />
          <label className="flex flex-col items-center justify-center gap-2.5 w-full h-28 border border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-950/10 transition-all group">
            <input type="file" accept=".svg" className="hidden" onChange={handleSvgUpload} />
            <Upload size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
            <p className="text-[11px] text-blue-400 font-medium">SVG 업로드</p>
          </label>
          {svg.name && (
            <div className="flex items-center gap-2.5 p-2.5 bg-blue-950/20 border border-blue-900/30 rounded-lg mt-2.5">
              <FileText size={12} className="text-blue-400 flex-shrink-0" />
              <span className="text-[11px] text-blue-300 truncate flex-1">{svg.name}</span>
              <button onClick={() => setSvg({ url: "/globe.svg", name: "globe.svg" })} className="text-slate-600 hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Auto rotate */}
        <div className="w-44 flex-shrink-0">
          <SectionLabel label="Options" />
          <SwitchRow id="svg-autorotate" label="Auto Rotate" checked={svg.autoRotate} onCheckedChange={(v) => setSvg({ autoRotate: v })} />
        </div>
      </div>
    );
  }

  // Text tab
  return (
    <div className="flex gap-8">
      <div className="w-56 flex-shrink-0">
        <SectionLabel label="Text Content" />
        <textarea
          value={text.content}
          onChange={(e) => setText({ content: e.target.value })}
          placeholder="텍스트 입력…"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[13px] rounded-xl px-3.5 py-3 outline-none focus:border-blue-500/60 resize-none placeholder:text-slate-600 transition-colors leading-relaxed"
        />
      </div>
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Font Family" />
        <select value={text.fontFamily} onChange={(e) => {
          const name = e.target.value;
          const variants = getFontVariants(name);
          const path = variants.find((v) => v.label === "Bold")?.path ?? variants[0]?.path ?? "";
          setText({ fontFamily: name, fontVariant: path });
        }}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[12px] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500/60 transition-colors appearance-none mb-3">
          {FONTS.map((f) => <option key={f.name} value={f.name} className="bg-[#0e1117]">{f.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          {getFontVariants(text.fontFamily).map((v) => (
            <button key={v.path} onClick={() => setText({ fontVariant: v.path })}
              className={`py-2 rounded-xl text-[11px] font-semibold transition-all ${text.fontVariant === v.path ? "bg-blue-600 text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="w-40 flex-shrink-0">
        <SectionLabel label="Options" />
        <SwitchRow id="text-visible" label="Show Text" checked={text.visible} onCheckedChange={(v) => setText({ visible: v })} />
      </div>
    </div>
  );
}

// Material panel
const TEXT_MATERIAL_TYPES = [
  { key: "standard", label: "Standard", desc: "PBR" },
  { key: "metallic", label: "Metallic", desc: "Mirror" },
  { key: "glass", label: "Glass", desc: "Refractive" },
  { key: "neon", label: "Neon", desc: "Emissive" },
  { key: "matte", label: "Matte", desc: "Lambert" },
  { key: "holographic", label: "Holo", desc: "Shimmer" },
];

function MaterialPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const svg = useEditorStore((s) => s.svg);
  const setSvg = useEditorStore((s) => s.setSvg);
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  if (activePanel === "assets") {
    return (
      <div className="flex gap-8">
        <div className="w-48 flex-shrink-0">
          <SectionLabel label="Color" />
          <ColorRow label="Base Color" value={svg.color} onChange={(v) => setSvg({ color: v })} />
        </div>
        <div className="w-48 flex-shrink-0">
          <SectionLabel label="PBR" />
          <SliderRow label="Metalness" value={svg.metalness} min={0} max={1} step={0.01} onChange={(v) => setSvg({ metalness: v })} />
          <SliderRow label="Roughness" value={svg.roughness} min={0} max={1} step={0.01} onChange={(v) => setSvg({ roughness: v })} />
        </div>
      </div>
    );
  }

  // Text material
  return (
    <div className="flex gap-8">
      {/* Preset */}
      <div className="flex-shrink-0">
        <SectionLabel label="Preset" />
        <div className="grid grid-cols-3 gap-2">
          {TEXT_MATERIAL_TYPES.map(({ key, label, desc }) => (
            <button key={key} onClick={() => setText({ materialType: key })}
              className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-left transition-all w-[88px] ${text.materialType === key ? "bg-blue-600/30 border border-blue-500/50" : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]"}`}>
              <span className={`text-[12px] font-semibold ${text.materialType === key ? "text-blue-300" : "text-slate-300"}`}>{label}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Color" />
        <ColorRow label="Base" value={text.color} onChange={(v) => setText({ color: v })} />
        {(text.materialType === "neon" || text.materialType === "holographic" || text.materialType === "standard") && (
          <ColorRow label="Emissive" value={text.emissiveColor} onChange={(v) => setText({ emissiveColor: v })} />
        )}
        {(text.materialType === "neon" || text.materialType === "standard") && (
          <SliderRow label="Emissive Intensity" value={text.emissiveIntensity} min={0} max={5} step={0.05} onChange={(v) => setText({ emissiveIntensity: v })} />
        )}
      </div>

      {/* PBR */}
      {(text.materialType === "standard" || text.materialType === "metallic") && (
        <div className="w-48 flex-shrink-0">
          <SectionLabel label="PBR" />
          <SliderRow label="Metalness" value={text.metalness} min={0} max={1} step={0.01} onChange={(v) => setText({ metalness: v })} />
          <SliderRow label="Roughness" value={text.roughness} min={0} max={1} step={0.01} onChange={(v) => setText({ roughness: v })} />
        </div>
      )}

      {text.materialType !== "glass" && (
        <div className="w-44 flex-shrink-0">
          <SectionLabel label="Opacity" />
          <SliderRow label="Opacity" value={text.opacity} min={0} max={1} step={0.01} onChange={(v) => setText({ opacity: v })} />
        </div>
      )}
    </div>
  );
}

// Geometry panel
function GeometryPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const svg = useEditorStore((s) => s.svg);
  const setSvg = useEditorStore((s) => s.setSvg);
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  if (activePanel === "assets") {
    return (
      <div className="flex gap-8">
        <div className="w-56 flex-shrink-0">
          <SectionLabel label="Extrude" />
          <SliderRow label="Depth" value={svg.depth} min={0.5} max={40} step={0.5} onChange={(v) => setSvg({ depth: v })} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Shape" />
        <SliderRow label="Size" value={text.size} min={0.1} max={5} step={0.05} onChange={(v) => setText({ size: v })} />
        <SliderRow label="Depth" value={text.depth} min={0} max={1} step={0.01} onChange={(v) => setText({ depth: v })} />
      </div>
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Spacing" />
        <SliderRow label="Letter Spacing" value={text.letterSpacing} min={-0.5} max={1} step={0.01} onChange={(v) => setText({ letterSpacing: v })} />
        <SliderRow label="Position Y" value={text.positionY} min={-5} max={5} step={0.05} onChange={(v) => setText({ positionY: v })} />
      </div>
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Bevel" />
        <SwitchRow id="bevel" label="Enabled" checked={text.bevelEnabled} onCheckedChange={(v) => setText({ bevelEnabled: v })}>
          <SliderRow label="Thickness" value={text.bevelThickness} min={0} max={0.2} step={0.002} onChange={(v) => setText({ bevelThickness: v })} />
          <SliderRow label="Size" value={text.bevelSize} min={0} max={0.1} step={0.001} onChange={(v) => setText({ bevelSize: v })} />
        </SwitchRow>
      </div>
    </div>
  );
}

// Environment panel
function EnvironmentPanel() {
  const bg = useActiveBackground();
  const setBg = useSetActiveBackground();
  const lights = useActiveLights();
  const setLights = useSetActiveLights();

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBg({ type: "image", imageUrl: URL.createObjectURL(file) });
  }, [setBg]);

  return (
    <div className="flex gap-8">
      {/* Background */}
      <div className="w-56 flex-shrink-0">
        <SectionLabel label="Background" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["solid", "gradient", "image"] as const).map((t) => (
            <button key={t} onClick={() => setBg({ type: t })}
              className={`py-2 rounded-xl text-[11px] font-semibold capitalize transition-all ${bg.type === t ? "bg-blue-600 text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
              {t}
            </button>
          ))}
        </div>
        {bg.type === "solid" && (
          <ColorRow label="Color" value={bg.solidColor} onChange={(v) => setBg({ solidColor: v })} />
        )}
        {bg.type === "gradient" && (
          <>
            <ColorRow label="Top" value={bg.gradientFrom} onChange={(v) => setBg({ gradientFrom: v })} />
            <ColorRow label="Bottom" value={bg.gradientTo} onChange={(v) => setBg({ gradientTo: v })} />
          </>
        )}
        {bg.type === "image" && (
          <label className="flex flex-col items-center justify-center gap-2 w-full h-20 border border-dashed border-white/[0.08] rounded-xl cursor-pointer hover:border-blue-500/40 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Upload size={15} className="text-slate-600" />
            <span className="text-[10px] text-slate-600">이미지 업로드</span>
          </label>
        )}
      </div>

      {/* Ambient */}
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Ambient Light" />
        <SliderRow label="Intensity" value={lights.ambientIntensity} min={0} max={3} step={0.01} onChange={(v) => setLights({ ambientIntensity: v })} />
        <ColorRow label="Color" value={lights.ambientColor} onChange={(v) => setLights({ ambientColor: v })} />
      </div>

      {/* Directional */}
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Directional Light" />
        <SliderRow label="Intensity" value={lights.directionalIntensity} min={0} max={5} step={0.01} onChange={(v) => setLights({ directionalIntensity: v })} />
        <ColorRow label="Color" value={lights.directionalColor} onChange={(v) => setLights({ directionalColor: v })} />
      </div>

      {/* Point */}
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Point Light" />
        <SliderRow label="Intensity" value={lights.pointIntensity} min={0} max={5} step={0.01} onChange={(v) => setLights({ pointIntensity: v })} />
        <ColorRow label="Color" value={lights.pointColor} onChange={(v) => setLights({ pointColor: v })} />
      </div>
    </div>
  );
}

// Post Processing panel
function EffectsPanel() {
  const pp = useActivePostProcessing();
  const setPP = useSetActivePostProcessing();

  return (
    <div className="flex gap-8">
      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Bloom" />
        <SwitchRow id="bloom" label="Enabled" checked={pp.bloomEnabled} onCheckedChange={(v) => setPP({ bloomEnabled: v })}>
          <SliderRow label="Intensity" value={pp.bloomIntensity} min={0} max={3} step={0.01} onChange={(v) => setPP({ bloomIntensity: v })} />
          <SliderRow label="Threshold" value={pp.bloomThreshold} min={0} max={1} step={0.01} onChange={(v) => setPP({ bloomThreshold: v })} />
          <SliderRow label="Smoothing" value={pp.bloomSmoothing} min={0} max={1} step={0.01} onChange={(v) => setPP({ bloomSmoothing: v })} />
        </SwitchRow>
      </div>

      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Vignette" />
        <SwitchRow id="vignette" label="Enabled" checked={pp.vignetteEnabled} onCheckedChange={(v) => setPP({ vignetteEnabled: v })}>
          <SliderRow label="Offset" value={pp.vignetteOffset} min={0} max={1} step={0.01} onChange={(v) => setPP({ vignetteOffset: v })} />
          <SliderRow label="Darkness" value={pp.vignetteDarkness} min={0} max={1} step={0.01} onChange={(v) => setPP({ vignetteDarkness: v })} />
        </SwitchRow>
      </div>

      <div className="w-48 flex-shrink-0">
        <SectionLabel label="SSAO" />
        <SwitchRow id="ssao" label="Enabled" checked={pp.ssaoEnabled} onCheckedChange={(v) => setPP({ ssaoEnabled: v })}>
          <SliderRow label="Intensity" value={pp.ssaoIntensity} min={0} max={100} step={1} onChange={(v) => setPP({ ssaoIntensity: v })} />
          <SliderRow label="Radius" value={pp.ssaoRadius} min={0.1} max={20} step={0.1} onChange={(v) => setPP({ ssaoRadius: v })} />
        </SwitchRow>
      </div>

      <div className="w-48 flex-shrink-0">
        <SectionLabel label="Film Noise" />
        <SwitchRow id="noise" label="Enabled" checked={pp.noiseEnabled} onCheckedChange={(v) => setPP({ noiseEnabled: v })}>
          <SliderRow label="Opacity" value={pp.noiseOpacity} min={0} max={0.5} step={0.005} onChange={(v) => setPP({ noiseOpacity: v })} />
        </SwitchRow>
        <Divider />
        <SectionLabel label="Tone Mapping" />
        <SwitchRow id="toneMapping" label="ACES Filmic" checked={pp.toneMappingEnabled} onCheckedChange={(v) => setPP({ toneMappingEnabled: v })}>
          <SliderRow label="Exposure" value={pp.toneMappingExposure} min={0} max={4} step={0.01} onChange={(v) => setPP({ toneMappingExposure: v })} />
        </SwitchRow>
      </div>
    </div>
  );
}

// Export panel
function ExportPanel({ exportRef }: { exportRef: React.RefObject<ExportRef | null> }) {
  const format = useEditorStore((s) => s.exportFormat);
  const setFormat = useEditorStore((s) => s.setExportFormat);
  const isExporting = useEditorStore((s) => s.isExporting);
  const setIsExporting = useEditorStore((s) => s.setIsExporting);

  const handleExport = useCallback(() => {
    if (!exportRef.current) return;
    setIsExporting(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        exportRef.current?.exportImage(format, 1);
        setIsExporting(false);
      }, 100);
    });
  }, [exportRef, format, setIsExporting]);

  return (
    <div className="flex gap-8 items-start">
      <div className="flex-shrink-0">
        <SectionLabel label="Format" />
        <div className="flex gap-2">
          {(["png", "jpg"] as const).map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={`px-6 py-2.5 rounded-xl text-[12px] font-semibold uppercase transition-all ${format === f ? "bg-blue-600 text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0">
        <SectionLabel label="Export" />
        <button onClick={handleExport} disabled={isExporting}
          className="flex items-center gap-2.5 px-7 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-[13px] font-semibold rounded-xl transition-all">
          <Download size={14} />
          {isExporting ? "Rendering…" : "Export Image"}
        </button>
      </div>
    </div>
  );
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

type ToolId = "object" | "material" | "geometry" | "environment" | "effects" | "export";

const TOOLS: { id: ToolId; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }[] = [
  { id: "object", icon: Box, label: "Object" },
  { id: "material", icon: Palette, label: "Material" },
  { id: "geometry", icon: Layers, label: "Geometry" },
  { id: "environment", icon: Sun, label: "Environment" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "export", icon: Download, label: "Export" },
];

// ─── BottomBar ────────────────────────────────────────────────────────────────

interface BottomBarProps {
  exportRef: React.RefObject<ExportRef | null>;
}

export default function BottomBar({ exportRef }: BottomBarProps) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  const handleToolClick = (id: ToolId) => {
    setActiveTool((prev) => (prev === id ? null : id));
  };

  const panelOpen = activeTool !== null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2">
      {/* Floating panel — slides up when a tool is active */}
      <div
        className={`transition-all duration-200 origin-bottom ${panelOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        {panelOpen && (
          <div className="bg-[#0e1117]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 px-7 py-5 max-w-[90vw] overflow-x-auto scrollbar-hide">
            {/* Close + title */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                {TOOLS.find((t) => t.id === activeTool)?.label}
              </span>
              <button onClick={() => setActiveTool(null)} className="text-slate-600 hover:text-slate-300 transition-colors ml-8">
                <ChevronDown size={15} />
              </button>
            </div>
            {activeTool === "object" && <ObjectPanel />}
            {activeTool === "material" && <MaterialPanel />}
            {activeTool === "geometry" && <GeometryPanel />}
            {activeTool === "environment" && <EnvironmentPanel />}
            {activeTool === "effects" && <EffectsPanel />}
            {activeTool === "export" && <ExportPanel exportRef={exportRef} />}
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#0e1117]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60">
        {/* Mode toggle — Assets / Text */}
        <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 mr-2">
          <button
            onClick={() => setActivePanel("assets")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${activePanel === "assets" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <ImageIcon size={12} />
            SVG
          </button>
          <button
            onClick={() => setActivePanel("text")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${activePanel === "text" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Type size={12} />
            Text
          </button>
        </div>

        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        {/* Tool buttons */}
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleToolClick(id)}
            title={label}
            className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
              activeTool === id
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]"
            }`}
          >
            <Icon size={16} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
