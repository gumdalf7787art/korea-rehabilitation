import legacyData from "./legacy.json";
const original = (query = "") =>
  (process.env.NEXT_PUBLIC_LEGACY_URL || "https://www.rm.or.kr").replace(
    /\/$/,
    "",
  ) +
  "/" +
  query;
const link = (label, href) => ({ label, href });
const legacy = (label, query) => link(label, original(query));
const item = (path, title, description, options = {}) => ({
  path,
  title,
  description,
  ...options,
});

export const sections = [
  {
    slug: "about",
    title: "의사회 소개",
    description:
      "재활의학과 의사들이 함께해 온 길과 의사회의 활동을 소개합니다.",
  },
  {
    slug: "education",
    title: "학술·교육",
    description:
      "학술대회와 실습 워크숍을 신청하고, 지난 교육과 강의자료를 찾아보세요.",
  },
  {
    slug: "insurance",
    title: "보험·청구",
    description:
      "재활의학과 진료에 관련된 보험 고시와 심사 기준, 청구 서식을 확인하세요.",
  },
  {
    slug: "support",
    title: "회원지원",
    description:
      "정회원 가입부터 법률상담, 공동구매까지 회원 서비스를 이용하세요.",
  },
  {
    slug: "news",
    title: "소식·정책",
    description: "의사회 공지와 정책 활동, 언론에 소개된 소식을 전합니다.",
  },
  {
    slug: "public",
    title: "국민 안내",
    description: "재활의학과가 하는 일을 알아보고 지역의 병의원을 찾아보세요.",
  },
];

const member = link("내 회원 상태 확인", "/member");
export const contactLinks = [
  link("전화 1599-4897", "tel:15994897"),
  link("이메일 보내기", "mailto:kmreha@naver.com"),
];

