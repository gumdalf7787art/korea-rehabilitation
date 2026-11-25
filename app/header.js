"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, UserRound, Menu, X } from "lucide-react";
import { menus, siteName } from "../lib/site";
export default function Header({ signedIn }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const path = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (!open) return;
    function escape(e) {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className={path === "/" ? "siteHeader homeHeader" : "siteHeader"}>
      <div className="headInside">
        <Link href="/" className="brand" aria-label={siteName + " 홈"}>
          <img src="/brand/logo.svg" alt={siteName} />
        </Link>
        <nav className="desktopNav" aria-label="주 메뉴">
          {menus.map(([title, links]) => (
            <details className="navGroup" name="header-group" key={title}
              onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.open = false; }}
              onKeyDown={e => { if (e.key === "Escape") { e.currentTarget.open = false; e.currentTarget.querySelector("summary").focus(); } }}>
              <summary>{title}</summary>
              <div>{links.map(([url, label]) => <Link href={url} key={url}
                onClick={e => { e.currentTarget.closest("details").open = false; }}>{label}</Link>)}</div>
            </details>
          ))}</nav>
        <div className="headTools">
          <Link aria-label="통합검색" href="/search" className="iconButton">
            <Search />
          </Link>
          <Link
            href="/member"
            className="memberButton"
            aria-label={signedIn ? "내 정보" : "회원 로그인"}
          >
            <UserRound size={17} />
            <span>{signedIn ? "내 정보" : "회원 로그인"}</span>
          </Link>
          <button
            ref={toggle}
            className="mobileSwitch iconButton"
            onClick={() => setOpen(!open)}
            aria-label={open ? "메뉴 닫기" : "전체 메뉴"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="mobileNav" aria-label="모바일 메뉴">
          {menus.map(([title, links]) => <details className="mobileGroup" key={title}>
            <summary>{title}</summary>
            {links.map(([url, label]) => <Link key={url} href={url} onClick={() => setOpen(false)}>{label}</Link>)}
          </details>)}</nav>
      )}
    </header>
  );
}
