import { MediaImage } from "@/components/shared/MediaImage";
import { getMediaById } from "@/lib/site-settings";
import type { SiteSettings } from "@/lib/validations";

type AboutWriterSectionProps = {
  settings: SiteSettings;
  config: Record<string, unknown>;
};

export async function AboutWriterSection({ settings, config }: AboutWriterSectionProps) {
  const photoId = (config.photoId as string) || settings.writerPhotoId;
  const photo = photoId ? await getMediaById(photoId) : null;
  const bio = (config.bio as string) || settings.writerBio;
  const name = (config.name as string) || settings.writerName;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-3xl shadow-2xl">
            {photo ? (
              <MediaImage media={photo} fill className="object-cover" sizes="400px" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 font-serif text-6xl text-primary/30">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-secondary">লেখক পরিচিতি</p>
            <h2 className="font-serif text-3xl font-bold md:text-4xl">{name}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">{bio}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
