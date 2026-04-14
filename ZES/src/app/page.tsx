"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import TopBar from "@/components/TopBar";
import type { ExportRef } from "@/components/TopBar";

// Scene은 SSR 불가 (WebGL)
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function EditorPage() {
  const exportRef = useRef<ExportRef>(null);

  return (
    // 배경은 각 탭 Canvas 내부에서 독립 관리
    <div className="relative w-full h-screen overflow-hidden bg-[#020818]">
      {/* 탭별 독립 Canvas (배경 포함) */}
      <Scene exportRef={exportRef} />

      {/* 상단 Export 바 */}
      <TopBar exportRef={exportRef} />

      {/* 좌측 패널 */}
      <div className="absolute top-4 left-4 bottom-4 z-20 pointer-events-none">
        <LeftPanel />
      </div>

      {/* 우측 패널 */}
      <div className="absolute top-4 right-4 bottom-4 z-20 pointer-events-none">
        <RightPanel />
      </div>
    </div>
  );
}
