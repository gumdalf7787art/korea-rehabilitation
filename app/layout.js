import Link from "next/link";
import { cookies } from "next/headers";
import Header from "./header";
import { description, siteName, siteUrl } from "../lib/site";
import "./globals.css";
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: "%s | " + siteName },
  description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName,
    title: siteName,
    description,
    images: ["/media/hero.webp"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};
const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": siteUrl + "/#organization",
  name: siteName,
  url: siteUrl,
  logo: siteUrl + "/brand/logo.svg",
  email: "kmreha@naver.com",
  telephone: "+82-1599-4897",
};
export default async function Layout({ children }) {
  const signedIn = (await cookies()).has("kpa_session");
  return (
    <html lang="ko">
      <body>
        <a className="skip" href="#content">
          본문으로 이동
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
          }}
        />
        <Header signedIn={signedIn} />
        <div id="content">{children}</div>
        <footer className="siteFooter">
          <div className="footerInner">
            <div>
              <Link href="/">
                <img width="180" src="/brand/logo.svg" alt={siteName} />
              </Link>
              <p>
                경기도 안양시 만안구 안양로 249, 302호
                <br />
                <a href="tel:15994897">1599-4897</a>　·　
                <a href="mailto:kmreha@naver.com">kmreha@naver.com</a>
              </p>
            </div>
            <div className="footNav">
              <Link href="/about/contact">사무국 안내</Link>
              <Link href="/support/membership">정회원 안내</Link>
              <Link href="/privacy">개인정보 처리방침</Link>
            </div>
          </div>
          <div className="copyright">© 대한재활의학과의사회</div>
        </footer>
      </body>
    </html>
  );
}
