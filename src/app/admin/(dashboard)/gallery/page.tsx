import { getAdminGallery } from "@/lib/actions/admin";
import { GalleryManager } from "@/components/admin/GalleryManager";

export default async function AdminGalleryPage() {
  const albums = await getAdminGallery();
  return <GalleryManager initial={albums} />;
}
