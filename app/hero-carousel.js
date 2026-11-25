"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

function useRotation(length, interval) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [paused, length, interval]);

  return {
    index,
    paused,
    setPaused,
    select(next) {
      setIndex(next);
    },

  };
}
function Controls({ rotation, count, label }) {
  const { index, paused, setPaused, select } = rotation;
  return (
    <div className="slideControls" role="group" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} className="slideDot" aria-current={index === i ? "true" : undefined}
          aria-label={label + " " + (i + 1) + "번 보기"} onClick={() => select(i)} />
      ))}
      <button aria-label={label + (paused ? " 자동 전환 시작" : " 일시정지")}
        onClick={() => setPaused(!paused)}>
        {paused ? <Play /> : <Pause />}
      </button>
    </div>
  );
}
export default function HomeHero({ event, isOpen }) {
  const features = [
    {
      image: "/media/association-group.webp",
      label: "대한재활의학과의사회 30주년",
      lines: ["함께 걸어온", "재활의학의 30년"],
      copy: "춘계 학술대회에서 회원들이 한자리에 모였습니다.",
      href: "/about",
      button: "의사회 소개",
    },
    {
      image: "/media/clinical-workshop.webp",
      label: "학술 · 교육",
      lines: ["초음파로 살펴보는", "어깨와 팔의 움직임"],
      copy: "춘계 학술대회 현장에서 상지·견관절 진료 경험을 나눴습니다.",
      href: event
        ? (isOpen ? "/member/events/" : "/education/event/") + event.id
        : "/education",
      button: event ? (isOpen ? "다가오는 행사 등록" : "행사 안내") : "학술·교육 둘러보기",
    },
    {
      image: "/media/anniversary-address.webp",
      label: "30주년 기념행사",
      lines: ["30년의 길,", "그리고 그 다음 30년"],
      copy: "재활의학과 의사들이 함께한 발자취를 돌아봅니다.",
      href: "/about",
      button: "의사회 소개",
    },
    {
      image: "/media/clinic-consultation.webp",
      label: "대한재활의학과의사회",
      lines: ["다시 움직이는 기쁨,", "일상으로 이어지도록."],
      copy: "환자의 움직임과 삶을 함께 살피는 재활의학과 의사들입니다.",
      href: "/about",
      button: "의사회 소개",
    },
  ];
  const rotation = useRotation(features.length, 4000),
    feature = features[rotation.index];
  return (
    <section className="hero" aria-label="의사회 주요 안내">
      <div className="heroPictures" data-paused={rotation.paused} aria-hidden="true">
        {features.map((f, i) => (
          <img
            key={f.image}
            alt=""
            src={f.image}
            fetchPriority={i === 0 ? "high" : "auto"}
            className={i === rotation.index ? "current" : ""}
          />
        ))}
      </div>
      <div className="heroShade" />
      <div className="heroInner">
        <div className="heroStory">
          <div className="heroText" key={rotation.index}>
            <div className="heroLabel">
              <span />
              {feature.label}
            </div>
            <h1>
              {feature.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p>{feature.copy}</p>
            <Link href={feature.href} className="buttonLight">
              {feature.button}
            </Link>
          </div>
          <Controls
            rotation={rotation}
            count={features.length}
            label="대표 슬라이드"
          />
        </div>

      </div>
    </section>
  );
}
