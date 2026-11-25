"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, UserRound, Menu, X, House } from "lucide-react";
import { menus, siteName } from "../lib/site";

function sectionFor(path) {
  const matched = menus.find(([, links]) => links.some(([url]) => path === url || path.startsWith(url + "/")));
  if (matched) return matched[0];
  return ({
    about: siteName, education: "학술대회", insurance: "공지 및 게시판", news: "공지 및 게시판",
    member: "회원 서비스", support: "회원지원", public: "국민 안내", privacy: "개인정보 처리 안내",
    admin: "관리자", search: "통합검색",
  })[path.split("/")[1]] || siteName;
}

export default function Header({ signedIn, sectionLinks }) {
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const opener = useRef(null);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    function outside(e) {
      if (!header.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function reveal(e) {
    opener.current = e.currentTarget;
    setOpen(true);
  }
  function escape(e) {
    if (open && e.key === "Escape") {
      setOpen(false);
      opener.current?.focus();
    }
  }
  const section = sectionFor(path);
  const area = path.split("/")[1];
  const parentPath = path.startsWith("/news/post/") ? "/news/notices" :
    path.startsWith("/insurance/post/") ? "/insurance/notices" :
    path.startsWith("/education/event/") ? "/education/calendar" : path;
  const activeGroup = menus.find(([, links]) => links.some(([url]) => parentPath === url || parentPath.startsWith(url + "/")));
  const siblings = activeGroup?.[1] || sectionLinks[area] ||
    (area === "member" ? [["/member","마이페이지"],["/member/documents","자료실"],["/member/consult","상담·문의"]] : []);
  return <>
    <header className={"siteHeader homeHeader" + (open ? " menuOpen" : "")} ref={header}
      onKeyDown={escape} onMouseLeave={() => { if (window.matchMedia("(hover: hover)").matches) setOpen(false); }}
      onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <div className="headInside">
        <Link href="/" className="brand" aria-label={siteName + " 홈"}><img src="/brand/logo.svg" alt={siteName} /></Link>
        <nav className="desktopNav" aria-label="주 메뉴">
          {menus.map(([title], i) => <button key={title} aria-expanded={open} aria-controls="allMenus"
            onMouseEnter={reveal} onClick={e => { reveal(e); requestAnimationFrame(() => header.current?.querySelectorAll(".megaColumn")[i]?.querySelector("a")?.focus()); }}>{title}</button>)}
        </nav>
        <div className="headTools">
          <Link aria-label="통합검색" href="/search" className="iconButton"><Search /></Link>
          <Link href="/member" className="memberButton" aria-label={signedIn ? "내 정보" : "회원 로그인"}>
            <UserRound size={17} /><span>{signedIn ? "내 정보" : "회원 로그인"}</span>
          </Link>
          <button
            className="mobileSwitch iconButton" aria-label={open ? "메뉴 닫기" : "전체 메뉴"}
            aria-expanded={open} aria-controls="allMenus" onClick={e => { opener.current=e.currentTarget; setOpen(!open); }}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      <div className="megaPanel" id="allMenus" inert={!open} aria-hidden={!open}>
        <div className="megaClip"><div className="megaInside">
          <p className="megaMotto">지금까지 30년<br/>앞으로 30년</p>
          <nav className="megaColumns" aria-label="전체 메뉴">
            {menus.map(([title, links]) => <div className="megaColumn" key={title}>
              <strong>{title}</strong>
              {links.map(([href,label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
            </div>)}
          </nav>
        </div></div>
      </div>
    </header>
    {path !== "/" && <>
      <div className="subHero"><span>{section}</span></div>
      <nav className="subNav" aria-label="카테고리 내비게이션">
        <div className="subNavInner">
          <Link href="/" aria-label="홈"><House size={20} aria-hidden="true" /></Link>
          {siblings.map(([href, label]) => <Link key={href} href={href}
            aria-current={parentPath === href ? "page" : parentPath.startsWith(href + "/") && activeGroup ? "location" : undefined}>{label}</Link>)}
          {!siblings.length && <span aria-current="page">{section}</span>}
        </div>
      </nav>
    </>}
  </>;
}