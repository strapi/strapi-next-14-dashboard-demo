"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email().min(2).max(50),
  password: z.string().min(6).max(100),
});

export async function registerAction(prevState: any, formData: any) {
  const STRAPI_URL = process.env.STRAPI_URL;
  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");
  const url = `${STRAPI_URL}/api/auth/local/register`;

  const validatedFields = formSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Login.",
    };
  }

  const { username, email, password } = validatedFields.data;

  try {
    const response: any = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
      cache: "no-cache",
    });

    const data = await response.json();
    if (!response.ok && data.error)
      return { ...prevState, message: data.error.message, errors: null };
    if (response.ok && data.jwt) cookies().set("jwt", data.jwt);
  } catch (error) {
    console.log(error);
    return { error: "Server error please try again later." };
  }
  redirect("/dashboard");
}
