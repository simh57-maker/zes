"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import TopBar from "@/components/TopBar";
import { useEditorStore } from "@/store";
import type { ExportRef } from "@/components/TopBar";

// Scene은 SSR 불가 (WebGL)
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

function Background() {
  const bg = useEditorStore((s) => s.background);
  let style: React.CSSProperties = {};
  if (bg.type === "solid") {
    style = { backgroundColor: bg.solidColor };
  } else if (bg.type === "gradient") {
    style = {
      background: `linear-gradient(180deg, ${bg.gradientFrom} 0%, ${bg.gradientTo} 100%)`,
    };
  } else if (bg.type === "image" && bg.imageUrl) {
    style = {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else {
    style = { backgroundColor: "#0f1117" };
  }

  return (
    <div className="absolute inset-0 z-0 transition-all duration-300" style={style} />
  );
}

export default function EditorPage() {
  const exportRef = useRef<ExportRef>(null);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 */}
      <Background />

      {/* Three.js Canvas */}
      <Scene exportRef={exportRef} />

      {/* 상단 Export 바 */}
      <TopBar exportRef={exportRef} />

      {/* 좌측 패널 — Assets/Text 탭 분리, 각 탭 작업 상태는 store에서 유지 */}
      <div className="absolute top-4 left-4 bottom-4 z-20 pointer-events-none">
        <LeftPanel />
      </div>

      {/* 우측 패널 — 조명/후처리 설정 */}
      <div className="absolute top-4 right-4 bottom-4 z-20 pointer-events-none">
        <RightPanel />
      </div>
    </div>
  );
}
