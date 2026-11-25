"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const slides = [
  {
    title: "학술대회 안내",
    description: "학술대회 일정과 등록 정보를 확인하세요.",
    href: "/education/calendar",
    art: "/media/popup-conference.svg",
  },
  {
    title: "강의 다시보기",
    description: "주제와 연자별로 학술대회 강의를 찾아보세요.",
    href: "/education/library",
    art: "/media/popup-lecture.svg",
  },
  {
    title: "공동구매 안내",
    description: "정회원 근전도 니들 공동구매와 신청 방법을 확인하세요.",
    href: "/support/purchase",
    art: "/media/popup-purchase.svg",
  },
  {
    title: "의료공제조합",
    description: "대한의사협회 의료배상공제조합 홈페이지로 이동합니다.",
    href: "https://www.kmama.org/",
    art: "/media/popup-mutual.svg",
  },
];

function useRotation(length, interval) {
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
      if (!document.hidden) setIndex((current) => (current + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [paused, hovered, length, interval]);

  return {
    index,
    paused,
    setPaused,
    step(offset) {
      setPaused(true);
      setIndex((n) => (n + offset + length) % length);
    },
    interaction: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: (e) => {
        if (e.target.matches(":focus-visible")) setPaused(true);
      },
    },
  };
}
function Controls({ rotation, count, label }) {
  const { index, paused, setPaused, step } = rotation;
  return (
    <div className="slideControls">
      <span>
        {String(index + 1).padStart(2, "0")}{" "}
        <small>/ {String(count).padStart(2, "0")}</small>
      </span>
      <button aria-label={label + " 이전"} onClick={() => step(-1)}>
        <ChevronLeft />
      </button>
      <button
        aria-label={label + (paused ? " 자동 전환 시작" : " 일시정지")}
        onClick={() => setPaused(!paused)}
      >
        {paused ? <Play /> : <Pause />}
      </button>
      <button aria-label={label + " 다음"} onClick={() => step(1)}>
        <ChevronRight />
      </button>
    </div>
  );
}
function NoticeCard({ event }) {
  const rotation = useRotation(slides.length, 6000),
    slide = slides[rotation.index];
  return (
    <aside
      className="heroCarousel"
      aria-label="회원 안내"
      aria-roledescription="캐러셀"
      {...rotation.interaction}
    >
      <Link
        className="posterLink"
        style={{ backgroundImage: "url(" + slide.art + ")" }}
        href={
          rotation.index === 0 && event
            ? "/education/event/" + event.id
            : slide.href
        }
      >
        <div key={slide.title} className="posterCopy">
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
        </div>
      </Link>
      <Controls rotation={rotation} count={slides.length} label="회원 안내" />
    </aside>
  );
}
export default function HomeHero({ event, isOpen }) {
  const features = [
    {
      image: "/media/hero-clinic.webp",
      label: "대한재활의학과의사회",
      lines: ["다시 움직이는 기쁨,", "일상으로 이어지도록."],
      copy: "환자의 움직임과 삶을 함께 살피는 재활의학과 의사들입니다.",
      href: "/about",
      button: "의사회 소개",
    },
    {
      image: "/media/hero.webp",
      label: "학술 · 교육",
      lines: event
        ? [event.title]
        : ["진료실에서 만난 질문,", "학술대회에서 나눕니다."],
      copy: event
        ? event.date + " · " + event.location
        : "강의와 실습으로 재활의학의 경험을 나눕니다.",
      href: event
        ? (isOpen ? "/member/events/" : "/education/event/") + event.id
        : "/education",
      button: event
        ? isOpen
          ? "사전등록"
          : "행사 안내"
        : "학술·교육 둘러보기",
    },
    {
      image: "/media/conference-spring.webp",
      label: "회원지원",
      lines: ["혼자 고민하던 일도,", "동료와 함께."],
      copy: "보험·청구부터 법률상담까지, 진료 현장의 고민을 함께 풀어갑니다.",
      href: "/support",
      button: "회원지원 살펴보기",
    },
  ];
  const rotation = useRotation(features.length, 8000),
    feature = features[rotation.index];
  return (
    <section className="hero" aria-label="의사회 주요 안내">
      <div className="heroPictures" aria-hidden="true">
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
        <div className="heroStory" {...rotation.interaction}>
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
        <NoticeCard event={event} />
      </div>
    </section>
  );
}
