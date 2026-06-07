import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold">অ্যাডমিন পৃষ্ঠা পাওয়া যায়নি</h1>
      <Link href="/admin" className="mt-4 text-primary hover:underline">ড্যাশবোর্ডে ফিরুন</Link>
    </div>
  );
}
