
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const formSchema = z.object({
  identifier: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});

export async function loginAction(prevState: any, formData: any) {
  const STRAPI_URL = process.env.STRAPI_URL;
  if (!STRAPI_URL) throw new Error("Missing STRAPI_URL environment variable.");
  const url = `${STRAPI_URL}/api/auth/local`;

  const validatedFields = formSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Login.",
    };
  }

  const { identifier, password } = validatedFields.data;

  try {
    const response: any = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
      cache: "no-cache",
    });

    const data = await response.json();
    if (!response.ok && data.error) return { ...prevState, message: data.error.message, errors: null };
    if (response.ok && data.jwt) cookies().set("jwt", data.jwt);
  } catch (error) {
    console.log(error);
    return { error: "Server error please try again later." };
  }
  redirect("/dashboard");
}
