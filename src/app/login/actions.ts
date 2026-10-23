"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout } from "@/lib/demo-auth/server";

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(64),
  password: z.string().min(1).max(200),
});

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?fehler=1");

  const result = await login(parsed.data.username, parsed.data.password);
  if (!result.ok) {
    redirect(
      result.waitMs > 0 ? `/login?warten=${Math.ceil(result.waitMs / 1000)}` : "/login?fehler=1",
    );
  }
  redirect(result.role === "admin" ? "/admin" : "/bereich");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}
