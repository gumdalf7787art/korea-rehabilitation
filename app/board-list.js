import Link from "next/link";
import { Search } from "lucide-react";

export default function BoardList({rows, path, q = "", type = "", page = 1, empty, event}) {
  const result = type === "title" && q
    ? rows.filter(row => row.title.toLocaleLowerCase().includes(q.toLocaleLowerCase()))
    : rows;
  const pages = Math.max(1, Math.ceil(result.length / 12));
  const current = Math.min(page, pages);
  const start = (current - 1) * 12;
  function pageLink(p) {
    return path + "?" + new URLSearchParams({ q, type, p, ...(event ? {event} : {}) });
  }
  return <div className="boardList">
    <div className="boardBar"><div><strong>리스트 전체보기</strong>　 Total <b>{result.length}</b></div>
      <form action={path} role="search">
        {event && <input type="hidden" name="event" value={event} />}
        <select name="type" aria-label="검색 범위" defaultValue={type}><option value="">전체</option><option value="title">제목</option></select>
        <input type="search" name="q" aria-label="게시물 검색어" defaultValue={q} maxLength={100} />
        <button aria-label="게시물 검색"><Search size={18}/></button>
      </form>
    </div>
    <table><thead><tr>{["번호","제목","작성자","작성일","조회수"].map(t=><th key={t} scope="col">{t}</th>)}</tr></thead>
      <tbody>{result.slice(start,start+12).map((row,i)=><tr key={row.path}>
        <td>{result.length-start-i}</td><td><Link href={row.path}>{row.title}</Link></td>
        <td>{row.author || "—"}</td><td>{row.date?.replaceAll("-",".") || "—"}</td><td>{row.views ?? "—"}</td>
      </tr>)}</tbody></table>
    {!result.length && <p className="contentEmpty">{q ? "검색 결과가 없습니다." : empty || "등록된 게시물이 없습니다."}</p>}
    {pages > 1 && <nav className="contentPager" aria-label="게시판 페이지">
      {current>1 && <Link href={pageLink(current-1)}>이전</Link>} {current} / {pages} {current<pages && <Link href={pageLink(current+1)}>다음</Link>}
    </nav>}
  </div>;
}
