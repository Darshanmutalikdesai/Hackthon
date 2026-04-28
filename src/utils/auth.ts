interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  role: string;
  name?: string;
}

export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload)) as JWTPayload;
    return decoded.sub || null;
  } catch {
    return null;
  }
}

export function decodeToken(): JWTPayload | null {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload)) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(): boolean {
  const payload = decodeToken();
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Validate row-level tenancy - ensure the user ID in the JWT
 * matches the requested resource user ID
 */
export function validateTenancy(requestedUserId: string): boolean {
  const authenticatedUserId = getUserIdFromToken();
  if (!authenticatedUserId) return false;

  // Row-level tenancy: JWT sub must match requested userId
  const isTenantMatch = authenticatedUserId === requestedUserId;
  
  if (!isTenantMatch) {
    console.warn(
      `[Tenancy Violation] User ${authenticatedUserId} attempted to access data for user ${requestedUserId}`
    );
  }

  return isTenantMatch;
}