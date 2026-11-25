import Link from "next/link";
export default function Missing() {
  return (
    <main className="wrap page">
      <p className="eyebrow">404</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>주소를 확인하거나 통합검색에서 원하는 자료를 찾아주세요.</p>
      <div className="actions">
        <Link className="btn" href="/search">
          통합검색
        </Link>
        <Link className="btn secondary" href="/">
          홈으로
        </Link>
      </div>
    </main>
  );
}
