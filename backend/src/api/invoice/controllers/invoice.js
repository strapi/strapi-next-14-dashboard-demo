"use strict";

/**
 * invoice controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::invoice.invoice", ({ strapi }) => ({
  async invoicesPending(ctx) {
    try {
      const count = await strapi.db.query("api::invoice.invoice").count({
        where: { status: "pending" },
      });

      const total = await strapi.db
        .connection("invoices")
        .where({ status: "pending" })
        .sum("amount as totalOwed");
        return { data: { count, totalOwed: total[0].totalOwed } };
    } catch (err) {
      console.log(err);
    }
  },
  async invoicesPaid(ctx) {
    try {
      const count = await strapi.db.query("api::invoice.invoice").count({
        where: { status: "paid" },
      });

      const total = await strapi.db
        .connection("invoices")
        .where({ status: "paid" })
        .sum("amount as totalPaid");

        return { data: { count, totalPaid: total[0].totalPaid } };

    } catch (err) {
      console.log(err);
    }
  },
  async totalInvoices(ctx) {
    try {
      const count = await strapi.db.query("api::invoice.invoice").count();
      console.log(count, "count");
      const total = await strapi.db
        .connection("invoices")
        .sum("amount as total");
      return { data: { count, total: total[0].total } };
    } catch (err) {
      console.log(err);
    }
  },
}));
