"use server";

import { redirect } from "next/navigation";
import { clearOwnerSession, createOwnerSession, validateOwnerAccessCode } from "@/lib/auth";

export async function signInAction(formData: FormData) {
  const passcode = formData.get("passcode");

  if (typeof passcode !== "string" || !validateOwnerAccessCode(passcode.trim())) {
    redirect("/owner-access?error=invalid");
  }

  await createOwnerSession();
  redirect("/admin");
}

export async function signOutAction() {
  await clearOwnerSession();
  redirect("/");
}