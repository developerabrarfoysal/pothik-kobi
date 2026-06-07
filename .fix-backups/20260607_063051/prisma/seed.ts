import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "বিদ্রোহী", slug: "bidrohi", color: "#F42A41" },
  { name: "শিক্ষা মূলক", slug: "shikkha-mulok", color: "#0066CC" },
  { name: "প্রেম-বিরহ", slug: "prem-biroh", color: "#9333EA" },
  { name: "দেশের তরে", slug: "desher-tore", color: "#006A4E" },
  { name: "সংস্কার", slug: "songsar", color: "#D97706" },
  { name: "বিশেষ বিষয়", slug: "bishesh-bishoy", color: "#0891B2" },
  { name: "ধর্ম নিয়ে", slug: "dhormo-niye", color: "#4F46E5" },
  { name: "বিবিধ", slug: "bibidho", color: "#6B7280" },
];

const sampleWritings = [
  {
    title: "পথিকের গান",
    slug: "pothiker-gan",
    excerpt: "যে পথ দিয়ে হেঁটে যাই, সেই পথেই লেখা থাকে...",
    content: "<p>যে পথ দিয়ে হেঁটে যাই,<br>সেই পথেই লেখা থাকে।<br>আলো আর অন্ধকারের মাঝে<br>কবিতা জেগে ওঠে রাতে।</p><p>পথিক কবি নামে ডাকে যারা,<br>হৃদয়ে বহন করে দেশের কথা।<br>লাল-সবুজের স্বপ্নে ডুবে<br>লেখে যায় নতুন ইতিহাস।</p>",
    categorySlug: "bidrohi",
  },
  {
    title: "মায়ের স্মৃতি",
    slug: "mayer-smriti",
    excerpt: "মায়ের হাতের স্পর্শ এখনও অনুভব করি...",
    content: "<p>মায়ের হাতের স্পর্শ এখনও<br>অনুভব করি স্নেহের বাতাসে।<br>তাঁর কথা, তাঁর হাসি<br>আমার কবিতায় বেঁচে আছে।</p>",
    categorySlug: "prem-biroh",
  },
  {
    title: "বাংলার মাটি",
    slug: "banglar-mati",
    excerpt: "এই মাটি আমার, এই জল আমার...",
    content: "<p>এই মাটি আমার, এই জল আমার,<br>পদ্মা-মেঘনা বয়ে চলে কত গান।<br>সবুজ ধানের ক্ষেত, লাল কৃষ্ণচূড়া<br>বাংলার সৌন্দর্য অসীম, অপার।</p>",
    categorySlug: "desher-tore",
  },
];

