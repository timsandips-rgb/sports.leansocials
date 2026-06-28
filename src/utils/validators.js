export const USERNAME_REGEX = /^[a-z]{2,}[._][a-z]{2,}$/;
export const COMMUNITY_CODE_REGEX = /^[A-Z0-9]{3,}-[A-Z0-9]{2,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_REGEX = /^\+?[\d\s\-()]{8,15}$/;

export function validateUsername(username) {
  if (!username) return 'Username is required';
  if (!USERNAME_REGEX.test(username)) {
    return 'Username must be lowercase letters separated by one dot or underscore (e.g., ram.ti, john_doe)';
  }
  return null;
}

export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

export function validateCommunityCode(code) {
  if (!code) return 'Community code is required';
  if (!COMMUNITY_CODE_REGEX.test(code)) {
    return 'Community code format: UPPERCASE-UPPERCASE (e.g., WC2026-OFFICE)';
  }
  return null;
}

export function validateMobile(mobile) {
  if (!mobile) return 'Mobile number is required';
  if (!MOBILE_REGEX.test(mobile)) return 'Invalid mobile number';
  return null;
}
