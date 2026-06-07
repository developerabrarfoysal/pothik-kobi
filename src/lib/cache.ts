import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  siteSettings: "site-settings",
  navigation: "navigation",
  pages: "pages",
  homepage: "homepage",
  writings: "writings",
  categories: "categories",
  gallery: "gallery",
  media: "media",
} as const;

export function revalidatePublicContent(options?: {
  pages?: boolean;
  writings?: boolean;
  homepage?: boolean;
  settings?: boolean;
  navigation?: boolean;
  gallery?: boolean;
  slug?: string;
  writingSlug?: string;
}) {
  const opts = options ?? { pages: true, writings: true, homepage: true, settings: true };

  if (opts.settings) revalidateTag(CACHE_TAGS.siteSettings, "max");
  if (opts.navigation) revalidateTag(CACHE_TAGS.navigation, "max");
  if (opts.pages) revalidateTag(CACHE_TAGS.pages, "max");
  if (opts.homepage) revalidateTag(CACHE_TAGS.homepage, "max");
  if (opts.writings) revalidateTag(CACHE_TAGS.writings, "max");
  if (opts.gallery) revalidateTag(CACHE_TAGS.gallery, "max");

  revalidatePath("/", "layout");
  revalidatePath("/writings");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/sitemap.xml");

  if (opts.slug) revalidatePath(`/${opts.slug}`);
  if (opts.writingSlug) revalidatePath(`/writings/${opts.writingSlug}`);
}
