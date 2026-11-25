"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const cards = [
  { title: "의사회 소개", href: "/about", image: "/media/association-group.webp" },
  { title: "공지사항", href: "/news/notices", scene: "notices" },
  { title: "학술대회", href: "/education/calendar", image: "/media/conference-2024.webp" },
  { title: "보험이슈", href: "/insurance/notices", scene: "insurance" },
  { title: "포토 갤러리", href: "/news/gallery", image: "/media/legacy-content/c9bec870c07fb067fb.webp" },
  { title: "강의 다시보기", href: "/education/library", image: "/media/clinical-workshop.webp" },
  { title: "법률상담", href: "/support/consultation", scene: "legal" },
  { title: "정회원 혜택", href: "/support/membership", scene: "membership" },
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
    <section className="homeMenuSection" aria-labelledby="homeMenuTitle">
      <h2 id="homeMenuTitle">
        <span>주요메뉴</span>
        바로가기
      </h2>
      <nav ref={menu} className="homeMenu" aria-labelledby="homeMenuTitle">
        {cards.map(({ title, href, image, scene }) => (
          <Link key={href} href={href} className="menuCard">
            <span className="menuCardPhoto" data-scene={scene} aria-hidden="true">
              {image && <img src={image} alt="" loading="lazy" />}
            </span>
            <span className="menuCardLabel">
              <strong>{title}</strong>
              <ArrowRight className="cardArrow" size={17} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
