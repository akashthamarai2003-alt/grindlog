"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin_auth");
  const validPwd = process.env.ADMIN_PASSWORD || "admin";
  return !!authCookie && authCookie.value === validPwd;
}

export async function loginAdminAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPwd = process.env.ADMIN_PASSWORD || "admin";

  if (username === validUser && password === validPwd) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    redirect("/admin");
  }

  return { success: false, error: "Invalid username or password" };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  redirect("/admin-login");
}
