'use strict';

/**
 * invoice service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::invoice.invoice');