const pages = [
  item(
    "/about/greeting",
    "인사말",
    "2025년 취임한 제15대 백경우 회장의 인사말입니다.",
    {
      paragraphs: [
        "대한재활의학과의사회는 회원의 전문성 향상과 권익 보호, 국민 건강과 사회복지 향상을 목적으로 활동합니다. 제15대 집행부는 회원의 의견을 듣고 국민에게 재활의학의 역할을 알리는 데 힘쓰겠다는 뜻을 밝혔습니다.",
      ],
      links: [legacy("회장 인사말 전문", "?c=1/5")],
    },
  ),
  item(
    "/about/history",
    "연혁·주요 활동",
    "1996년 창립 이후 의료제도 개선과 교육, 회원 지원을 이어왔습니다.",
    {
      facts: [
        ["1996.12.08", "개원의협의회 창립"],
        ["2021.01.05", "근전도 니들 공동구매 업무협약"],
        ["2022.02.16", "대한의사협회 의료배상공제조합 업무협약"],
        ["2026.02.22", "춘계 학술대회 및 창립 30주년 기념행사"],
      ],
      links: [legacy("주요 활동 전체 기록", "?c=1/6")],
    },
  ),
  item(
    "/about/organization",
    "조직·회칙",
    "의사회의 목적과 사업, 조직 구성 및 회칙을 확인하세요.",
    {
      paragraphs: [
        "교육과 학술 교류, 재활의료 전달체계와 재활수가 개선, 회원 권익 보호가 의사회의 주요 사업입니다. 회칙에는 회원과 임원, 총회, 이사회 및 재정 운영에 관한 사항이 정리되어 있습니다.",
      ],
      links: [legacy("조직도 보기", "?c=1/8"), legacy("회칙 전문", "?c=1/7")],
    },
  ),
  item(
    "/about/contact",
    "사무국·오시는 길",
    "학술행사와 회원 가입, 연회비 관련 문의는 사무국에서 안내합니다.",
    {
      facts: [
        ["주소", "경기도 안양시 만안구 안양로 249, 302호"],
        ["전화", "1599-4897"],
        ["이메일", "kmreha@naver.com"],
        ["팩스", "02-6007-1102"],
      ],
      links: contactLinks,
    },
  ),
  item(
    "/education/calendar",
    "학술대회 일정·등록",
    "예정된 교육의 일정과 장소를 확인하고 등록할 수 있습니다.",
    { view: "events", links: [link("내 등록 확인", "/member")] },
  ),
  item(
    "/education/workshops",
    "실습 워크숍",
    "초음파 등 술기 교육의 일정과 지난 워크숍 기록을 확인하세요.",
    { view: "workshops" },
  ),
  item(
    "/education/library",
    "강의 다시보기·자료",
    "강의명, 연자, 주제로 다시보기 영상과 자료를 찾을 수 있습니다.",
    {
      view: "lecture",
      links: [
        link("정회원 자료실", "/member/documents"),
        legacy("기존 학술동영상", "?c=3/11"),
      ],
    },
  ),
  item(
    "/education/archive",
    "역대 학술행사",
    "연도별 춘·추계 학술대회, 세미나와 실습 워크숍 기록입니다.",
    {
      view: "archive",
      links: [
        legacy("기존 행사 기록", "?c=4/20"),
        legacy("기존 등록 내역 확인", "?c=4/19"),
      ],
    },
  ),
  item(
    "/insurance/notices",
    "고시·심사 기준",
    "게시일과 적용 시점을 구분해 고시의 원문과 관련 자료를 확인하세요.",
    { view: "insurance", links: [legacy("기존 보험 게시판", "?c=3/22")] },
  ),
  item(
    "/insurance/forms",
    "청구 실무 서식",
    "사무국이 공개한 청구·실무 서식과 회원용 자료를 확인하세요.",
    {
      view: "form",
      links: [
        link("정회원 자료실", "/member/documents"),
        legacy("기존 자료실", "?c=3/14"),
      ],
    },
  ),
  item(
    "/insurance/faq",
    "보험 자료 이용 안내",
    "고시의 적용 시점과 개정 내역, 필요한 서식을 찾는 방법입니다.",
    {
      faq: [
        [
          "게시일과 시행일은 어떻게 다른가요?",
          "게시일은 의사회가 자료를 등록한 날이며, 시행일은 해당 기준의 적용이 시작되는 날입니다. 개별 진료에 적용할 때에는 공문 원문에서 적용 시점과 경과 규정을 확인하세요.",
        ],
        [
          "검사나 처치별 기준은 어디에서 찾나요?",
          "고시·심사 기준에서 근전도, 도수치료 등 찾으려는 행위명을 입력하세요. 자료 상세에서 관련 공문이나 원문 링크를 확인할 수 있습니다.",
        ],
        [
          "회원 전용 서식은 어디에서 내려받나요?",
          "정회원으로 로그인한 뒤 회원 자료실을 이용하세요. 이전 홈페이지에 등록된 문서는 기존 자료실에서 확인할 수 있습니다.",
        ],
      ],
      links: [
        link("고시·심사 기준", "/insurance/notices"),
        link("실무 서식 찾기", "/insurance/forms"),
      ],
    },
  ),
  item(
    "/support/membership",
    "정회원 가입·연회비",
    "가입 신청과 연회비 납부 후 사무국 확인을 거쳐 정회원 서비스를 이용합니다.",
    {
      facts: [
        ["연회비", "10만 원"],
        ["학술 혜택", "학술대회 강의 다시보기, 초청 워크숍 우선등록"],
        ["실무 혜택", "무료 법률상담, 협력업체 공동구매 상담"],
      ],
      links: [link("회원가입", "/member/join"), member],
      source: original(),
    },
  ),
  item(
    "/support/consultation",
    "법률상담·회원 고충",
    "회원 업무와 관련한 상담을 접수하고 마이페이지에서 처리 상태를 확인하세요.",
    {
      links: [link("비공개 상담 접수", "/member/consult"), member],
      source: original("?c=3/25"),
    },
  ),
  item(
    "/support/purchase",
    "공동구매·제휴",
    "정회원을 위한 근전도 니들 공동구매 안내입니다.",
    {
      paragraphs: [
        "2026년 하반기 공동구매 공지에서는 해당 연도 회비를 납부한 정회원을 대상으로 신청서를 접수합니다. 품목과 수량을 확인한 뒤 공지에 안내된 신청서를 작성해 사무국으로 보내주세요.",
      ],
      facts: [
        ["품목", "근전도 니들 25mm · 37mm · 50mm"],
        ["신청처", "대한재활의학과의사회 사무국"],
        ["접수 이메일", "kmreha@naver.com"],
      ],
      links: [
        legacy("공동구매 공지·신청서", "?c=3/10&uid=8349"),
        ...contactLinks,
      ],
      view: "purchase",
    },
  ),
  item(
    "/news/notices",
    "공지사항",
    "학술대회, 정기총회와 회원 대상 사업에 관한 의사회 공지입니다.",
    { view: "notices" },
  ),
  item(
    "/news/policy",
    "정책 활동·언론보도",
    "재활의료 제도에 대한 의사회의 활동과 관련 보도를 모았습니다.",
    { view: "policy" },
  ),
  item(
    "/news/tv",
    "대한재활의학과의사회TV",
    "공식 유튜브 채널과 행사 사진을 확인할 수 있습니다.",
    {
      links: [
        link(
          "의사회TV 시청",
          "https://www.youtube.com/channel/UCdXw-_i5MesRrzKbd4pTs_A",
        ),
        link("행사 포토갤러리", "/news/gallery"),
      ],
    },
  ),
  item(
    "/news/gallery",
    "행사 포토갤러리",
    "학술대회 현장과 참석 회원들의 모습을 사진으로 만나보세요.",
    { links: [legacy("기존 포토갤러리", "?c=3/23")] },
  ),
  item(
    "/public/rehabilitation",
    "재활의학과 소개",
    "재활의학과는 손상이나 질환으로 달라진 신체 기능과 일상 활동을 평가하고 회복을 돕습니다.",
    {
      paragraphs: [
        "진료에서는 움직임과 감각, 식사와 의사소통처럼 일상에서 어려워진 기능을 살핍니다. 재활의학과 전문의는 환자의 생활환경과 회복 목표를 함께 고려해 필요한 평가와 재활 계획을 세웁니다.",
      ],
      links: [
        link("질환별 재활 안내", "https://karm.or.kr/info/disease.php"),
        link("재활의학과 병의원 찾기", "/public/hospitals"),
      ],
    },
  ),
  item(
    "/public/hospitals",
    "재활의학과 병의원 찾기",
    "공개에 동의한 회원 병의원을 지역 또는 기관명으로 찾아보세요.",
    {
      view: "clinics",
      links: [
        link(
          "대한재활의학회 지역별 병원 검색",
          "https://karm.or.kr/hospital/index.php",
        ),
      ],
    },
  ),
  item(
    "/public/faq",
    "재활의학과 자주 묻는 질문",
    "재활의학과와 지역 의료기관에 대한 질문에 답합니다.",
    {
      faq: [
        [
          "재활의학과는 무엇을 하는 곳인가요?",
          "질환이나 손상으로 일상생활에 어려움이 있을 때 신체 기능과 활동을 평가하고, 회복과 사회 복귀를 돕는 진료과입니다.",
        ],
        [
          "내가 사는 지역의 병의원을 어떻게 찾나요?",
          "병의원 찾기에서 지역명이나 의료기관명을 검색하세요. 대한재활의학회 지역별 병원 검색도 이용할 수 있습니다.",
        ],
        [
          "특정 검사나 치료를 받을 수 있는지 어디에 문의하나요?",
          "병의원별로 운영하는 진료 분야와 장비가 다릅니다. 방문 전에 해당 의료기관에 연락해 진료 및 예약 여부를 확인하세요.",
        ],
      ],
      links: [
        link("병의원 찾기", "/public/hospitals"),
        link(
          "대한재활의학회 질병별 안내",
          "https://karm.or.kr/info/disease.php",
        ),
      ],
    },
  ),
];

