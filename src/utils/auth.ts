export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || null;
  } catch {
    return null;
  }
}