export const siteName = "대한재활의학과의사회";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rm.or.kr"
).replace(/\/$/, "");
export const description =
  "대한재활의학과의사회 공식 홈페이지. 학술대회와 재활 초음파 워크숍, 보험·청구 자료, 정회원 지원과 의사회 소식을 확인하세요.";
export const menus = [
  [siteName, [
    ["/about/greeting", "인사말"], ["/about/history", "연혁 및 주요활동"],
    ["/about/rules", "회칙"], ["/about/organization", "조직도"], ["/about/contact", "오시는길"],
  ]],
  ["공지 및 게시판", [
    ["/news/notices", "공지사항"], ["/education/library", "학술동영상"],
    ["/member/documents", "자료실"], ["/insurance/notices", "보험"],
  ]],
  ["학술대회", [["/education/calendar", "학술대회"]]],
  ["회원게시판", [
    ["/news/gallery", "포토갤러리"], ["/member/consult/qa", "Q&A게시판"],
    ["/member/consult/insurance", "보험상담"],
  ]],
];