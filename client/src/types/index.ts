export interface UserInfo {
  name: string;
  memberSince: string | null;
  avatar?: string;
}

export interface WorkoutStats {
  totalClasses: number;
  topCoach: string;
  favoriteTrainerClassCount: number;
  favoriteClasses: Array<{
    class_name: string;
    count: number;
    percentage: number;
  }>;
  favoriteTimeOfDay: string;
  totalCancellations: number;
  totalNoShows: number;
  mostFrequentDay: string;
  longestStreak: number;
  totalLateBookings: number;
  earlyBirdScore: number; // Percentage of early morning classes
  topThreeTimeSlots: string[];
  classesPerMonth: { month: string; count: number }[];
  favoriteLocation: {
    name: string;
    percentage: number;
  };
}

export interface AnimationState {
  currentSlide: number;
  isTransitioning: boolean;
  hasSeenIntro: boolean;
}
