import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-primary">৪০৪</p>
      <h1 className="mt-4 font-serif text-4xl font-bold">পৃষ্ঠা পাওয়া যায়নি</h1>
      <p className="mt-4 max-w-md text-muted">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা নেই বা সরিয়ে ফেলা হয়েছে।
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-primary px-6 py-3 text-white hover:bg-primary/90">
          হোমে ফিরুন
        </Link>
        <Link href="/writings" className="rounded-full border px-6 py-3 hover:bg-primary/5">
          লেখালেখি
        </Link>
      </div>
    </div>
  );
}
