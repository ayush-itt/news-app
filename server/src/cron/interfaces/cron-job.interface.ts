export interface ICronJobResult {
  success: boolean;
  message: string;
  processedCount?: number;
  errors?: string[];
  duration?: number;
  timestamp: Date;
}

export interface ICronJobConfig {
  jobName: string;
  schedule: string;
  enabled: boolean;
}
