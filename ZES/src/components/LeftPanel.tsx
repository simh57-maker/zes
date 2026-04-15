"use client";

import { useCallback } from "react";
import { Layers, Type, Upload, FileText, X } from "lucide-react";
import { useEditorStore, useActiveBackground, useSetActiveBackground } from "@/store";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";

// ─── Font list ────────────────────────────────────────────────────────────────

const FONTS = [
  {
    name: "Roboto",
    variants: [
      { label: "Regular", path: "/asset/font-json/Roboto-Regular.json" },
      { label: "Bold", path: "/asset/font-json/Roboto-Bold.json" },
    ],
  },
  {
    name: "Montserrat",
    variants: [
      { label: "Regular", path: "/asset/font-json/Montserrat-Regular.json" },
      { label: "Bold", path: "/asset/font-json/Montserrat-Bold.json" },
    ],
  },
  {
    name: "Google Sans",
    variants: [
      { label: "Regular", path: "/asset/font-json/GoogleSans-Regular.json" },
      { label: "Bold", path: "/asset/font-json/GoogleSans-Bold.json" },
    ],
  },
  {
    name: "Instrument Serif",
    variants: [
      { label: "Regular", path: "/asset/font-json/InstrumentSerif-Regular.json" },
    ],
  },
  {
    name: "Noto Sans KR",
    variants: [
      { label: "Regular", path: "/asset/font-json/NotoSansKR-Regular.json" },
      { label: "Bold", path: "/asset/font-json/NotoSansKR-Bold.json" },
    ],
  },
];

function getFontVariants(name: string) {
  return FONTS.find((f) => f.name === name)?.variants ?? [];
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-4 my-1 border-t border-white/[0.06]" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-2">
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
    <div className="px-4 pb-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-slate-400">{label}</span>
        <span className="text-[11px] text-slate-500 font-mono tabular-nums bg-white/[0.04] px-1.5 py-0.5 rounded-md">
          {value.toFixed(step < 0.1 ? 2 : 1)}
        </span>
      </div>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        className="relative flex items-center w-full h-5"
      >
        <Slider.Track className="relative grow rounded-full h-[3px] bg-white/[0.08]">
          <Slider.Range className="absolute rounded-full h-full bg-blue-500" />
        </Slider.Track>
        <Slider.Thumb className="block w-3.5 h-3.5 bg-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-grab active:cursor-grabbing" />
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
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex-1 text-[12px] text-slate-300">{label}</span>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-9 h-5 rounded-full bg-white/10 data-[state=checked]:bg-blue-600 transition-colors relative flex-shrink-0"
      >
        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
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
      <div className="px-4 pb-3">
        <label className="flex flex-col items-center justify-center gap-2.5 w-full h-28 border border-dashed border-white/[0.1] rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-950/10 transition-all group">
          <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          <Upload
            size={18}
            className="text-slate-500 group-hover:text-blue-400 transition-colors"
          />
          <div className="text-center">
            <p className="text-[11px] text-blue-400 font-medium">SVG 파일 업로드</p>
            <p className="text-[10px] text-slate-600 mt-0.5">클릭하여 선택</p>
          </div>
        </label>
      </div>

      {svg.name && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
            <FileText size={13} className="text-blue-400 flex-shrink-0" />
            <span className="text-[11px] text-blue-300 truncate flex-1">{svg.name}</span>
            <button
              onClick={() =>
                setSvg({ url: "/globe.svg", name: "globe.svg" })
              }
              className="text-slate-600 hover:text-red-400 transition-colors p-0.5"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      <Divider />
      <SectionLabel label="Material" />
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <input
            type="color"
            value={svg.color}
            onChange={(e) => setSvg({ color: e.target.value })}
            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
            style={{ padding: "2px" }}
          />
          <div>
            <p className="text-[11px] text-slate-400">Color</p>
            <p className="text-[11px] text-slate-300 font-mono">{svg.color.toUpperCase()}</p>
          </div>
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

function TextPanel() {
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  return (
    <>
      <SectionLabel label="3D Text" />
      <div className="px-4 pb-3">
        <textarea
          value={text.content}
          onChange={(e) => setText({ content: e.target.value })}
          placeholder="텍스트 입력…"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[13px] rounded-xl px-3.5 py-3 outline-none focus:border-blue-500/60 resize-none placeholder:text-slate-600 transition-colors leading-relaxed"
        />
      </div>

      <Divider />
      <SectionLabel label="Font Family" />
      <div className="px-4 pb-3">
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
          className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[12px] rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500/60 transition-colors appearance-none"
        >
          {FONTS.map((f) => (
            <option key={f.name} value={f.name} className="bg-[#0e1117]">
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <SectionLabel label="Weight / Style" />
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {getFontVariants(text.fontFamily).map((v) => (
            <button
              key={v.path}
              onClick={() => setText({ fontVariant: v.path })}
              className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold truncate transition-all ${
                text.fontVariant === v.path
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
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
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {(["solid", "gradient", "image"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBg({ type: t })}
              className={`py-2 px-2 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                bg.type === t
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {bg.type === "solid" && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.solidColor}
              onChange={(e) => setBg({ solidColor: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
              style={{ padding: "2px" }}
            />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500">Solid</p>
              <p className="text-[11px] text-slate-300 font-mono">{bg.solidColor.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {bg.type === "gradient" && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.gradientFrom}
              onChange={(e) => setBg({ gradientFrom: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/[0.1]"
              style={{ padding: "2px" }}
            />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500">From (top)</p>
              <p className="text-[11px] text-slate-300 font-mono">{bg.gradientFrom.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <input
              type="color"
              value={bg.gradientTo}
              onChange={(e) => setBg({ gradientTo: e.target.value })}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/[0.1]"
              style={{ padding: "2px" }}
            />
            <div className="flex-1">
              <p className="text-[10px] text-slate-500">To (bottom)</p>
              <p className="text-[11px] text-slate-300 font-mono">{bg.gradientTo.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {bg.type === "image" && (
        <div className="px-4 pb-4">
          <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border border-dashed border-white/[0.08] rounded-xl cursor-pointer hover:border-blue-500/40 transition-all">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <Upload size={16} className="text-slate-600" />
            <span className="text-[10px] text-slate-600">이미지 업로드</span>
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
    <div className="pointer-events-auto flex flex-col h-full w-[240px] rounded-2xl overflow-hidden bg-[#0e1117]/92 backdrop-blur-xl border border-white/[0.07] shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Layers size={14} className="text-white" />
        </div>
        <span className="text-[14px] font-bold text-slate-100 tracking-tight">
          ZES <span className="text-blue-400">Editor</span>
        </span>
        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-md bg-blue-900/40 text-blue-400 border border-blue-800/30 font-semibold tracking-wide">
          3D
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] flex-shrink-0">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActivePanel(key)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 text-[10px] font-semibold transition-colors ${
              activePanel === key
                ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
                : "text-slate-600 hover:text-slate-400"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-2">
        {activePanel === "assets" && <AssetsPanel />}
        {activePanel === "text" && <TextPanel />}
        <BackgroundPanel />
        <div className="h-4" />
      </div>
    </div>
  );
}
