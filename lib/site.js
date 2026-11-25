export const siteName = "대한재활의학과의사회";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.rm.or.kr"
).replace(/\/$/, "");
export const description =
  "대한재활의학과의사회 공식 홈페이지. 학술대회와 재활 초음파 워크숍, 보험·청구 자료, 정회원 지원과 의사회 소식을 확인하세요.";
export const menus = [
  ["/about", "의사회 소개"],
  ["/education", "학술·교육"],
  ["/insurance", "보험·청구"],
  ["/support", "회원지원"],
  ["/news", "소식·정책"],
  ["/public", "국민 안내"],
];
