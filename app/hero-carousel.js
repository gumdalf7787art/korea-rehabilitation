"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MonitorPlay,
  PackageOpen,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

const slides = [
  {
    title: "학술대회 안내",
    description: "학술대회 일정과 등록 정보를 확인하세요.",
    href: "/education/calendar",
    icon: CalendarDays,
  },
  {
    title: "강의 다시보기",
    description: "주제와 연자별로 학술대회 강의를 찾아보세요.",
    href: "/education/library",
    icon: MonitorPlay,
  },
  {
    title: "공동구매 안내",
    description: "정회원 근전도 니들 공동구매와 신청 방법을 확인하세요.",
    href: "/support/purchase",
    icon: PackageOpen,
  },
  {
    title: "의료공제조합",
    description: "대한의사협회 의료배상공제조합 홈페이지로 이동합니다.",
    href: "https://www.kmama.org/",
    icon: ShieldCheck,
  },
];

export default function HeroCarousel({ eventId }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (paused || hovered) return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, hovered]);
  const slide = slides[index];
  const Icon = slide.icon;
  function step(offset) {
    setPaused(true);
    setIndex((current) => (current + offset + slides.length) % slides.length);
  }
  return (
    <section
      className="heroCarousel"
      aria-label="회원 안내"
      aria-roledescription="캐러셀"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={(e) => {
        if (e.target.matches(":focus-visible")) setPaused(true);
      }}
    >
      <Link
        className="slideLink"
        href={
          index === 0 && eventId ? "/education/event/" + eventId : slide.href
        }
      >
        <div
          key={index}
          className="slideContent"
          aria-live={paused ? "polite" : "off"}
        >
          <Icon size={34} strokeWidth={1.5} aria-hidden="true" />
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
        </div>
      </Link>
      <div className="slideControls">
        <span aria-label={slides.length + "개 중 " + (index + 1) + "번째"}>
          {String(index + 1).padStart(2, "0")}{" "}
          <span>/ {String(slides.length).padStart(2, "0")}</span>
        </span>
        <button type="button" aria-label="이전 안내" onClick={() => step(-1)}>
          <ChevronLeft />
        </button>
        <button
          type="button"
          aria-label={paused ? "자동 전환 시작" : "자동 전환 일시정지"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play /> : <Pause />}
        </button>
        <button type="button" aria-label="다음 안내" onClick={() => step(1)}>
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
