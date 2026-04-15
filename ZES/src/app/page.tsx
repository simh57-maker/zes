"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BottomBar from "@/components/BottomBar";
import type { ExportRef } from "@/components/TopBar";

// Scene은 SSR 불가 (WebGL)
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function EditorPage() {
  const exportRef = useRef<ExportRef>(null);
  const [uiVisible, setUiVisible] = useState(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
        <BottomBar exportRef={exportRef} />
      </div>
    </div>
  );
}
