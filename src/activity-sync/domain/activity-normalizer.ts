import type {
  ExternalActivity,
  NormalizedActivity,
} from './activity.types.js';

export class InvalidActivityError extends Error {}

export function normalizeActivity(
  tenantId: string,
  activity: ExternalActivity,
): NormalizedActivity {
  const externalId = activity.externalId.trim();
  const actorExternalId = activity.actorExternalId.trim();
  const projectExternalId = activity.projectExternalId.trim();

  if (!tenantId || !externalId || !actorExternalId || !projectExternalId) {
    throw new InvalidActivityError('Activity identity fields are required');
  }

  if (Number.isNaN(activity.occurredAt.getTime())) {
    throw new InvalidActivityError('Activity timestamp must be valid');
  }

  return {
    tenantId,
    provider: activity.provider,
    externalId,
    actorExternalId,
    projectExternalId,
    kind: activity.kind,
    occurredAt: new Date(activity.occurredAt),
    sourceUrl: activity.url?.trim() || null,
    idempotencyKey: `${tenantId}:${activity.provider}:${externalId}`,
  };
}
