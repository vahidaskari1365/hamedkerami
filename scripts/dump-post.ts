import { db } from "../src/lib/db";

async function main() {
  const slug = process.argv[2] ?? "jaw-surgery-cost-1405";
  const post = await db.blogPost.findUnique({ where: { slug } });
  if (!post) {
    console.error("NOT FOUND:", slug);
  } else {
    const all = await db.blogPost.findMany({ select: { slug: true } });
    console.log("ALL SLUGS:", JSON.stringify(all.map((a) => a.slug)));
    console.log("=== POST ===");
    console.log("title:", post.title);
    console.log("date:", post.date);
    console.log("cover:", post.cover);
    console.log("bodyLen:", post.body.length);
    console.log("=== BODY ===");
    console.log(post.body);
  }
  process.exit(0);
}
main();
