"use client";

import { useEffect, useRef } from "react";

export default function SectionWaves() {
  const canvas = useRef(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element.getContext("2d");
    if (!context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;

    function draw(time) {
      const { width, height } = element;
      context.clearRect(0, 0, width, height);
      const light = context.createLinearGradient(0, 0, width, 0);
      light.addColorStop(0, "#139db960");
      light.addColorStop(.48, "#139db91f");
      light.addColorStop(1, "#86faffb0");
      context.strokeStyle = light;
      context.lineWidth = Math.max(1, width / 1500);

      for (let line = 0; line < 24; line++) {
        context.beginPath();
        for (let point = 0; point <= 96; point++) {
          const x = point / 96;
          const spread = .006 + .004 * Math.cos(x * 7 - time);
          const wave = .59 + .14 * Math.sin(x * 7 + time) +
            .055 * Math.sin(x * 16 - time * 1.25 + line * .035);
          const y = (wave + (line - 12) * spread) * height;
          if (point === 0) context.moveTo(0, y);
          else context.lineTo(x * width, y);
        }
        context.stroke();
      }
    }

    function animate(now) {
      draw(now / 2600);
      frame = window.requestAnimationFrame(animate);
    }

    function update() {
      window.cancelAnimationFrame(frame);
      draw(0);
      if (visible && !motion.matches) frame = window.requestAnimationFrame(animate);
    }

    const resize = new ResizeObserver(() => {
      const scale = Math.min(window.devicePixelRatio, 2);
      element.width = Math.max(1, Math.round(element.clientWidth * scale));
      element.height = Math.max(1, Math.round(element.clientHeight * scale));
      update();
    });
    resize.observe(element);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    intersection.observe(element);
    motion.addEventListener("change", update);

    return () => {
      resize.disconnect();
      intersection.disconnect();
      motion.removeEventListener("change", update);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvas} className="sectionWaves" aria-hidden="true" />;
}
