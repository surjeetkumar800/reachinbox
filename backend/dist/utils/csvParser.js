"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCSVEmails = void 0;
const csv_parse_1 = require("csv-parse");
/**
 * Parse CSV buffer and extract valid email addresses
 */
const parseCSVEmails = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const emails = new Set();
        (0, csv_parse_1.parse)(fileBuffer, {
            columns: false,
            skip_empty_lines: true,
            trim: true,
        }, (err, records) => {
            if (err) {
                return reject(err);
            }
            for (const row of records) {
                for (const value of row) {
                    const email = String(value).toLowerCase().trim();
                    if (isValidEmail(email)) {
                        emails.add(email);
                    }
                }
            }
            resolve(Array.from(emails));
        });
    });
};
exports.parseCSVEmails = parseCSVEmails;
/**
 * Simple email validation
 */
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
