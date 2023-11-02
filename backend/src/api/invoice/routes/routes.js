module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/invoices-status/pending',
      handler: 'invoice.invoicesPending',
    },
    {
      method: 'GET',
      path: '/invoices-status/paid',
      handler: 'invoice.invoicesPaid',
    },
    {
      method: 'GET',
      path: '/invoices-status/total',
      handler: 'invoice.totalInvoices',
    },
  ]
}