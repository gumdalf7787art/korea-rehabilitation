import "./portal.css";
export const dynamic = "force-dynamic";
export const metadata = {
  robots: { index: false, follow: false },
  title: "회원 서비스",
};
export default function MemberLayout({ children }) {
  return children;
}
