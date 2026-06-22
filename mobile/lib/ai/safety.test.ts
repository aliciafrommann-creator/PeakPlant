import { describe, it, expect } from 'vitest';
import { assessSafety, aiSurfaceEnabled, AI_KILL_SWITCHES } from './safety';

describe('assessSafety — crisis detection', () => {
  it('proceeds on ordinary date-planning text', () => {
    expect(assessSafety('I want a quiet picnic this weekend').kind).toBe('proceed');
    expect(assessSafety('something playful and fun, maybe under 2 hours').kind).toBe('proceed');
  });

  it('detects self-harm signals (EN)', () => {
    const d = assessSafety('sometimes I want to die');
    expect(d.kind).toBe('crisis');
    if (d.kind === 'crisis') expect(d.category).toBe('self_harm');
  });

  it('detects self-harm signals (DE)', () => {
    const d = assessSafety('ich will mich umbringen');
    expect(d.kind).toBe('crisis');
    if (d.kind === 'crisis') expect(d.category).toBe('self_harm');
  });

  it('detects abuse signals (EN)', () => {
    const d = assessSafety('my partner hits me when angry');
    expect(d.kind).toBe('crisis');
    if (d.kind === 'crisis') expect(d.category).toBe('abuse');
  });

  it('detects abuse signals (DE)', () => {
    const d = assessSafety('er schlägt mich');
    expect(d.kind).toBe('crisis');
    if (d.kind === 'crisis') expect(d.category).toBe('abuse');
  });

  it('detects coercion signals', () => {
    const d = assessSafety('he forces me to do things against my will');
    expect(d.kind).toBe('crisis');
    if (d.kind === 'crisis') expect(d.category).toBe('coercion');
  });

  it('is case-insensitive', () => {
    expect(assessSafety('I WANT TO DIE').kind).toBe('crisis');
  });

  it('does not return or echo the input text in the decision', () => {
    const sensitive = 'i want to die and the secret password is hunter2';
    const d = assessSafety(sensitive);
    expect(JSON.stringify(d)).not.toContain('hunter2');
    expect(JSON.stringify(d)).not.toContain('password');
  });

  it('does not flag innocuous words that merely contain fragments', () => {
    // "diet", "diary", "abusive language" used descriptively — keep conservative
    // but avoid the most obvious false positives on common words.
    expect(assessSafety('I am on a diet this month').kind).toBe('proceed');
    expect(assessSafety('we keep a shared diary').kind).toBe('proceed');
  });
});

describe('AI kill switches', () => {
  it('Ask PeakPlant is ON (discover Edge Function deployed); other surfaces stay OFF', () => {
    expect(AI_KILL_SWITCHES.askPeakPlant).toBe(true);
    expect(AI_KILL_SWITCHES.liveRecommendations).toBe(false);
    expect(AI_KILL_SWITCHES.reflectionPrompts).toBe(false);
  });

  it('aiSurfaceEnabled reflects the switch state', () => {
    expect(aiSurfaceEnabled('askPeakPlant')).toBe(true);
    expect(aiSurfaceEnabled('liveRecommendations')).toBe(false);
  });
});
