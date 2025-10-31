const ADMIN_EMAILS = new Set<string>([
  'admin@repmotivatedseller.org',
]);

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.has(email.toLowerCase());
};

export const getAdminEmails = (): string[] => Array.from(ADMIN_EMAILS);
