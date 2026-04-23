export const COMPANY_DOMAIN = "@rebus.ae";

export function validateCompanyEmail(email: string) {
  const isValid = email.toLowerCase().endsWith(COMPANY_DOMAIN);
  if (!isValid) {
    throw new Error(`Access denied. You must use a ${COMPANY_DOMAIN} email.`);
  }
  return email;
}