"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import TopBar from "@/components/TopBar";
import type { ExportRef } from "@/components/TopBar";

// Scene은 SSR 불가 (WebGL)
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function EditorPage() {
  const exportRef = useRef<ExportRef>(null);
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 텍스트 입력 중에는 무시
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/") {
        e.preventDefault();
        setUiVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020818]">
      <Scene exportRef={exportRef} />

      <div
        className="transition-opacity duration-200"
        style={{ opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? "auto" : "none" }}
      >
        <TopBar exportRef={exportRef} />

        <div className="absolute top-4 left-4 bottom-4 z-20 pointer-events-none">
          <LeftPanel />
        </div>

        <div className="absolute top-4 right-4 bottom-4 z-20 pointer-events-none">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
