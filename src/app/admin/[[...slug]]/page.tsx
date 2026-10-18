import type { Metadata } from "next";
import { AdminRoot } from "@/components/admin/admin-root";

export const dynamic = "force-dynamic";

/* پنل مدیریت — در robots.txt بلاک است و ایندکس نمی‌شود */
export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminRoot />;
}
