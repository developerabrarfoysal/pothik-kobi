import { getAllMedia } from "@/lib/actions/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function AdminMediaPage() {
  const media = await getAllMedia();
  return <MediaLibrary initialMedia={media} />;
}
