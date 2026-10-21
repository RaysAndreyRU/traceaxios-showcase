import { normalizeActivity } from '../domain/activity-normalizer.js';
import type { NormalizedActivity } from '../domain/activity.types.js';
import type { ActivityProviderPort } from '../ports/activity-provider.port.js';
import type { ActivityRepositoryPort } from '../ports/activity-repository.port.js';
import type {
  SyncActivitiesCommand,
  SyncActivitiesResult,
} from './sync-activities.types.js';

const MAX_SYNC_WINDOW_DAYS = 31;
const DAY_IN_MS = 24 * 60 * 60 * 1_000;

export class InvalidSyncWindowError extends Error {}
export class ProviderMismatchError extends Error {}

export class SyncActivitiesUseCase {
  constructor(
    private readonly provider: ActivityProviderPort,
    private readonly repository: ActivityRepositoryPort,
  ) {}

  async execute(command: SyncActivitiesCommand): Promise<SyncActivitiesResult> {
    this.assertCommand(command);

    const externalActivities = await this.provider.fetchActivity({
      tenantId: command.tenantId,
      connectionId: command.connectionId,
      from: command.from,
      to: command.to,
    });

    const normalized = externalActivities.map((activity) => {
      if (activity.provider !== command.provider) {
        throw new ProviderMismatchError(
          `Expected ${command.provider}, received ${activity.provider}`,
        );
      }

      return normalizeActivity(command.tenantId, activity);
    });

    const unique = this.removeDuplicates(normalized);
    const persistence = await this.repository.upsertMany(
      command.tenantId,
      unique,
    );

    return {
      provider: command.provider,
      fetched: externalActivities.length,
      accepted: unique.length,
      duplicates: normalized.length - unique.length,
      ...persistence,
    };
  }

  private assertCommand(command: SyncActivitiesCommand): void {
    const duration = command.to.getTime() - command.from.getTime();

    if (!command.tenantId.trim() || !command.connectionId.trim()) {
      throw new InvalidSyncWindowError('Tenant and connection are required');
    }

    if (
      Number.isNaN(duration) ||
      duration < 0 ||
      duration > MAX_SYNC_WINDOW_DAYS * DAY_IN_MS
    ) {
      throw new InvalidSyncWindowError(
        `Sync window must be between 0 and ${MAX_SYNC_WINDOW_DAYS} days`,
      );
    }

    if (command.provider !== this.provider.provider) {
      throw new ProviderMismatchError(
        `Adapter ${this.provider.provider} cannot handle ${command.provider}`,
      );
    }
  }

  private removeDuplicates(
    activities: readonly NormalizedActivity[],
  ): readonly NormalizedActivity[] {
    return [
      ...new Map(
        activities.map((activity) => [activity.idempotencyKey, activity]),
      ).values(),
    ];
  }
}
