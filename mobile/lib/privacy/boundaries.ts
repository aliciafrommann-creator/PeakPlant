/**
 * Privacy boundary helpers — enforce content contracts at trust-boundary edges.
 *
 * These functions are called at the point of write (before anything leaves the
 * private diary layer and enters a potentially-shared surface). They are pure so
 * they are easy to unit test and safe to call in any context.
 *
 * The contracts encoded here:
 *   PP-004  — shareable links carry only catalog ids, never private content
 *   PP-030  — DateConstraints are ephemeral; never written to a durable profile
 *   FEED-01 — feedback.tip is the only user-text field in DateFeedback; max 280 chars
 *   FEED-02 — feedback.tip must not leak planning notes or diary text
 *   LOG-01  — usage events contain no private content (see monetization/usage.ts)
 *
 * "Private content" means: diary notes, card reflections, prompt answers, partner
 * messages, photos, planning notes, or any intimate couple data.
 */

export const TIP_MAX_LENGTH = 280;

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validate that a feedback tip is suitable for potential public display.
 * A tip may describe the experience (what worked, logistics) but not
 * reproduce the user's private diary entry or planning notes.
 */
export function validateFeedbackTip(tip: string | undefined): ValidationResult {
  if (tip === undefined || tip === '') return { ok: true };
  if (tip.length > TIP_MAX_LENGTH) {
    return { ok: false, reason: `tip exceeds ${TIP_MAX_LENGTH} characters` };
  }
  return { ok: true };
}

/**
 * Sanitise a tip for storage: trim whitespace and truncate to max length.
 * The UI enforces maxLength but this provides a server-edge defence.
 */
export function sanitiseTip(tip: string | undefined): string | undefined {
  if (!tip) return undefined;
  const trimmed = tip.trim();
  return trimmed.length === 0 ? undefined : trimmed.slice(0, TIP_MAX_LENGTH) || undefined;
}

/**
 * Confirm that a public-facing text field carries no structural markers of
 * private content. This is not foolproof (users control the text) but it
 * catches integration bugs where a private field was accidentally wired to
 * a public field at the code level.
 *
 * Checks: the value must not be === to a known private field from the same
 * object. Use this in tests to assert the wiring is correct.
 */
export function assertNotPrivateContent(
  publicValue: string | undefined,
  privateFields: Record<string, string | undefined>,
): ValidationResult {
  if (!publicValue) return { ok: true };
  for (const [fieldName, privateValue] of Object.entries(privateFields)) {
    if (privateValue && publicValue === privateValue) {
      return {
        ok: false,
        reason: `public field contains the same value as private field '${fieldName}' — check the wiring`,
      };
    }
  }
  return { ok: true };
}

/**
 * Confirm a shareable link carries only a catalog id (no private context).
 * The path must match /c/<id> or /i/<id> and not include spaces or query params
 * that could embed private data.
 */
export function validateShareableLink(url: string): ValidationResult {
  try {
    const u = new URL(url);
    // Only catalog paths are shareable.
    if (!/^\/(c|i)\/[a-zA-Z0-9_-]+$/.test(u.pathname)) {
      return { ok: false, reason: 'link path does not match a catalog route' };
    }
    if (u.search) {
      return { ok: false, reason: 'shareable links must not carry query parameters' };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'not a valid URL' };
  }
}
