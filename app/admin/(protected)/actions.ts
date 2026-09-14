"use server";

import { redirect } from "next/navigation";
import { deleteCurrentSession, requireAdmin } from "@/lib/auth";

export async function logout() {
  await requireAdmin();
  await deleteCurrentSession();
  redirect("/admin/login");
}
