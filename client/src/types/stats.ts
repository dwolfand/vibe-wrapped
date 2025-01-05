export interface MonthlyCount {
  month: string;
  count: number;
}

export interface LocationStats {
  name: string;
  count: number;
  percentage: number;
}

export interface ClassmateStats {
  firstName: string;
  lastName: string;
  sharedClasses: number;
}

export interface PeerStats {
  averageClassesPerMonth: number;
  averageEarlyBirdScore: number;
  averageLateBookings: number;
  averageCancellations: number;
  topClassmates: ClassmateStats[];
  percentiles: {
    totalClasses: number;
    earlyBirdScore: number;
    classesPerMonth: number;
    lateBookings: number;
    cancellations: number;
    perfectWeeks: number;
  };
}

export interface GlobalStats {
  totalMembers: number;
  totalClasses: number;
  averageClassesPerMember: number;
  mostPopularTimeSlot: string;
  mostPopularDay: string;
  mostPopularCoach: string;
  averageEarlyBirdScore: number;
}

export interface WorkoutStats {
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  firstSeen: string;
  lastUpdated: string;
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
  earlyBirdScore: number;
  topThreeTimeSlots: string[];
  classesPerMonth: MonthlyCount[];
  favoriteLocation: LocationStats;
  locationBreakdown: LocationStats[];
  peerComparison: PeerStats;
  globalStats: GlobalStats;
  perfectMadWeeks: number;
  durabilityClasses: number;
  anaerobicClasses: number;
  momentumClasses: number;
  deloadClasses: number;
}
