import type { NormalizedActivity } from '../domain/activity.types.js';

export interface UpsertActivityResult {
  readonly inserted: number;
  readonly updated: number;
  readonly unchanged: number;
}

export interface ActivityRepositoryPort {
  upsertMany(
    tenantId: string,
    activities: readonly NormalizedActivity[],
  ): Promise<UpsertActivityResult>;
}
