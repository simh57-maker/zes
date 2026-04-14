"use client";

import { useCallback } from "react";
import { Layers, Type, Upload, FileText, X, RotateCcw } from "lucide-react";
import { useEditorStore, useActiveBackground, useSetActiveBackground } from "@/store";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";

// ─── Font list ────────────────────────────────────────────────────────────────

const FONTS = [
  {
    name: "Roboto",
    variants: [
      { label: "Thin", path: "/asset/font/Roboto/static/Roboto-Thin.ttf" },
      { label: "Light", path: "/asset/font/Roboto/static/Roboto-Light.ttf" },
      { label: "Regular", path: "/asset/font/Roboto/static/Roboto-Regular.ttf" },
      { label: "Medium", path: "/asset/font/Roboto/static/Roboto-Medium.ttf" },
      { label: "SemiBold", path: "/asset/font/Roboto/static/Roboto-SemiBold.ttf" },
      { label: "Bold", path: "/asset/font/Roboto/static/Roboto-Bold.ttf" },
      { label: "ExtraBold", path: "/asset/font/Roboto/static/Roboto-ExtraBold.ttf" },
      { label: "Black", path: "/asset/font/Roboto/static/Roboto-Black.ttf" },
    ],
  },
  {
    name: "Montserrat",
    variants: [
      { label: "Thin", path: "/asset/font/Montserrat/static/Montserrat-Thin.ttf" },
      { label: "Light", path: "/asset/font/Montserrat/static/Montserrat-Light.ttf" },
      { label: "Regular", path: "/asset/font/Montserrat/static/Montserrat-Regular.ttf" },
      { label: "Medium", path: "/asset/font/Montserrat/static/Montserrat-Medium.ttf" },
      { label: "SemiBold", path: "/asset/font/Montserrat/static/Montserrat-SemiBold.ttf" },
      { label: "Bold", path: "/asset/font/Montserrat/static/Montserrat-Bold.ttf" },
      { label: "ExtraBold", path: "/asset/font/Montserrat/static/Montserrat-ExtraBold.ttf" },
      { label: "Black", path: "/asset/font/Montserrat/static/Montserrat-Black.ttf" },
    ],
  },
  {
    name: "Google Sans",
    variants: [
      { label: "Regular", path: "/asset/font/Google_Sans/static/GoogleSans-Regular.ttf" },
      { label: "Medium", path: "/asset/font/Google_Sans/static/GoogleSans-Medium.ttf" },
      { label: "SemiBold", path: "/asset/font/Google_Sans/static/GoogleSans-SemiBold.ttf" },
      { label: "Bold", path: "/asset/font/Google_Sans/static/GoogleSans-Bold.ttf" },
      { label: "Italic", path: "/asset/font/Google_Sans/static/GoogleSans-Italic.ttf" },
      { label: "Bold Italic", path: "/asset/font/Google_Sans/static/GoogleSans-BoldItalic.ttf" },
    ],
  },
  {
    name: "Instrument Serif",
    variants: [
      { label: "Regular", path: "/asset/font/Instrument_Serif/InstrumentSerif-Regular.ttf" },
      { label: "Italic", path: "/asset/font/Instrument_Serif/InstrumentSerif-Italic.ttf" },
    ],
  },
  {
    name: "Noto Sans KR",
    variants: [
      { label: "Thin", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Thin.ttf" },
      { label: "Light", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Light.ttf" },
      { label: "Regular", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Regular.ttf" },
      { label: "Medium", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Medium.ttf" },
      { label: "SemiBold", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-SemiBold.ttf" },
      { label: "Bold", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Bold.ttf" },
      { label: "ExtraBold", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-ExtraBold.ttf" },
      { label: "Black", path: "/asset/font/Noto_Sans_KR/static/NotoSansKR-Black.ttf" },
    ],
  },
];

function getFontVariants(name: string) {
  return FONTS.find((f) => f.name === name)?.variants ?? [];
}

// ─── Small shared components ──────────────────────────────────────────────────

function Divider() {
  return <div className="mx-3 border-t border-white/[0.06]" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-1">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="px-3 pb-2 space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
          {value.toFixed(step < 0.1 ? 2 : 1)}
        </span>
      </div>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="relative flex items-center w-full h-4"
      >
        <Slider.Track className="relative grow rounded-full h-[3px] bg-white/[0.08]">
          <Slider.Range className="absolute rounded-full h-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-md focus:outline-none" />
      </Slider.Root>
    </div>
  );
}

function SwitchRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span className="flex-1 text-[12px] text-slate-300">{label}</span>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-8 h-4 rounded-full bg-white/10 data-[state=checked]:bg-blue-600 transition-colors relative"
      >
        <Switch.Thumb className="block w-3 h-3 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
      </Switch.Root>
    </div>
  );
}

// ─── Assets panel ─────────────────────────────────────────────────────────────

function AssetsPanel() {
  const svg = useEditorStore((s) => s.svg);
  const setSvg = useEditorStore((s) => s.setSvg);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setSvg({ url: URL.createObjectURL(file), name: file.name });
    },
    [setSvg]
  );

  return (
    <>
      <SectionLabel label="SVG Extrude" />
      <div className="px-3 pb-2">
        <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border border-dashed border-white/[0.1] rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-950/10 transition-all group">
          <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          <Upload
            size={16}
            className="text-slate-500 group-hover:text-blue-400 transition-colors"
          />
          <span className="text-[10px] text-slate-500 text-center group-hover:text-slate-400 transition-colors">
            <span className="text-blue-400 font-medium">SVG</span> 파일 업로드
          </span>
        </label>
      </div>

      {svg.name && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 p-2.5 bg-blue-950/20 border border-blue-900/30 rounded-xl">
            <FileText size={12} className="text-blue-400 flex-shrink-0" />
            <span className="text-[11px] text-blue-300 truncate flex-1">{svg.name}</span>
            <button
              onClick={() =>
                setSvg({ url: "/asset/svg/ZES_sample.svg?v=2", name: "ZES_sample.svg" })
              }
              className="text-slate-600 hover:text-red-400 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        </div>
      )}

      <Divider />
      <SectionLabel label="Material" />
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <input
            type="color"
            value={svg.color}
            onChange={(e) => setSvg({ color: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
            style={{ padding: "2px" }}
          />
          <span className="text-[11px] text-slate-400 font-mono flex-1">
            {svg.color.toUpperCase()}
          </span>
        </div>
      </div>
      <SliderRow
        label="Metalness"
        value={svg.metalness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setSvg({ metalness: v })}
      />
      <SliderRow
        label="Roughness"
        value={svg.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setSvg({ roughness: v })}
      />

      <Divider />
      <SectionLabel label="Geometry" />
      <SliderRow
        label="Depth"
        value={svg.depth}
        min={0.5}
        max={40}
        step={0.5}
        onChange={(v) => setSvg({ depth: v })}
      />

      <Divider />
      <SwitchRow
        id="svg-autorotate"
        label="Auto Rotate"
        checked={svg.autoRotate}
        onCheckedChange={(v) => setSvg({ autoRotate: v })}
      />
    </>
  );
}

// ─── Text panel ───────────────────────────────────────────────────────────────

const MATERIAL_TYPES = [
  { key: "standard", label: "Standard", desc: "PBR" },
  { key: "metallic", label: "Metallic", desc: "Mirror" },
  { key: "glass", label: "Glass", desc: "Refractive" },
  { key: "neon", label: "Neon", desc: "Emissive" },
  { key: "matte", label: "Matte", desc: "Lambert" },
  { key: "holographic", label: "Holographic", desc: "Shimmer" },
];

function TextPanel() {
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  return (
    <>
      <SectionLabel label="3D Text" />
      <div className="px-3 pb-2">
        <textarea
          value={text.content}
          onChange={(e) => setText({ content: e.target.value })}
          placeholder="텍스트 입력…"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[12px] rounded-xl px-3 py-2 outline-none focus:border-blue-500/60 resize-none placeholder:text-slate-600 transition-colors"
        />
      </div>

      <Divider />
      <SectionLabel label="Font Family" />
      <div className="px-3 pb-2">
        <select
          value={text.fontFamily}
          onChange={(e) => {
            const name = e.target.value;
            const variants = getFontVariants(name);
            const path =
              variants.find((v) => v.label === "Bold")?.path ??
              variants.find((v) => v.label === "Regular")?.path ??
              variants[0]?.path ??
              "";
            setText({ fontFamily: name, fontVariant: path });
          }}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[12px] rounded-xl px-3 py-2 outline-none focus:border-blue-500/60 transition-colors"
        >
          {FONTS.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <SectionLabel label="Weight / Style" />
      <div className="px-3 pb-2">
        <div className="grid grid-cols-2 gap-1">
          {getFontVariants(text.fontFamily).map((v) => (
            <button
              key={v.path}
              onClick={() => setText({ fontVariant: v.path })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold truncate transition-all ${
                text.fontVariant === v.path
                  ? "bg-blue-600 text-white"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06]"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <Divider />
      <SwitchRow
        id="text-visible"
        label="Show Text"
        checked={text.visible}
        onCheckedChange={(v) => setText({ visible: v })}
      />
    </>
  );
}

// ─── Background panel ─────────────────────────────────────────────────────────

function BackgroundPanel() {
  const bg = useActiveBackground();
  const setBg = useSetActiveBackground();

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setBg({ type: "image", imageUrl: URL.createObjectURL(file) });
    },
    [setBg]
  );

  return (
    <>
      <Divider />
      <SectionLabel label="Background" />
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 gap-1">
          {(["solid", "gradient", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBg({ type: t })}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                bg.type === t
                  ? "bg-blue-600 text-white"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {bg.type === "solid" && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.solidColor}
              onChange={(e) => setBg({ solidColor: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
              style={{ padding: "2px" }}
            />
            <span className="text-[11px] text-slate-400 font-mono flex-1">
              {bg.solidColor.toUpperCase()}
            </span>
            <span className="text-[11px] text-slate-600">100%</span>
          </div>
        </div>
      )}

      {bg.type === "gradient" && (
        <div className="px-3 pb-3 space-y-1.5">
          <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.gradientFrom}
              onChange={(e) => setBg({ gradientFrom: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1]"
              style={{ padding: "2px" }}
            />
            <span className="text-[11px] text-slate-400 font-mono flex-1">
              {bg.gradientFrom.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-600">From</span>
          </div>
          <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.gradientTo}
              onChange={(e) => setBg({ gradientTo: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.1]"
              style={{ padding: "2px" }}
            />
            <span className="text-[11px] text-slate-400 font-mono flex-1">
              {bg.gradientTo.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-600">To</span>
          </div>
        </div>
      )}

      {bg.type === "image" && (
        <div className="px-3 pb-3">
          <label className="flex flex-col items-center justify-center gap-2 w-full h-20 border border-dashed border-white/[0.08] rounded-xl cursor-pointer hover:border-blue-500/40 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Upload size={14} className="text-slate-600" />
            <span className="text-[10px] text-slate-600">Upload image</span>
          </label>
        </div>
      )}
    </>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { key: "assets" as const, icon: Layers, label: "Assets" },
  { key: "text" as const, icon: Type, label: "Text" },
];

// ─── LeftPanel ────────────────────────────────────────────────────────────────

export default function LeftPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);
  const setActivePanel = useEditorStore((s) => s.setActivePanel);

  return (
    <div className="pointer-events-auto flex flex-col h-full w-[220px] rounded-2xl overflow-hidden bg-[#0e1117]/90 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Layers size={13} className="text-white" />
        </div>
        <span className="text-[13px] font-bold text-slate-100 tracking-tight">
          ZES <span className="text-blue-400">Editor</span>
        </span>
        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400 border border-blue-800/30 font-semibold">
          3D
        </span>
      </div>

      {/* Tab bar — 탭 전환 시 각 탭의 작업 상태는 zustand store에 유지됨 */}
      <div className="flex border-b border-white/[0.06] flex-shrink-0">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActivePanel(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-semibold transition-colors ${
              activePanel === key
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content — 각 탭의 작업화면은 완전히 분리 */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {/* Assets 탭 콘텐츠 */}
        {activePanel === "assets" && <AssetsPanel />}

        {/* Text 탭 콘텐츠 — assets 탭 상태와 완전히 독립 */}
        {activePanel === "text" && <TextPanel />}

        {/* 배경 설정은 두 탭 모두에서 공통으로 표시 */}
        <BackgroundPanel />

        <div className="h-3" />
      </div>
    </div>
  );
}
