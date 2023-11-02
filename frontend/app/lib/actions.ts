"use server";
const STRAPI_URL = process.env.STRAPI_URL;
import { cookies } from "next/headers";

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
export async function createInvoice(prevState: State, formData: FormData) {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) throw new Error("Not Authorized.");

  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  const dataToSend = {
    data: {
      amount: amountInCents,
      status,
      date,
      customer: {
        connect: [{ id: customerId }],
      },
    },
  };

  try {
    const response = await fetch(STRAPI_URL + "/api/invoices", {
      method: "POST",
      body: JSON.stringify(dataToSend),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    });
    const data = await response.json();
    if (!response.ok)
      return { ok: false, error: data.error.message, data: null };
    if (response.ok && data.error)
      return { ok: false, error: data.error.message, data: null };
  } catch (err) {
    return { error: "Database Error: Failed to Create Invoice." };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

const UpdateInvoice = InvoiceSchema.omit({ date: true });
export async function updateInvoice(formData: FormData) {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) throw new Error("Not Authorized.");

  const { customerId, amount, status, id } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    invoiceId: formData.get("invoiceId"),
    id: formData.get("id"),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  const dataToSend = {
    data: {
      amount: amountInCents,
      status,
      date,
      customer: {
        connect: [{ id: customerId }],
      },
    },
  };

  try {
    const response = await fetch(STRAPI_URL + "/api/invoices/" + id, {
      method: "PUT",
      body: JSON.stringify(dataToSend),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + authToken,
      },
    });
    const data = await response.json();
    if (!response.ok)
      return { ok: false, error: data.error.message, data: null };
    if (response.ok && data.error)
      return { ok: false, error: data.error.message, data: null };
  } catch (err) {
    return { error: "Database Error: Failed to Update Invoice." };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) throw new Error("Not Authorized.");

  try {
    const response = await fetch(STRAPI_URL + "/api/invoices/" + id, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + authToken,
      },
    });
    const data = await response.json();
    if (!response.ok)
      return { ok: false, error: data.error.message, data: null };
    if (response.ok && data.error)
      return { ok: false, error: data.error.message, data: null };
  } catch (err) {
    return { error: "Database Error: Failed to Delete Invoice." };
  }
  revalidatePath("/dashboard/invoices");
}
