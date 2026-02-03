"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if employee exists, if not create one
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let redirectPath = "/dashboard";

  if (user) {
    let employee = await prisma.employee.findUnique({
      where: { userId: user.id },
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          userId: user.id,
          email: user.email!,
          name:
            user.user_metadata?.name || user.email?.split("@")[0] || "Employee",
        },
      });
    }

    // Set redirect path based on role
    if (employee.role === "ADMIN") {
      redirectPath = "/admin";
    }
  }

  // Return success with redirect path
  return { success: true, redirectPath };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
