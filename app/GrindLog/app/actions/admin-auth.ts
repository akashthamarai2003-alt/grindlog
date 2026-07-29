"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
      path: "/admin",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    redirect("/admin");
  }

  return { success: false, error: "Invalid username or password" };
}
