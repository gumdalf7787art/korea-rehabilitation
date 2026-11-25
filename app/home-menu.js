"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, UsersRound, Megaphone, CalendarDays, Files, Images, CirclePlay, Scale, BadgeCheck } from "lucide-react";

const cards = [
  ["의사회 소개", "/about", UsersRound, "association-group"],
  ["공지사항", "/news/notices", Megaphone],
  ["학술대회", "/education/calendar", CalendarDays],
  ["보험이슈", "/insurance/notices", Files],
  ["포토 갤러리", "/news/gallery", Images],
  ["강의 다시보기", "/education/library", CirclePlay, "clinical-workshop"],
  ["법률상담", "/support/consultation", Scale],
  ["정회원 혜택", "/support/membership", BadgeCheck],
];

export default function HomeMenu() {
  const menu = useRef(null);
  useEffect(() => {
    if (!window.IntersectionObserver) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("inView", entry.isIntersecting);
      }
    });
    for (const card of menu.current.children) observer.observe(card);
    return () => observer.disconnect();
  }, []);
  return (
    <nav ref={menu} className="homeMenu" aria-label="의사회 주요 메뉴">
      {cards.map(([title, href, Icon, photo]) => (
        <Link key={href} href={href} className={photo ? "menuCard photoCard" : "menuCard"}
          style={photo ? {backgroundImage: "linear-gradient(0deg, #062834ed, #06283455), url(/media/" + photo + ".webp)"} : undefined}>
          <ArrowUpRight className="cardArrow" aria-hidden="true" />
          <Icon className="cardSymbol" strokeWidth={1.4} aria-hidden="true" />
          <strong>{title}</strong>
        </Link>
      ))}
    </nav>
  );
}
