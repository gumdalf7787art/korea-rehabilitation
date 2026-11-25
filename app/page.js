import Link from "next/link";
import HeroCarousel from "./hero-carousel";
import { permanentRedirect, redirect } from "next/navigation";
import {
  CalendarCheck2,
  Play,
  Files,
  BadgeCheck,
  CalendarDays,
  MapPin,
  BookOpen,
  Landmark,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { articles, archiveEvents } from "../lib/content";
import { portalEnv } from "../lib/portal";
import { siteName, siteUrl, description } from "../lib/site";
export const metadata = { alternates: { canonical: "/" } };
const tasks = [
  [CalendarCheck2, "내 등록 확인", "학술대회 신청 내역", "/member"],
  [Play, "강의 다시보기", "영상과 강의자료", "/education/library"],
  [Files, "보험·청구 찾기", "고시와 심사 기준", "/insurance/notices"],
  [BadgeCheck, "연회비 확인", "회원 자격과 납부 내역", "/member"],
];
async function readHome() {
  const { DB } = await portalEnv();
  const now = new Date().toISOString();
  const [event, posts] = await Promise.all([
    DB.prepare(
      "SELECT * FROM events WHERE published=1 AND ends_at>=? ORDER BY starts_at LIMIT 1",
    )
      .bind(now)
      .first(),
    DB.prepare(
      "SELECT id,section,title,updated_at FROM articles WHERE published=1 ORDER BY updated_at DESC LIMIT 12",
    ).all(),
  ]);
  return { event, posts: posts.results };
}
const previousMenus = {
  "1/5": "/about/greeting",
  "1/6": "/about/history",
  "1/7": "/about/organization",
  "1/8": "/about/organization",
  "1/9": "/about/contact",
  "3/10": "/news/notices",
  "3/11": "/education/library",
  "3/12": "/support",
  "3/14": "/member/documents",
  "3/22": "/insurance/notices",
  "3/23": "/news/gallery",
  "3/25": "/support/consultation",
  "4/18": "/education/calendar",
  "4/19": "/member",
  "4/20": "/education/archive",
};
export default async function Home({ searchParams }) {
  const query = await searchParams;
  if (typeof query.c === "string" && Object.hasOwn(previousMenus, query.c)) {
    if (query.uid) {
      const migrated = [...archiveEvents, ...articles].find(
        (p) =>
          p.source && new URL(p.source).searchParams.get("uid") === query.uid,
      );
      if (migrated) permanentRedirect(migrated.path);
      if (
        process.env.NEXT_PUBLIC_LEGACY_URL &&
        process.env.NEXT_PUBLIC_LEGACY_URL.replace(/\/$/, "") !== siteUrl
      ) {
        redirect(
          process.env.NEXT_PUBLIC_LEGACY_URL.replace(/\/$/, "") +
            "/?" +
            new URLSearchParams({ c: query.c, uid: String(query.uid) }),
        );
      }
    } else {
      permanentRedirect(previousMenus[query.c]);
    }
  }
  const { event, posts } = await readHome();
  const isOpen =
    event &&
    event.opens_at <= new Date().toISOString() &&
    event.closes_at >= new Date().toISOString();
  const original = articles
    .filter(
      (a) => a.path.startsWith("/news/") || a.path.startsWith("/insurance/"),
    )
    .map((a) => ({
      href: a.path,
      title: a.title,
      section: a.path.split("/")[1],
      date: a.date || "",
    }));
  const news = [
    ...posts.map((p) => ({
      href: "/" + p.section + "/post/" + p.id,
      title: p.title,
      section: p.section,
      date: p.updated_at.slice(0, 10),
    })),
    ...original,
  ].sort((a, b) => b.date.localeCompare(a.date));
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description,
    inLanguage: "ko",
    publisher: { "@id": siteUrl + "/#organization" },
  };
  return (
    <main className="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section className="hero">
        <img
          className="heroPhoto"
          fetchPriority="high"
          alt="대한재활의학과의사회 2025년 추계학술대회 강연 현장"
          src="/media/hero.webp"
          width="1920"
          height="1080"
        />
        <div className="heroShade" />
        <div className="heroInner">
          <HeroCarousel eventId={event?.id} />
          <div className="heroText">
            <div className="heroLabel">
              <span />
              {event ? "학술대회·워크숍" : "학술 · 교육"}
            </div>
            <h1>
              {event ? (
                event.title
              ) : (
                <>
                  재활의학의 경험을
                  <br />
                  함께 나눕니다.
                </>
              )}
            </h1>
            {event ? (
              <p className="eventFacts">
                <CalendarDays size={18} />
                {new Date(event.starts_at).toLocaleDateString("ko-KR", {
                  timeZone: "Asia/Seoul",
                })}
                <MapPin size={18} />
                {event.location}
              </p>
            ) : (
              <p>
                학술대회와 실습 워크숍에서 만나는
                <br className="mobileBreak" /> 재활의학과 전문의들의 진료 경험.
              </p>
            )}
            <div className="heroActions">
              <Link
                className="buttonLight"
                href={
                  event
                    ? (isOpen ? "/member/events/" : "/education/event/") +
                      event.id
                    : "/education"
                }
              >
                {event
                  ? isOpen
                    ? "사전등록"
                    : "행사 안내"
                  : "학술·교육 둘러보기"}
              </Link>
              <Link
                className="buttonGlass"
                href={
                  event ? "/education/event/" + event.id : "/education/archive"
                }
              >
                {event ? "프로그램 보기" : "역대 학술대회"}
              </Link>
            </div>
          </div>
        </div>
        <small className="photoCaption">2025 추계학술대회 현장</small>
      </section>
      <div className="homeBody">
        <nav className="quickGrid" aria-label="회원 업무 바로가기">
          {tasks.map(([Icon, title, sub, href]) => (
            <Link key={title} href={href}>
              <span className="taskIcon">
                <Icon aria-hidden="true" size={24} strokeWidth={1.7} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
            </Link>
          ))}
        </nav>
        <section className="homeSection">
          <div className="sectionTitle">
            <h2>의사회 소식</h2>
            <Link href="/news">
              전체 소식 <ChevronRight size={15} />
            </Link>
          </div>
          <div className="newsGrid">
            {news.slice(0, 3).map((a) => (
              <Link href={a.href} key={a.href}>
                <span className="newsCategory">
                  {a.section === "insurance"
                    ? "보험·청구"
                    : a.href.includes("/policy/")
                      ? "정책 활동"
                      : "의사회 소식"}
                </span>
                <h3>{a.title}</h3>
                <time>{a.date.replaceAll("-", ".")}</time>
              </Link>
            ))}
          </div>
        </section>
        <section className="homeSection">
          <div className="sectionTitle">
            <h2>보험·청구 안내</h2>
            <Link href="/insurance/notices">
              고시·심사 기준 <ChevronRight size={15} />
            </Link>
          </div>
          <div className="insuranceList">
            {news
              .filter((n) => n.section === "insurance")
              .slice(0, 3)
              .map((n) => (
                <Link href={n.href} key={n.href}>
                  <Files size={20} />
                  <strong>{n.title}</strong>
                  <time>{n.date.replaceAll("-", ".")}</time>
                  <ChevronRight size={17} />
                </Link>
              ))}
          </div>
        </section>
        <section className="homeSection">
          <div className="sectionTitle">
            <h2>학술대회 기록</h2>
            <Link href="/education/archive">
              전체 기록 <ChevronRight size={15} />
            </Link>
          </div>
          <div className="photoFeature">
            <Link href="/education/archive">
              <img
                loading="lazy"
                src="/media/conference-2024.webp"
                alt="2024년 추계학술대회 강의실"
              />
              <div>
                <BookOpen />
                <h3>역대 학술대회</h3>
                <p>춘·추계 학술대회와 워크숍 기록</p>
              </div>
            </Link>
            <div className="services">
              <Link href="/support/consultation">
                <Landmark />
                <span>
                  <b>법률상담·회원 고충</b>
                  <small>비공개 접수와 답변 확인</small>
                </span>
                <ChevronRight />
              </Link>
              <Link href="/public/hospitals">
                <Stethoscope />
                <span>
                  <b>재활의학과 병의원 찾기</b>
                  <small>지역별 회원 의료기관 안내</small>
                </span>
                <ChevronRight />
              </Link>
              <Link href="/support/purchase">
                <BadgeCheck />
                <span>
                  <b>공동구매·제휴</b>
                  <small>정회원 구매 혜택 확인</small>
                </span>
                <ChevronRight />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
