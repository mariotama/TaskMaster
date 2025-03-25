/**
 * Interface for progression results
 * When user gains XP and coins
 */
export interface ProgressionResult {
  xpGained: number;
  coinsGained: number;
  currentXp: number;
  xpToNextLevel: number;
  currentLevel: number;
  leveledUp: boolean; //the user leveled up?
  unlockedAchievements: {
    id: number;
    name: string;
    description: string;
    icon: string;
  }[];
}
