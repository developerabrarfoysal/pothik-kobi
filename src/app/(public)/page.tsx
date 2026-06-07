import { SectionRenderer } from "@/components/public/SectionRenderer";
import { getHomepage } from "@/lib/queries/public";

export default async function HomePage() {
  const page = await getHomepage();

  if (!page) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.4em] text-primary">
            পথিক কবি
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">পথিক কবি</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            মুজাহিদ প্রিন্সের আধুনিক বাংলা লেখালেখি ও সাহিত্যভিত্তিক পোর্টফোলিও।
          </p>
          <p className="mt-8 rounded-full border border-primary/20 px-5 py-2 text-sm text-muted">
            Admin panel থেকে homepage content seed বা publish করুন।
          </p>
        </section>
      </main>
    );
  }

  return <SectionRenderer sections={page.sections} />;
}
