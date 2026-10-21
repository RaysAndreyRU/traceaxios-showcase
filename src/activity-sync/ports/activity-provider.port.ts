import type {
  ActivityProvider,
  ExternalActivity,
} from '../domain/activity.types.js';

export interface FetchActivityInput {
  readonly tenantId: string;
  readonly connectionId: string;
  readonly from: Date;
  readonly to: Date;
}

export interface ActivityProviderPort {
  readonly provider: ActivityProvider;
  fetchActivity(input: FetchActivityInput): Promise<readonly ExternalActivity[]>;
}
