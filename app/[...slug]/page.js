import BoardList from "../board-list";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveEvents,
  articles,
  childPages,
  matchesQuery,
  publicPages,
  searchContent,
  sections,
} from "../../lib/content";
import {
  getArticle,
  getPublicEvent,
  listArticles,
  listClinics,
  listEvents,
  listPublicFiles,
} from "../../lib/content-store";
import legacyData from "../../lib/legacy.json";
import { siteUrl, siteName, menus } from "../../lib/site";
import "./content.css";

export const dynamic = "force-dynamic";
const searchPage = {
  path: "/search",
  title: "통합검색",
  description: "학술대회, 강의, 보험 자료와 회원 서비스를 한 번에 검색하세요.",
};
const index = new Map(
  [...publicPages, searchPage].map((page) => [page.path, page]),
);

async function resolvePage(slug) {
  const path = "/" + slug.join("/");
  if (index.has(path)) return index.get(path);
  if (slug.length === 3 && slug[0] === "education" && slug[1] === "event")
    return getPublicEvent(slug[2]);
  if (
    slug.length === 3 &&
    ["news", "insurance"].includes(slug[0]) &&
    slug[1] === "post"
  )
    return getArticle(slug[0], slug[2]);
  return null;
}
export async function generateMetadata({ params, searchParams }) {
  const page = await resolvePage((await params).slug);
  if (!page) return { robots: { index: false, follow: false } };
  const query = await searchParams;
  const robots = {
    index: page.path !== "/search" && !query.q && !query.p,
    follow: true,
  };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    robots,
    openGraph: {
      type: page.group && page.group !== "행사 기록" ? "article" : "website",
      title: page.title,
      description: page.description,
      url: page.path,
      locale: "ko_KR",
      siteName,
      images: ["/media/hero.webp"],
    },
  };
}
function QueryForm({
  path,
  q,
  label = "검색어",
  placeholder = "제목 또는 키워드",
}) {
  return (
    <form role="search" method="get" action={path} className="contentSearch">
      <label>
        <span className="contentVisuallyHidden">{label}</span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          maxLength={100}
        />
      </label>
      <button type="submit">검색</button>
      {q && <Link href={path}>초기화</Link>}
    </form>
  );
}
function ActionLinks({ links = [] }) {
  return links.length ? (
    <div className="contentActions">
      {links.map(({ href, label }) => (
        <a key={href} href={href}>
          {label}
        </a>
      ))}
    </div>
  ) : null;
}
function ResultList({ rows, empty = "공개된 자료가 없습니다." }) {
  if (!rows.length) return <p className="contentEmpty">{empty}</p>;
  return (
    <ul className="contentRows">
      {rows.map((row) => (
        <li key={row.path}>
          <a href={row.path}>
            <span className="contentRowCopy">
              {row.group && <small>{row.group}</small>}
              <strong>{row.title}</strong>
              {row.description && <span>{row.description}</span>}
            </span>
            {row.date && (
              <time dateTime={row.date}>{row.date.replaceAll("-", ".")}</time>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
function PagedList({ rows, path, q, page, empty, type }) {
  const perPage = 12;
  const count = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(count, page);
  function href(p) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    params.set("p", String(p));
    return path + "?" + params;
  }
  return (
    <>
      <ResultList
        rows={rows.slice((current - 1) * perPage, current * perPage)}
        empty={empty}
      />
      {count > 1 && (
        <nav className="contentPager" aria-label="목록 페이지">
          {current > 1 && <Link href={href(current - 1)}>이전</Link>}
          <span>
            {current} / {count}
          </span>
          {current < count && <Link href={href(current + 1)}>다음</Link>}
        </nav>
      )}
    </>
  );
}
const filter = (rows, q) =>
  rows.filter((r) =>
    matchesQuery(
      [r.title, r.description, r.group, r.date, r.effective]
        .filter(Boolean)
        .join(" "),
      q,
    ),
  );
const byDate = (a, b) => (b.date || "").localeCompare(a.date || "");

async function Listing({ model, q, page, searchType }) {
  const { view, path } = model;
  if (view === "clinics") {
    const clinics = await listClinics(q);
    return (
      <>
        <QueryForm path={path} q={q} placeholder="지역 또는 병의원명" />
        {clinics.length ? (
          <ul className="contentClinics">
            {clinics.map((c) => (
              <li key={c.name + c.address}>
                <small>{c.region}</small>
                <h2>{c.name}</h2>
                <p>{c.address}</p>
                <ActionLinks
                  links={[
                    {
                      label: c.phone,
                      href: "tel:" + c.phone.replace(/[^+\d]/g, ""),
                    },
                    ...(c.site_url
                      ? [{ label: "병의원 홈페이지", href: c.site_url }]
                      : []),
                  ]}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="contentEmpty">
            {q
              ? "검색 조건에 맞는 회원 병의원이 없습니다."
              : "현재 공개된 회원 병의원이 없습니다."}{" "}
            대한재활의학회 병원 검색에서 다른 의료기관을 확인할 수 있습니다.
          </p>
        )}
      </>
    );
  }
  let rows = [];
  let empty = q
    ? "검색 결과가 없습니다. 다른 검색어를 입력해 주세요."
    : "공개된 자료가 없습니다.";
  if (view === "search") {
    if (!q)
      return (
        <>
          <QueryForm
            path={path}
            q=""
            label="통합검색"
            placeholder="예: 근전도, 연회비, 초음파"
          />
          <h2>바로 찾기</h2>
          <ActionLinks
            links={["근전도", "초음파", "연회비", "법률상담"].map((word) => ({
              label: word,
              href: "/search?q=" + encodeURIComponent(word),
            }))}
          />
        </>
      );
    const [dbArticles, events, files] = await Promise.all([
      listArticles("", q),
      listEvents(q),
      listPublicFiles("", q),
    ]);
    rows = [...dbArticles, ...events, ...files, ...searchContent(q)];
    const kinds = [
      [
        "education",
        "학술·교육",
        (r) =>
          r.path.startsWith("/education") ||
          r.path.startsWith("/member/events") ||
          r.group === "공개 강의",
      ],
      [
        "insurance",
        "보험·청구",
        (r) =>
          r.path.startsWith("/insurance") ||
          ["서식", "보험 자료"].includes(r.group),
      ],
      ["news", "소식·정책", (r) => r.path.startsWith("/news")],
    ];
    const sections = kinds.map(([key, title, test]) => ({
      key,
      title,
      rows: rows.filter(test),
    }));
    sections.push({
      key: "services",
      title: "회원·국민 안내",
      rows: rows.filter((r) => !kinds.some(([, , test]) => test(r))),
    });
    const selected = sections.find((s) => s.key === searchType);
    return (
      <>
        <QueryForm
          path={path}
          q={q}
          label="통합검색"
          placeholder="학술대회, 보험 자료, 회원 서비스"
        />
        <nav className="contentTabs" aria-label="검색 결과 분류">
          {[{ key: "", title: "전체", rows }, ...sections].map((s) => (
            <Link
              key={s.key}
              aria-current={
                s.key === (selected?.key || "") ? "page" : undefined
              }
              href={
                "/search?" +
                new URLSearchParams({ q, ...(s.key ? { type: s.key } : {}) })
              }
            >
              {s.title} {s.rows.length}
            </Link>
          ))}
        </nav>
        <h2>
          {selected?.title || "전체 검색 결과"}{" "}
          <span className="contentCount">
            {(selected?.rows || rows).length}건
          </span>
        </h2>
        <PagedList
          rows={selected?.rows || rows}
          empty={empty}
          path={path}
          q={q}
          page={page}
          type={selected?.key}
        />
      </>
    );
  } else if (["archive", "events", "workshops"].includes(view)) {
    if (view === "archive")
      rows = [
        ...(await listEvents(q, "archive")),
        ...filter(archiveEvents, q),
      ].sort(byDate);
    if (view === "events") {
      rows = await listEvents(q, "upcoming");
      if (!q)
        empty =
          "현재 예정된 행사가 없습니다. 지난 교육은 역대 학술행사에서 확인하세요.";
    }
    if (view === "workshops") {
      rows = [...(await listEvents(q)), ...filter(archiveEvents, q)].filter(
        (r) => /워크숍|워크샵|실습|workshop/i.test(r.title),
      );
    }
  } else if (["insurance", "notices", "policy"].includes(view)) {
    const section = view === "insurance" ? "insurance" : "news";
    const archive = articles.filter((r) =>
      view === "insurance"
        ? r.path.startsWith("/insurance/")
        : r.path.startsWith("/news/" + view + "/"),
    );
    const [newArticles, files] = await Promise.all([
      view === "policy" ? [] : listArticles(section, q),
      view === "insurance" ? listPublicFiles("insurance", q) : [],
    ]);
    rows = [...newArticles, ...files, ...filter(archive, q)].sort(byDate);
  } else if (view === "lecture" || view === "form") {
    rows = await listPublicFiles(view, q);
    if (!q)
      empty =
        view === "lecture"
          ? "공개 강의가 없습니다. 기존 학술동영상과 정회원 자료실에서 강의를 확인하세요."
          : "공개 서식이 없습니다. 정회원 자료실에서 이용 가능한 서식을 확인하세요.";
  } else {
    return null;
  }
  if (["insurance", "notices", "lecture"].includes(view))
    return <BoardList rows={rows} path={path} q={q} type={searchType} page={page} empty={empty} />;
  return (
    <>
      <QueryForm
        path={path}
        q={q}
        placeholder={
          view === "events"
            ? "행사명 또는 장소"
            : view === "lecture"
              ? "강의명, 연자 또는 주제"
              : "제목 또는 키워드"
        }
      />
      <PagedList rows={rows} empty={empty} path={path} q={q} page={page} />
    </>
  );
}
function Gallery() {
  return (
    <div className="contentGallery">
      {legacyData.gallery.map((image) => (
        <figure key={image.image}>
          <img
            src={image.image}
            alt={image.alt}
            loading="lazy"
            width="640"
            height="400"
          />
          <figcaption>{image.alt}</figcaption>
        </figure>
      ))}
    </div>
  );
}
async function Overview({ section }) {
  const children = childPages(section.slug);
  let feature;
  if (section.slug === "education")
    feature = {
      title: "교육 일정",
      rows: await listEvents("", "upcoming"),
      empty: "현재 접수 예정인 행사가 없습니다.",
      link: "/education/archive",
      label: "역대 행사 보기",
    };
  if (section.slug === "news" || section.slug === "insurance") {
    const rows = [
      ...(await listArticles(section.slug)),
      ...articles.filter((a) => a.path.startsWith("/" + section.slug + "/")),
    ].sort(byDate);
    feature = {
      title: section.slug === "news" ? "최근 소식" : "보험 자료",
      rows: rows.slice(0, 4),
    };
  }
  return (
    <>
      <div className="contentTiles">
        {children.map((c) => (
          <Link key={c.path} href={c.path}>
            <h2>{c.title}</h2>
            <p>{c.description}</p>
          </Link>
        ))}
      </div>
      {feature && (
        <section className="contentFeature">
          <h2>{feature.title}</h2>
          <ResultList rows={feature.rows} empty={feature.empty} />
          {feature.link && (
            <ActionLinks
              links={[{ label: feature.label, href: feature.link }]}
            />
          )}
        </section>
      )}
    </>
  );
}
function Breadcrumbs({ section, model, parent }) {
  const crumbs = [{ path: "/", title: "홈" }];
  if (section && model.path !== "/" + section.slug)
    crumbs.push({ path: "/" + section.slug, title: section.title });
  if (parent) crumbs.push({ path: parent.path, title: parent.title });
  crumbs.push(model);
  const structured = [
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        item: siteUrl + p.path,
      })),
    },
  ];
  if (model.faq)
    structured.push({
      "@type": "FAQPage",
      mainEntity: model.faq.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  if (model.date && model.group !== "행사 기록")
    structured.push({
      "@type": "Article",
      headline: model.title,
      description: model.description,
      dateModified: model.date,
      mainEntityOfPage: siteUrl + model.path,
      publisher: { "@id": siteUrl + "/#organization" },
    });
  if (model.group === "행사 기록") {
    const venue = model.facts.find(([key]) => key === "장소")?.[1];
    structured.push({
      "@type": "EducationEvent",
      name: model.title,
      startDate: model.date,
      url: siteUrl + model.path,
      organizer: { "@id": siteUrl + "/#organization" },
      ...(venue ? { location: { "@type": "Place", name: venue } } : {}),
    });
  }
  if (model.event)
    structured.push({
      "@type": "EducationEvent",
      name: model.title,
      description: model.description,
      url: siteUrl + model.path,
      organizer: { "@id": siteUrl + "/#organization" },
      ...model.event,
    });
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": structured,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="현재 위치" className="contentCrumbs">
        {crumbs.map((p, i) =>
          i === crumbs.length - 1 ? (
            <span key={p.path} aria-current="page">
              {p.title}
            </span>
          ) : (
            <Link href={p.path} key={p.path}>
              {p.title}
            </Link>
          ),
        )}
      </nav>
    </>
  );
}
export default async function ContentPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const model = await resolvePage(slug);
  if (!model) notFound();
  const section = sections.find((s) => s.slug === slug[0]);
  const q = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const page = Math.max(1, parseInt(query.p, 10) || 1);
  const parent =
    slug.length === 3 ? index.get("/" + slug.slice(0, 2).join("/")) : null;
  const group = menus.find(([, links]) => links.some(([url]) => url === model.path || url === parent?.path));
  const links = [...(model.links || [])];
  if (model.source) links.push({ label: "공식 원문 보기", href: model.source });
  return (
    <main className="contentPage">
      <div className="contentFrame">
        <Breadcrumbs section={section} model={model} parent={parent} />
        <header className="contentTitle">
          <h1>{model.title}</h1>
          <p>{model.description}</p>
        </header>
        {section && (
          <nav className="contentTabs" aria-label={(group?.[0] || section.title) + " 메뉴"}>
            {(group ? group[1].map(([path, title]) => ({path, title})) : [
              { path: "/" + section.slug, title: "전체" },
              ...childPages(section.slug),
            ]).map((c) => (
              <Link
                key={c.path}
                href={c.path}
                aria-current={
                  model.path === c.path || parent?.path === c.path
                    ? "page"
                    : undefined
                }
              >
                {c.title}
              </Link>
            ))}
          </nav>
        )}
        {slug.length === 1 && section ? (
          <Overview section={section} />
        ) : (
          <div className="contentBody">
            {model.group && (
              <div className="contentMeta">
                <span>{model.group}</span>
                {model.date && (
                  <span>
                    {model.group === "행사 기록" ? "개최" : "게시·수정"}{" "}
                    {model.date}
                  </span>
                )}
                {model.effective && <span>시행 {model.effective}</span>}
              </div>
            )}
            {model.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {model.facts && (
              <dl className="contentFacts">
                {model.facts.map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {model.faq &&
              model.faq.map(([question, answer]) => (
                <details key={question} open className="contentFaq">
                  <summary>{question}</summary>
                  <p>{answer}</p>
                </details>
              ))}
            {(model.view || model.path === "/search") && (
              <Listing
                model={
                  model.path === "/search"
                    ? { ...model, view: "search" }
                    : model
                }
                q={q}
                page={page}
                searchType={query.type}
              />
            )}
            <ActionLinks links={links} />
            {model.path === "/news/gallery" && <Gallery />}
          </div>
        )}
      </div>
    </main>
  );
}
