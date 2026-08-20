import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { X } from "lucide-react";
import "@/styles/styles.css";
import "@senler/ui/styles.css";

export function PreviewHost() {
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = Math.min(viewport.width / 1200, 1);
  const height = Math.max(viewport.height / scale, 756);

  return (
    <div
      className="overflow-hidden bg-white"
      style={{ width: 1200 * scale, height: height * scale }}
    >
      <main
        className="w-[1200px] bg-white text-black"
        style={{
          height,
          transform: `scale(${scale})`,
          transformOrigin: "left top",
        }}
      >
        <header className="flex h-11 items-center justify-between border-b border-[#e4e4e4] px-4">
          <p className="text-[15px] font-medium leading-5">Амбассадор</p>
          <X className="size-5 text-[#797979]" strokeWidth={1.5} aria-hidden />
        </header>
        <iframe
          src="/sprint-flow-preview.html"
          title="Production-приложение с мок-данными"
          className="block w-[1200px] border-0 bg-white"
          style={{ height: height - 44 }}
        />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <PreviewHost />,
);
