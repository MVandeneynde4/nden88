"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reinitialiserDb } from "@/lib/db";

export async function reinitialiserDonnees(): Promise<void> {
  await reinitialiserDb();
  revalidatePath("/", "layout");
  redirect("/");
}
