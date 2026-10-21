export type ActivityProvider = 'github' | 'gitlab' | 'jira' | 'linear';

export type ActivityKind =
  | 'commit'
  | 'pull_request'
  | 'code_review'
  | 'issue_update';

export interface ExternalActivity {
  readonly provider: ActivityProvider;
  readonly externalId: string;
  readonly actorExternalId: string;
  readonly projectExternalId: string;
  readonly kind: ActivityKind;
  readonly occurredAt: Date;
  readonly url?: string;
}

export interface NormalizedActivity {
  readonly tenantId: string;
  readonly provider: ActivityProvider;
  readonly externalId: string;
  readonly actorExternalId: string;
  readonly projectExternalId: string;
  readonly kind: ActivityKind;
  readonly occurredAt: Date;
  readonly sourceUrl: string | null;
  readonly idempotencyKey: string;
}