export const archiveEvents = legacyData.events.map((event) => {
  const source = new URL(event.source);
  const path = "/education/archive/" + source.searchParams.get("uid");
  return item(
    path,
    event.title,
    "대한재활의학과의사회가 " +
      event.date.replaceAll("-", ".") +
      "에 진행한 행사입니다.",
    {
      date: event.date,
      group: "행사 기록",
      source: original(source.search),
      facts: [
        ["개최일", event.date],
        ...(event.venue ? [["장소", event.venue]] : []),
        ...(event.theme ? [["주제", event.theme]] : []),
        ["주최", "대한재활의학과의사회"],
        ["행사 상태", "종료"],
      ],
      links: [
        ...(event.poster ? [link("공식 프로그램 보기", event.poster)] : []),
        link("강의 다시보기", "/education/library"),
      ],
    },
  );
});
export const articles = [
  item(
    "/insurance/notices/manual-therapy",
    "도수치료 관리급여 세부 기준과 질의응답",
    "도수치료 관리급여의 적용 대상과 진료기록, 청구 질의응답을 담은 의사회 안내입니다.",
    {
      date: "2026-06-11",
      effective: "2026-07-01",
      group: "보험·청구",
      source: original("?c=3/10&uid=8074"),
    },
  ),
  item(
    "/insurance/notices/electrodiagnosis",
    "근전도·신경전도검사의 양측검사 적용기준",
    "나611 근전도검사와 나612 신경전도검사의 양측 시행에 관한 건강보험심사평가원 공고 제2024-195호 안내입니다.",
    {
      date: "2024-12-24",
      group: "보험·청구",
      source: original("?c=3/22&uid=6954"),
    },
  ),
  item(
    "/news/policy/non-covered-care",
    "비급여 관리 법안에 관한 의료단체 의견",
    "의사회가 비급여 관리 법안에 관한 의료단체의 의견을 다룬 언론보도를 소개했습니다.",
    {
      date: "2026-11-09",
      group: "언론보도",
      source: original("?c=3/10&uid=8356"),
      links: [legacy("관련 의학신문 보도 안내", "?c=3/10&uid=8355")],
    },
  ),
  item(
    "/news/notices/needle-2026",
    "2026년 하반기 근전도 니들 공동구매 안내",
    "2026년 회비를 납부한 정회원을 대상으로 진행하는 근전도 니들 공동구매 공지입니다.",
    {
      date: "2026-10-28",
      group: "회원 공지",
      source: original("?c=3/10&uid=8349"),
      links: [link("신청 방법 보기", "/support/purchase")],
    },
  ),
  item(
    "/news/notices/assembly-2026",
    "2026년 정기총회 개최 안내",
    "대한재활의학과의사회 정기총회에 관한 회원 공지입니다.",
    {
      date: "2026-10-13",
      group: "회원 공지",
      source: original("?c=3/10&uid=8347"),
    },
  ),
];
export const publicPages = [
  ...sections.map((s) => item("/" + s.slug, s.title, s.description)),
  ...pages,
  ...articles,
  ...archiveEvents,
];
export function childPages(section) {
  return pages.filter((p) => p.path.startsWith("/" + section + "/"));
}
export function matchesQuery(text, query) {
  const normalize = (value) =>
    String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase("ko")
      .replace(/[\s·ㆍ.-]/g, "");
  const target = normalize(text);
  return query
    .trim()
    .split(/\s+/)
    .every((word) => target.includes(normalize(word)));
}
export function searchContent(query) {
  return publicPages.filter((p) =>
    matchesQuery(
      [
        p.title,
        p.description,
        p.group,
        ...(p.facts || []).flat(),
        ...(p.faq || []).flat(),
      ].join(" "),
      query,
    ),
  );
}
