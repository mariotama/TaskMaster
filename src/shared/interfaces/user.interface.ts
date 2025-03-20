/**
 * Interfaz para el payload del token JWT
 */
export interface JwtPayload {
  sub: number; // Id del usuario
  email: string;
  iat?: number; // Issued at (fecha de emisión)
  exp?: number; // Expiration time (fecha de expiración)
}

/**
 * Interfaz para representar usuario actual en requests
 * Utilizada con el decorador @CurrentUser()
 */
export interface CurrentUserInfo {
  id: number;
  email: string;
  username: string;
  level: number;
}
