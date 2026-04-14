"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { useEditorStore } from "@/store";

export interface ExportRef {
  exportImage: (format: "png" | "jpg", resolution: number) => void;
}

interface TopBarProps {
  exportRef: React.RefObject<ExportRef | null>;
}

export default function TopBar({ exportRef }: TopBarProps) {
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#12151e]/92 backdrop-blur-md border border-white/[0.07] shadow-xl shadow-black/40">
        {/* Format */}
        <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-xl p-1">
          {(["png", "jpg"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1.5 text-[11px] font-semibold uppercase rounded-lg transition-all ${
                format === f
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/[0.08]" />

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-xl transition-all"
        >
          <Download size={13} />
          {isExporting ? "Rendering…" : "Export"}
        </button>
      </div>
    </div>
  );
}
