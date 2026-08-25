/**
 * MVP admin authentication credentials.
 *
 * ⚠️ This is client-side auth only — fine as a prototype gate, but NOT a
 * real security boundary. Anyone with access to the source can read these.
 * Replace with a proper backend/SSO before going live.
 *
 * To change the credentials, edit the two values below.
 */
export const AUTH = {
  userId: "abc123",
  password: "qwerty12345",
} as const;
