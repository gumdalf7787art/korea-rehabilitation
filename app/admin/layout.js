import "../member/portal.css";
import { requireStaff } from "../../lib/portal";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  title: "사무국 관리",
};
export default async function AdminLayout({ children }) {
  await requireStaff();
  return children;
}
