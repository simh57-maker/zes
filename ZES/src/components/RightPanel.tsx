"use client";

import { Sun, Sparkles, ChevronRight } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  useEditorStore,
  useActiveLights,
  useSetActiveLights,
  useActivePostProcessing,
  useSetActivePostProcessing,
} from "@/store";

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function RowLabel({
  icon,
  label,
  right,
  onClick,
  chevron,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  chevron?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
        onClick ? "cursor-pointer hover:bg-white/[0.05]" : ""
      }`}
    >
      <span className="flex-shrink-0 text-slate-400">{icon}</span>
      <span className="flex-1 text-[12px] text-slate-300">{label}</span>
      {right && <span className="flex-shrink-0">{right}</span>}
      {chevron && <ChevronRight size={12} className="text-slate-600 flex-shrink-0" />}
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
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="px-3 pb-2 space-y-1.5">
      <div className="flex justify-between">
        <span className="text-[11px] text-slate-400">{label}</span>
        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
          {value.toFixed(step < 0.01 ? 3 : 2)}
          {unit}
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

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-2.5 p-2 bg-white/[0.03] rounded-xl border border-white/[0.06]">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-white/[0.1] flex-shrink-0"
          style={{ padding: "2px" }}
        />
        <span className="text-[10px] text-slate-500 flex-1">{label}</span>
        <span className="text-[10px] text-slate-600 font-mono">{value.toUpperCase()}</span>
      </div>
    </div>
  );
}

function ToggleSection({
  id,
  label,
  checked,
  onCheckedChange,
  children,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-3 py-2">
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
      {checked && children}
    </>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      <Collapsible.Trigger asChild>
        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest hover:text-slate-400 transition-colors">
          <ChevronRight size={10} className="transition-transform [[data-state=open]_&]:rotate-90" />
          {title}
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

// ─── Lighting section ─────────────────────────────────────────────────────────

function LightingSection() {
  const lights = useActiveLights();
  const setLights = useSetActiveLights();

  return (
    <>
      <RowLabel icon={<Sun size={13} />} label="Lighting" chevron />
      <Divider />

      <CollapsibleSection title="Ambient">
        <SliderRow
          label="Intensity"
          value={lights.ambientIntensity}
          min={0}
          max={3}
          step={0.01}
          onChange={(v) => setLights({ ambientIntensity: v })}
        />
        <ColorRow
          label="Color"
          value={lights.ambientColor}
          onChange={(v) => setLights({ ambientColor: v })}
        />
      </CollapsibleSection>

      <Divider />

      <CollapsibleSection title="Directional">
        <SliderRow
          label="Intensity"
          value={lights.directionalIntensity}
          min={0}
          max={5}
          step={0.01}
          onChange={(v) => setLights({ directionalIntensity: v })}
        />
        <ColorRow
          label="Color"
          value={lights.directionalColor}
          onChange={(v) => setLights({ directionalColor: v })}
        />
        <SliderRow
          label="X"
          value={lights.directionalX}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ directionalX: v })}
        />
        <SliderRow
          label="Y"
          value={lights.directionalY}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ directionalY: v })}
        />
        <SliderRow
          label="Z"
          value={lights.directionalZ}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ directionalZ: v })}
        />
      </CollapsibleSection>

      <Divider />

      <CollapsibleSection title="Point Light" defaultOpen={false}>
        <SliderRow
          label="Intensity"
          value={lights.pointIntensity}
          min={0}
          max={5}
          step={0.01}
          onChange={(v) => setLights({ pointIntensity: v })}
        />
        <ColorRow
          label="Color"
          value={lights.pointColor}
          onChange={(v) => setLights({ pointColor: v })}
        />
        <SliderRow
          label="X"
          value={lights.pointX}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ pointX: v })}
        />
        <SliderRow
          label="Y"
          value={lights.pointY}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ pointY: v })}
        />
        <SliderRow
          label="Z"
          value={lights.pointZ}
          min={-20}
          max={20}
          step={0.1}
          onChange={(v) => setLights({ pointZ: v })}
        />
      </CollapsibleSection>
    </>
  );
}

// ─── Post Processing section ──────────────────────────────────────────────────

function PostProcessingSection() {
  const pp = useActivePostProcessing();
  const setPP = useSetActivePostProcessing();

  return (
    <>
      <RowLabel icon={<Sparkles size={13} />} label="Post Processing" chevron />
      <Divider />

      <ToggleSection
        id="bloom"
        label="Bloom"
        checked={pp.bloomEnabled}
        onCheckedChange={(v) => setPP({ bloomEnabled: v })}
      >
        <SliderRow
          label="Intensity"
          value={pp.bloomIntensity}
          min={0}
          max={3}
          step={0.01}
          onChange={(v) => setPP({ bloomIntensity: v })}
        />
        <SliderRow
          label="Threshold"
          value={pp.bloomThreshold}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setPP({ bloomThreshold: v })}
        />
        <SliderRow
          label="Smoothing"
          value={pp.bloomSmoothing}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setPP({ bloomSmoothing: v })}
        />
      </ToggleSection>

      <Divider />

      <ToggleSection
        id="ssao"
        label="SSAO"
        checked={pp.ssaoEnabled}
        onCheckedChange={(v) => setPP({ ssaoEnabled: v })}
      >
        <SliderRow
          label="Intensity"
          value={pp.ssaoIntensity}
          min={0}
          max={100}
          step={1}
          onChange={(v) => setPP({ ssaoIntensity: v })}
        />
        <SliderRow
          label="Radius"
          value={pp.ssaoRadius}
          min={0.1}
          max={20}
          step={0.1}
          onChange={(v) => setPP({ ssaoRadius: v })}
        />
      </ToggleSection>

      <Divider />

      <ToggleSection
        id="vignette"
        label="Vignette"
        checked={pp.vignetteEnabled}
        onCheckedChange={(v) => setPP({ vignetteEnabled: v })}
      >
        <SliderRow
          label="Offset"
          value={pp.vignetteOffset}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setPP({ vignetteOffset: v })}
        />
        <SliderRow
          label="Darkness"
          value={pp.vignetteDarkness}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setPP({ vignetteDarkness: v })}
        />
      </ToggleSection>

      <Divider />

      <ToggleSection
        id="noise"
        label="Film Noise"
        checked={pp.noiseEnabled}
        onCheckedChange={(v) => setPP({ noiseEnabled: v })}
      >
        <SliderRow
          label="Opacity"
          value={pp.noiseOpacity}
          min={0}
          max={0.5}
          step={0.005}
          onChange={(v) => setPP({ noiseOpacity: v })}
        />
      </ToggleSection>

      <Divider />

      <ToggleSection
        id="toneMapping"
        label="Tone Mapping (ACES)"
        checked={pp.toneMappingEnabled}
        onCheckedChange={(v) => setPP({ toneMappingEnabled: v })}
      >
        <SliderRow
          label="Exposure"
          value={pp.toneMappingExposure}
          min={0}
          max={4}
          step={0.01}
          onChange={(v) => setPP({ toneMappingExposure: v })}
        />
      </ToggleSection>
    </>
  );
}

// ─── RightPanel ───────────────────────────────────────────────────────────────

export default function RightPanel() {
  const activePanel = useEditorStore((s) => s.activePanel);

  return (
    <div className="pointer-events-auto flex flex-col h-full w-[220px] rounded-2xl overflow-hidden bg-[#0e1117]/90 backdrop-blur-xl border border-white/[0.06] shadow-2xl shadow-black/50">
      <div className="flex-1 overflow-y-auto scrollbar-hide py-1">
        {/* Text 탭일 때만 3D Text 추가 설정 표시 */}
        {activePanel === "text" && <TextMaterialSection />}

        <LightingSection />
        <Divider />
        <PostProcessingSection />
        <div className="h-3" />
      </div>
    </div>
  );
}

// ─── Text material section (우측 패널, text 탭 한정) ────────────────────────

const TEXT_MATERIAL_TYPES = [
  { key: "standard", label: "Standard", desc: "PBR" },
  { key: "metallic", label: "Metallic", desc: "Mirror" },
  { key: "glass", label: "Glass", desc: "Refractive" },
  { key: "neon", label: "Neon", desc: "Emissive" },
  { key: "matte", label: "Matte", desc: "Lambert" },
  { key: "holographic", label: "Holographic", desc: "Shimmer" },
];

function TextMaterialSection() {
  const text = useEditorStore((s) => s.text);
  const setText = useEditorStore((s) => s.setText);

  return (
    <>
      <RowLabel icon={<Sun size={13} />} label="3D Text" chevron />
      <Divider />

      <SectionLabel label="Material" />
      <div className="px-3 pb-2">
        <div className="grid grid-cols-2 gap-1">
          {TEXT_MATERIAL_TYPES.map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => setText({ materialType: key })}
              className={`flex flex-col items-start px-2.5 py-2 rounded-xl text-left transition-all ${
                text.materialType === key
                  ? "bg-blue-600/30 border border-blue-500/50"
                  : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]"
              }`}
            >
              <span
                className={`text-[11px] font-semibold ${
                  text.materialType === key ? "text-blue-300" : "text-slate-300"
                }`}
              >
                {label}
              </span>
              <span className="text-[9px] text-slate-600">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <Divider />
      <SectionLabel label="Color" />
      <ColorRow
        label="Base Color"
        value={text.color}
        onChange={(v) => setText({ color: v })}
      />
      {(text.materialType === "neon" ||
        text.materialType === "holographic" ||
        text.materialType === "standard") && (
        <ColorRow
          label="Emissive"
          value={text.emissiveColor}
          onChange={(v) => setText({ emissiveColor: v })}
        />
      )}
      {(text.materialType === "neon" || text.materialType === "standard") && (
        <SliderRow
          label="Emissive Intensity"
          value={text.emissiveIntensity}
          min={0}
          max={5}
          step={0.05}
          onChange={(v) => setText({ emissiveIntensity: v })}
        />
      )}

      {(text.materialType === "standard" || text.materialType === "metallic") && (
        <>
          <Divider />
          <SectionLabel label="PBR" />
          <SliderRow
            label="Metalness"
            value={text.metalness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setText({ metalness: v })}
          />
          <SliderRow
            label="Roughness"
            value={text.roughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setText({ roughness: v })}
          />
        </>
      )}

      {text.materialType !== "glass" && (
        <>
          <Divider />
          <SliderRow
            label="Opacity"
            value={text.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => setText({ opacity: v })}
          />
        </>
      )}

      <Divider />
      <SectionLabel label="Geometry" />
      <SliderRow
        label="Size"
        value={text.size}
        min={0.1}
        max={5}
        step={0.05}
        onChange={(v) => setText({ size: v })}
      />
      <SliderRow
        label="Depth"
        value={text.depth}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => setText({ depth: v })}
      />
      <SliderRow
        label="Letter Spacing"
        value={text.letterSpacing}
        min={-0.5}
        max={1}
        step={0.01}
        onChange={(v) => setText({ letterSpacing: v })}
      />
      <SliderRow
        label="Position Y"
        value={text.positionY}
        min={-5}
        max={5}
        step={0.05}
        onChange={(v) => setText({ positionY: v })}
      />

      <Divider />
      <ToggleSection
        id="bevel"
        label="Bevel"
        checked={text.bevelEnabled}
        onCheckedChange={(v) => setText({ bevelEnabled: v })}
      >
        <SliderRow
          label="Thickness"
          value={text.bevelThickness}
          min={0}
          max={0.2}
          step={0.002}
          onChange={(v) => setText({ bevelThickness: v })}
        />
        <SliderRow
          label="Size"
          value={text.bevelSize}
          min={0}
          max={0.1}
          step={0.001}
          onChange={(v) => setText({ bevelSize: v })}
        />
      </ToggleSection>

      <Divider />
    </>
  );
}
