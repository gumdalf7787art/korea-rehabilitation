import "server-only";
import { cache } from "react";
import { currentMember, portalEnv, qualified } from "./portal";

const paths = {
  notices: "/news/notices",
  insurance: "/insurance/notices",
  archive: "/education/archive",
};

const mayReadLegacyBoards = cache(async () => {
  const { LEGACY_BOARD_TEST_PUBLIC } = await portalEnv();
  return LEGACY_BOARD_TEST_PUBLIC === "1" || qualified(await currentMember());
});

function toPage(row) {
  const attachments = JSON.parse(row.attachments);
  const images = attachments.flatMap(({label, href}) => {
    if (label !== "원본 이미지") return [];
    const url = new URL(href);
    if (!["rm.or.kr", "www.rm.or.kr"].includes(url.hostname) ||
        !/\.(?:jpe?g|png|gif|webp|avif)$/i.test(url.pathname)) return [];
    url.protocol = "https:";
    return [url.href];
  });
  const attachmentNames = new Set(attachments.filter(({href}) =>
    new URL(href).searchParams.get("a") === "download"
  ).map(({label}) => label));
  const lines = row.body.split("\n\n").filter(Boolean);
  const paragraphs = lines.filter((line, i) =>
    !attachmentNames.has(line) &&
    !(attachmentNames.has(lines[i - 1]) && /^\([\d.,]+\s*(?:B|KB|MB|GB)\)$/i.test(line))
  );
  return {
    path: paths[row.board] + "/legacy-" + row.uid,
    title: row.title,
    description: "기존 홈페이지에서 이관한 게시물입니다.",
    date: row.date,
    author: row.author,
    views: row.views,
    paragraphs,
    images: [...new Set(images)],
    source: row.source_url,
    membersOnly: true,
  };
}

export async function listLegacyBoard(board) {
  if (!Object.hasOwn(paths, board) || !await mayReadLegacyBoards()) return [];
  const { DB } = await portalEnv();
  const { results } = await DB.prepare(
    "SELECT * FROM legacy_board_posts WHERE board=? ORDER BY date DESC, CAST(uid AS INTEGER) DESC",
  ).bind(board).all();
  return results.map(toPage);
}

export async function findLegacyPost(path) {
  const match = path.match(/^(.*)\/legacy-(\d+)$/);
  if (!match) return null;
  const board = Object.keys(paths).find(key => paths[key] === match[1]);
  if (!board) return null;
  if (!await mayReadLegacyBoards()) {
    return {
      path, title: "정회원 전용 게시물", description: "승인된 정회원으로 로그인하면 열람할 수 있습니다.",
      membersOnly: true, links: [{href: "/member/login", label: "회원 로그인"}],
    };
  }
  const { DB } = await portalEnv();
  const row = await DB.prepare("SELECT * FROM legacy_board_posts WHERE board=? AND uid=?")
    .bind(board, match[2]).first();
  return row ? toPage(row) : null;
}
