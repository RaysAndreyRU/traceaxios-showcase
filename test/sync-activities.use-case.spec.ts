import { describe, expect, it, vi } from 'vitest';

import {
  InvalidSyncWindowError,
  ProviderMismatchError,
  SyncActivitiesUseCase,
} from '../src/activity-sync/application/sync-activities.use-case.js';
import {
  InvalidActivityError,
  normalizeActivity,
} from '../src/activity-sync/domain/activity-normalizer.js';
import type { ExternalActivity } from '../src/activity-sync/domain/activity.types.js';
import type { ActivityProviderPort } from '../src/activity-sync/ports/activity-provider.port.js';
import type { ActivityRepositoryPort } from '../src/activity-sync/ports/activity-repository.port.js';

const from = new Date('2026-01-01T00:00:00.000Z');
const to = new Date('2026-01-02T00:00:00.000Z');

function githubActivity(externalId: string): ExternalActivity {
  return {
    provider: 'github',
    externalId,
    actorExternalId: 'user-42',
    projectExternalId: 'repo-7',
    kind: 'pull_request',
    occurredAt: new Date('2026-01-01T12:00:00.000Z'),
    url: `https://example.test/pull/${externalId}`,
  };
}

function setup(activities: readonly ExternalActivity[]) {
  const provider: ActivityProviderPort = {
    provider: 'github',
    fetchActivity: vi.fn().mockResolvedValue(activities),
  };
  const repository: ActivityRepositoryPort = {
    upsertMany: vi.fn().mockResolvedValue({
      inserted: 1,
      updated: 0,
      unchanged: 0,
    }),
  };

  return {
    provider,
    repository,
    useCase: new SyncActivitiesUseCase(provider, repository),
  };
}

describe('SyncActivitiesUseCase', () => {
  it('normalizes provider data and persists it inside the tenant boundary', async () => {
    const { provider, repository, useCase } = setup([githubActivity('pr-101')]);

    const result = await useCase.execute({
      tenantId: 'tenant-a',
      connectionId: 'connection-a',
      provider: 'github',
      from,
      to,
    });

    expect(provider.fetchActivity).toHaveBeenCalledWith({
      tenantId: 'tenant-a',
      connectionId: 'connection-a',
      from,
      to,
    });
    expect(repository.upsertMany).toHaveBeenCalledWith('tenant-a', [
      expect.objectContaining({
        idempotencyKey: 'tenant-a:github:pr-101',
        sourceUrl: 'https://example.test/pull/pr-101',
      }),
    ]);
    expect(result).toEqual({
      provider: 'github',
      fetched: 1,
      accepted: 1,
      duplicates: 0,
      inserted: 1,
      updated: 0,
      unchanged: 0,
    });
  });

  it('deduplicates a retry batch before calling the repository', async () => {
    const activity = githubActivity('pr-102');
    const { repository, useCase } = setup([activity, activity]);

    const result = await useCase.execute({
      tenantId: 'tenant-a',
      connectionId: 'connection-a',
      provider: 'github',
      from,
      to,
    });

    expect(repository.upsertMany).toHaveBeenCalledWith(
      'tenant-a',
      expect.arrayContaining([expect.any(Object)]),
    );
    expect(vi.mocked(repository.upsertMany).mock.calls[0]?.[1]).toHaveLength(1);
    expect(result.duplicates).toBe(1);
  });

  it('rejects synchronization windows larger than the operational limit', async () => {
    const { provider, useCase } = setup([]);

    await expect(
      useCase.execute({
        tenantId: 'tenant-a',
        connectionId: 'connection-a',
        provider: 'github',
        from,
        to: new Date('2026-03-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(InvalidSyncWindowError);
    expect(provider.fetchActivity).not.toHaveBeenCalled();
  });

  it('rejects activity returned by the wrong provider adapter', async () => {
    const activity: ExternalActivity = {
      ...githubActivity('issue-1'),
      provider: 'jira',
      kind: 'issue_update',
    };
    const { repository, useCase } = setup([activity]);

    await expect(
      useCase.execute({
        tenantId: 'tenant-a',
        connectionId: 'connection-a',
        provider: 'github',
        from,
        to,
      }),
    ).rejects.toBeInstanceOf(ProviderMismatchError);
    expect(repository.upsertMany).not.toHaveBeenCalled();
  });

  it('rejects a command routed to an incompatible adapter', async () => {
    const { provider, useCase } = setup([]);

    await expect(
      useCase.execute({
        tenantId: 'tenant-a',
        connectionId: 'connection-a',
        provider: 'gitlab',
        from,
        to,
      }),
    ).rejects.toBeInstanceOf(ProviderMismatchError);
    expect(provider.fetchActivity).not.toHaveBeenCalled();
  });

  it('rejects malformed provider identity before persistence', () => {
    expect(() =>
      normalizeActivity('tenant-a', {
        ...githubActivity('  '),
        occurredAt: new Date(Number.NaN),
      }),
    ).toThrow(InvalidActivityError);
  });
});