async function main() {
  console.log("🌱 Seeding Pothik Kobi database...");

  const email = process.env.SEED_ADMIN_EMAIL || "admin@pathikkobi.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.SEED_ADMIN_NAME || "Muzahid Prince";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  await prisma.siteSetting.upsert({
    where: { key: "global" },
    update: {},
    create: {
      key: "global",
      value: {
        siteName: "পথিক কবি",
        siteTagline: "মুজাহিদ প্রিন্স — কবিতা, গল্প ও সাহিত্য",
        writerName: "মুজাহিদ প্রিন্স",
        writerBio: "বাংলাদেশের একজন কবি ও লেখক। বিদ্রোহী ভাবনা, প্রেম-বিরহ, দেশপ্রেম ও মানবতার কথা তাঁর কবিতায় সজীব। পথিক কবি নামে পরিচিত এই লেখক বাংলা সাহিত্যে নতুন দিগন্ত উন্মোচনের স্বপ্ন দেখেন।",
        primaryColor: "#006A4E",
        secondaryColor: "#F42A41",
        accentColor: "#0066CC",
        contactEmail: "contact@pathikkobi.com",
        contactAddress: "বাংলাদেশ",
        socialLinks: [
          { platform: "facebook", url: "https://facebook.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
        footerText: "© পথিক কবি — সকল স্বত্ব সংরক্ষিত",
      },
    },
  });

  const navItems = [
    { label: "হোম", href: "/" },
    { label: "লেখালেখি", href: "/writings" },
    { label: "আমার সম্পর্কে", href: "/about" },
    { label: "যোগাযোগ", href: "/contact" },
  ];

  await prisma.navigationItem.deleteMany({});
  for (let i = 0; i < navItems.length; i++) {
    await prisma.navigationItem.create({ data: { ...navItems[i], sortOrder: i } });
  }

  const createdCategories: Record<string, string> = {};
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.writingCategory.upsert({
      where: { slug: categories[i].slug },
      update: { name: categories[i].name, color: categories[i].color, sortOrder: i },
      create: { ...categories[i], sortOrder: i },
    });
    createdCategories[cat.slug] = cat.id;
  }

  // Homepage
  const homepage = await prisma.page.upsert({
    where: { slug: "home" },
    update: { isHomepage: true, status: "PUBLISHED" },
    create: {
      title: "হোম",
      slug: "home",
      isHomepage: true,
      status: "PUBLISHED",
      excerpt: "পথিক কবি — মুজাহিদ প্রিন্সের সাহিত্য জগৎ",
      hero: {
        create: {
          title: "পথিক কবি",
          subtitle: "মুজাহিদ প্রিন্স",
          description: "কবিতা, গল্প ও সাহিত্য — বাংলার হৃদয় থেকে",
        },
      },
      seoMeta: { create: { title: "পথিক কবি | মুজাহিদ প্রিন্স", description: "বাংলা কবিতা ও সাহিত্য" } },
    },
  });

  await prisma.pageSection.deleteMany({ where: { pageId: homepage.id } });
  const homepageSections = [
    { type: "QUOTE_BLOCK" as const, title: "উক্তি", sortOrder: 0, config: { quote: "লেখালেখি হলো হৃদয়ের কথা — যা শব্দে রূপ পায়", author: "মুজাহিদ প্রিন্স" } },
    { type: "FEATURED_WRITINGS" as const, title: "নির্বাচিত লেখা", sortOrder: 1, config: { limit: 3 } },
    { type: "CATEGORY_TABS" as const, title: "বিভাগ অনুযায়ী", sortOrder: 2, config: {} },
    { type: "ABOUT_WRITER" as const, title: null, sortOrder: 3, config: {} },
    { type: "LATEST_WRITINGS" as const, title: "সাম্প্রতিক লেখা", sortOrder: 4, config: { limit: 6 } },
    { type: "CTA_BLOCK" as const, title: null, sortOrder: 5, config: { heading: "আরও পড়ুন", text: "সমস্ত কবিতা ও গল্প এক জায়গায়", buttonText: "লেখালেখি দেখুন", buttonHref: "/writings" } },
  ];

  for (const section of homepageSections) {
    await prisma.pageSection.create({ data: { pageId: homepage.id, ...section } });
  }

  // Other pages
  const otherPages = [
    { title: "লেখালেখি", slug: "writings", excerpt: "কবিতা ও সাহিত্য" },
    { title: "আমার সম্পর্কে", slug: "about", excerpt: "লেখক পরিচিতি" },
    { title: "যোগাযোগ", slug: "contact", excerpt: "যোগাযোগ করুন" },
  ];

  for (const p of otherPages) {
    const page = await prisma.page.upsert({
      where: { slug: p.slug },
      update: { status: "PUBLISHED" },
      create: {
        ...p,
        status: "PUBLISHED",
        hero: { create: { title: p.title, subtitle: "পথিক কবি" } },
        seoMeta: { create: {} },
      },
    });

    if (p.slug === "about") {
      await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
      await prisma.pageSection.create({
        data: { pageId: page.id, type: "ABOUT_WRITER", sortOrder: 0, config: {} },
      });
    }

    if (p.slug === "contact") {
      await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
      await prisma.pageSection.create({
        data: { pageId: page.id, type: "CONTACT_BLOCK", title: "যোগাযোগ করুন", sortOrder: 0, config: {} },
      });
    }
  }

  // Sample writings
  for (const w of sampleWritings) {
    await prisma.writing.upsert({
      where: { slug: w.slug },
      update: { status: "PUBLISHED", publishedAt: new Date() },
      create: {
        title: w.title,
        slug: w.slug,
        excerpt: w.excerpt,
        content: w.content,
        categoryId: createdCategories[w.categorySlug],
        status: "PUBLISHED",
        publishedAt: new Date(),
        readingTime: 2,
        seoMeta: { create: { title: `${w.title} | পথিক কবি`, description: w.excerpt } },
      },
    });
  }

  // Gallery album
  await prisma.galleryAlbum.upsert({
    where: { slug: "sahitto-chobi" },
    update: {},
    create: { title: "সাহিত্য ছবি", slug: "sahitto-chobi", description: "সাহিত্য সংক্রান্ত ছবি", isVisible: true },
  });

  console.log("✅ Seed completed!");
  console.log(`   Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
