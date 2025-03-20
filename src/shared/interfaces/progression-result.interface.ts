/**
 * Interfaz para resultados de progresión del usuario
 * Utilizada cuando el usuario gana XP y monedas
 */
export interface ProgressionResult {
  /**
   * Cantidad de XP ganada en esta acción
   */
  xpGained: number;

  /**
   * Cantidad de monedas ganadas en esta acción
   */
  coinsGained: number;

  /**
   * XP actual después de la acción
   */
  currentXp: number;

  /**
   * XP necesaria para el siguiente nivel
   */
  xpToNextLevel: number;

  /**
   * Nivel actual del usuario
   */
  currentLevel: number;

  /**
   * Indica si el usuario subió de nivel con esta acción
   */
  leveledUp: boolean;
}
