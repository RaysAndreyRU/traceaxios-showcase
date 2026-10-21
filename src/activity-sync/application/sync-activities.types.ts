import type { ActivityProvider } from '../domain/activity.types.js';

export interface SyncActivitiesCommand {
  readonly tenantId: string;
  readonly connectionId: string;
  readonly provider: ActivityProvider;
  readonly from: Date;
  readonly to: Date;
}

export interface SyncActivitiesResult {
  readonly provider: ActivityProvider;
  readonly fetched: number;
  readonly accepted: number;
  readonly duplicates: number;
  readonly inserted: number;
  readonly updated: number;
  readonly unchanged: number;
}
