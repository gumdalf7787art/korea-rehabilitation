import { siteUrl } from "../lib/site";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/member", "/admin", "/api/", "/search"],
    },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
