"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function logoutAction() {
  cookies().delete("jwt");
  redirect("/");
};

