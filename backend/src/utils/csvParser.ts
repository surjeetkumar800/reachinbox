import { parse } from "csv-parse";

/**
 * Parse CSV buffer and extract valid email addresses
 */
export const parseCSVEmails = (fileBuffer: Buffer): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const emails = new Set<string>();

    parse(
      fileBuffer,
      {
        columns: false,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records: string[][]) => {
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
      },
    );
  });
};

/**
 * Simple email validation
 */
const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
