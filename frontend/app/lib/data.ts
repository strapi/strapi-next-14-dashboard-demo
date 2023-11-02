import { unstable_noStore as noStore } from "next/cache";
import qs from "qs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { flattenAttributes } from "@/app/lib/utils";
import { formatCurrency } from "./utils";

const STRAPI_URL = process.env.STRAPI_URL;

export async function fetchRevenue() {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const query = qs.stringify({
      sort: ["date:asc"],
      pagination: {
        pageSize: 12,
        page: 1,
      },
    });
    const response = await fetch(STRAPI_URL + "/api/revenues?" + query, {
      headers: { Authorization: "Bearer " + authToken },
      cache: "no-store",
    });
    const data = await response.json();
    const revenue = flattenAttributes(data.data);
    return revenue;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  const query = qs.stringify({
    sort: ["date:asc"],
    populate: {
      customer: {
        populate: {
          image: {
            fields: ["url"],
          },
        },
      },
    },
    pagination: {
      pageSize: 5,
      page: 1,
    },
  });

  try {
    const response = await fetch(STRAPI_URL + "/api/invoices?" + query, {
      headers: { Authorization: "Bearer " + authToken },
      cache: "no-store",
    });
    const data = await response.json();
    const flattened = flattenAttributes(data.data);

    const latestInvoices = flattened.map((invoice: any) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  noStore();

  try {
    const totalPendingInvoicesPromise = await fetch(
      STRAPI_URL + "/api/invoices-status/pending",
      {
        headers: { Authorization: "Bearer " + authToken },
      }
    );
    const totalPaidInvoicesPromise = await fetch(
      STRAPI_URL + "/api/invoices-status/paid",
      {
        headers: { Authorization: "Bearer " + authToken },
      }
    );
    const numberOfCustomerPromise = await fetch(
      STRAPI_URL + "/api/total-customers",
      {
        headers: { Authorization: "Bearer " + authToken },
      }
    );
    const numberOfInvoicesPromise = await fetch(
      STRAPI_URL + "/api/invoices-status/total",
      {
        headers: { Authorization: "Bearer " + authToken },
      }
    );

    const data = await Promise.all([
      numberOfInvoicesPromise.json(),
      numberOfCustomerPromise.json(),
      totalPendingInvoicesPromise.json(),
      totalPaidInvoicesPromise.json(),
    ]);

    const numberOfInvoices = Number(data[0].data.count || 0);
    const numberOfCustomers = Number(data[1].data.count || 0);
    const totalPendingInvoices = formatCurrency(data[2].data.totalOwed);
    const totalPaidInvoices = formatCurrency(data[3].data.totalPaid);

    console.log(totalPaidInvoices, totalPendingInvoices);
    return {
      numberOfInvoices,
      numberOfCustomers,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to load card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  noStore();

  const queryObject = qs.stringify({
    sort: ["date:asc"],
    populate: {
      customer: {
        populate: {
          image: {
            fields: ["url"],
          },
        },
      },
    },

    pagination: {
      pageSize: ITEMS_PER_PAGE,
      page: currentPage,
    },
    filters: {
      $or: [
        {
          status: {
            $contains: query,
          },
        },
        {
          amount: {
            $contains: query,
          },
        },
        {
          customer: {
            name: {
              $contains: query,
            },
          },
        },
        {
          customer: {
            email: {
              $contains: query,
            },
          },
        },
      ],
    },
  });

  try {
    const response = await fetch(STRAPI_URL + "/api/invoices?" + queryObject, {
      headers: { Authorization: "Bearer " + authToken },
    });
    const data = await response.json();
    const flattened = flattenAttributes(data.data);
    return { data: flattened, meta: data.meta };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchCustomers() {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  const query = qs.stringify({
    populate: {
      fields: ["id", "name"],
    },
  });
  try {
    const data = await fetch(STRAPI_URL + "/api/customers?" + query, {
      headers: { Authorization: "Bearer " + authToken },
    });
    const customers = await data.json();
    const flatten = flattenAttributes(customers.data);
    return flatten;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchInvoiceById(id: string) {
  const authToken = cookies().get("jwt")?.value;
  if (!authToken) return redirect("/login");

  const query = qs.stringify({
    populate: {
      customer: {
        populate: {
          image: {
            fields: ["url"],
          },
        },
      },
    },
  });

  try {
    const data = await fetch(STRAPI_URL + "/api/invoices/" + id + "?" + query, {
      headers: { Authorization: "Bearer " + authToken },
    });
    const invoice = await data.json();
    const flatten = flattenAttributes(invoice.data);
    return flatten;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}
