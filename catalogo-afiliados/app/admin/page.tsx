import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import CatalogEditor from "./CatalogEditor";

export default async function AdminPage() {
  if (!await isAdmin()) redirect("/admin/login");
  return <CatalogEditor />;
}
