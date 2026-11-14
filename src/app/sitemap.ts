import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/results",
    "/group-results",
    "/institute-results",
    "/latest-results",
    "/cgpa-calculator",
    "/gpa-calculator",
    "/exam-routines",
    "/booklists",
    "/how-it-works",
    "/about",
    "/privacy-policy",
    "/terms",
    "/contact",
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date(), changeFrequency: p === "/latest-results" ? "daily" : "weekly", priority: p === "" ? 1 : 0.8 }));
}
