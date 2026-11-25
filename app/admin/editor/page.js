import Link from "next/link";
import { redirect } from "next/navigation";
import {
  fields,
  id,
  portalEnv,
  requireStaff,
  timestamp,
} from "../../../lib/portal";
import "../../member/portal.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "병의원 명부 관리",
  robots: { index: false, follow: false },
};
async function save(form) {
  "use server";
  await requireStaff();
  const { DB } = await portalEnv();
  const key = fields(form, "id");
  const name = fields(form, "name"),
    region = fields(form, "region"),
    address = fields(form, "address"),
    phone = fields(form, "phone");
  const site = fields(form, "site"),
    consent = form.has("consent"),
    published = form.has("published");
  if (
    !name ||
    name.length > 120 ||
    !region ||
    region.length > 30 ||
    !address ||
    address.length > 250 ||
    !/^[0-9+() -]{7,24}$/.test(phone) ||
    site.length > 1000 ||
    (published && !consent)
  )
    redirect("/admin/editor?note=invalid");
  if (site) {
    const url = URL.canParse(site) ? new URL(site) : null;
    if (!url || !["http:", "https:"].includes(url.protocol))
      redirect("/admin/editor?note=invalid");
  }
  const values = [
    name,
    region,
    address,
    phone,
    site,
    Number(published),
    Number(consent),
    timestamp(),
  ];
  if (key)
    await DB.prepare(
      "UPDATE clinics SET name=?,region=?,address=?,phone=?,site_url=?,published=?,consent_confirmed=?,updated_at=? WHERE id=?",
    )
      .bind(...values, key)
      .run();
  else
    await DB.prepare(
      "INSERT INTO clinics(name,region,address,phone,site_url,published,consent_confirmed,updated_at,id) VALUES(?,?,?,?,?,?,?,?,?)",
    )
      .bind(...values, id())
      .run();
  redirect("/admin/editor?note=saved");
}
function ClinicForm({ c = {} }) {
  return (
    <form action={save} className="clinicEdit">
      <input type="hidden" name="id" value={c.id || ""} />
      {[
        ["기관명", "name", c.name, 120],
        ["시도", "region", c.region, 30],
        ["주소", "address", c.address, 250],
        ["대표전화", "phone", c.phone, 24],
        ["기관 홈페이지", "site", c.site_url, 1000],
      ].map(([label, key, value, max]) => (
        <label key={key}>
          {label}
          <input
            name={key}
            defaultValue={value || ""}
            maxLength={max}
            type={key === "site" ? "url" : "text"}
            required={key !== "site"}
          />
        </label>
      ))}
      <label>
        <input
          type="checkbox"
          name="consent"
          defaultChecked={!!c.consent_confirmed}
        />{" "}
        기관 공개 동의 확인
      </label>
      <label>
        <input
          type="checkbox"
          name="published"
          defaultChecked={!!c.published}
        />{" "}
        병의원 찾기에 게시
      </label>
      <button className="btn" type="submit">
        저장
      </button>
    </form>
  );
}
export default async function ClinicAdmin({ searchParams }) {
  await requireStaff();
  const { DB } = await portalEnv();
  const clinics = (
    await DB.prepare("SELECT * FROM clinics ORDER BY region,name").all()
  ).results;
  const { note } = await searchParams;
  return (
    <main className="wrap page">
      <Link href="/admin">사무국 관리</Link>
      <h1>병의원 명부 관리</h1>
      {note && (
        <p role="status">
          {note === "saved"
            ? "저장했습니다."
            : "기관명·주소·전화번호와 공개 동의 여부를 확인해 주세요."}
        </p>
      )}
      <style>
        {
          ".clinicEdit{display:grid;gap:12px;max-width:540px;margin:18px 0}.clinicEdit label{display:grid;gap:5px}.clinicEdit label:has(input[type=checkbox]){display:flex;align-items:center}.clinicEdit input:not([type=checkbox]){border:1px solid var(--line);border-radius:8px;padding:11px;font:inherit}.clinicEdit button{justify-self:start}"
        }
      </style>
      <section className="panel">
        <h2>기관 등록</h2>
        <ClinicForm />
      </section>
      <section className="panel">
        <h2>등록 기관 {clinics.length}곳</h2>
        {clinics.map((c) => (
          <details key={c.id}>
            <summary>
              {c.name} · {c.region} · {c.published ? "공개" : "비공개"}
            </summary>
            <ClinicForm c={c} />
          </details>
        ))}
      </section>
    </main>
  );
}
