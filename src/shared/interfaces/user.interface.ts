/**
 * Interface for payload of JWT token
 */
export interface JwtPayload {
  sub: number; // Id del usuario
  email: string;
  iat?: number; // Issued at (fecha de emisión)
  exp?: number; // Expiration time (fecha de expiración)
}

/**
 * Interfeace to represent actual user on requests
 * Uses with the decorator @CurrentUser
 */
export interface CurrentUserInfo {
  id: number;
  email: string;
  username: string;
  level: number;
}
