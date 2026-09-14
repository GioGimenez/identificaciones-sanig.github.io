import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL ?? "http://localhost:3000";
  const posts = await getPublishedPosts();

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: baseUrl + "/blog",
      lastModified: new Date(),
    },
    ...posts.map((post) => ({
      url: baseUrl + "/blog/" + post.slug,
      lastModified: new Date(post.updatedAt || post.createdAt),
    })),
  ];
}
