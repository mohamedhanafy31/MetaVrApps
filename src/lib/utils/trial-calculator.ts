export type TrialType = 'count' | 'time' | 'unlimited';

export interface TrialConfig {
  type: TrialType;
  limit: number | null;
  used: number;
  startDate: Date;
  endDate: Date | null;
}

export interface TrialProgress {
  percentage: number;
  remaining: number;
  status: 'active' | 'expired' | 'unlimited';
  color: 'green' | 'yellow' | 'red';
}

export function calculateTrialProgress(trial: TrialConfig): TrialProgress {
  const now = new Date();
  
  // Handle unlimited trials
  if (trial.type === 'unlimited') {
    return {
      percentage: 100,
      remaining: Infinity,
      status: 'unlimited',
      color: 'green',
    };
  }
  
  // Handle time-based trials
  if (trial.type === 'time' && trial.endDate) {
    const totalDuration = trial.endDate.getTime() - trial.startDate.getTime();
    const elapsed = now.getTime() - trial.startDate.getTime();
    const remaining = Math.max(0, trial.endDate.getTime() - now.getTime());
    
    if (remaining === 0) {
      return {
        percentage: 100,
        remaining: 0,
        status: 'expired',
        color: 'red',
      };
    }
    
    const percentage = Math.min(100, (elapsed / totalDuration) * 100);
    
    return {
      percentage,
      remaining: Math.ceil(remaining / (1000 * 60 * 60 * 24)), // days
      status: 'active',
      color: getProgressColor(percentage),
    };
  }
  
  // Handle count-based trials
  if (trial.type === 'count' && trial.limit) {
    const percentage = (trial.used / trial.limit) * 100;
    const remaining = Math.max(0, trial.limit - trial.used);
    
    if (remaining === 0) {
      return {
        percentage: 100,
        remaining: 0,
        status: 'expired',
        color: 'red',
      };
    }
    
    return {
      percentage,
      remaining,
      status: 'active',
      color: getProgressColor(percentage),
    };
  }
  
  // Fallback
  return {
    percentage: 0,
    remaining: 0,
    status: 'expired',
    color: 'red',
  };
}

function getProgressColor(percentage: number): 'green' | 'yellow' | 'red' {
  if (percentage > 50) return 'green';
  if (percentage > 10) return 'yellow';
  return 'red';
}

export function createTrialConfig(
  type: TrialType,
  limit: number | null,
  startDate: Date = new Date()
): TrialConfig {
  let endDate: Date | null = null;
  
  if (type === 'time' && limit) {
    endDate = new Date(startDate.getTime() + limit * 24 * 60 * 60 * 1000);
  }
  
  return {
    type,
    limit,
    used: 0,
    startDate,
    endDate,
  };
}

export function isTrialExpired(trial: TrialConfig): boolean {
  const now = new Date();
  
  if (trial.type === 'unlimited') return false;
  
  if (trial.type === 'time' && trial.endDate) {
    return now > trial.endDate;
  }
  
  if (trial.type === 'count' && trial.limit) {
    return trial.used >= trial.limit;
  }
  
  return true;
}

export function getTrialStatusText(trial: TrialConfig): string {
  const progress = calculateTrialProgress(trial);
  
  if (trial.type === 'unlimited') {
    return 'Unlimited Access';
  }
  
  if (progress.status === 'expired') {
    return 'Expired';
  }
  
  if (trial.type === 'time') {
    return `${progress.remaining} days remaining`;
  }
  
  if (trial.type === 'count') {
    return `${progress.remaining} sessions remaining`;
  }
  
  return 'Unknown';
}

export function formatTrialType(type: TrialType): string {
  switch (type) {
    case 'count':
      return 'Session-based';
    case 'time':
      return 'Time-based';
    case 'unlimited':
      return 'Unlimited';
    default:
      return 'Unknown';
  }
}

export function getTrialColorClass(color: 'green' | 'yellow' | 'red'): string {
  switch (color) {
    case 'green':
      return 'text-success bg-success/10';
    case 'yellow':
      return 'text-warning bg-warning/10';
    case 'red':
      return 'text-error bg-error/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
}
