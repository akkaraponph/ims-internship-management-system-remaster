/**
 * Generate a secure random invite code
 * Format: 8-12 alphanumeric characters
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding confusing characters like 0, O, I, 1
  const length = 10;
  let code = "";
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}
