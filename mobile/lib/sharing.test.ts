import { describe, it, expect } from 'vitest';
import { titleFor, checkShare, challengeAnchor, SHARE_TITLE_MAX } from './sharing';

/**
 * Diese Tests bewachen eine Zusage, keine Funktion.
 *
 * Die Zusage: Was ihr in einem Moment festhaltet, verlässt euren Space nicht.
 * Sichtbar wird nur, was ein Mensch dafür ausgewählt hat. Die Datenbank kann
 * das nicht allein garantieren — sie sieht nur, was die App ihr schickt. Wenn
 * die App die Notiz in den Titel schreibt, ist die Notiz öffentlich, ganz
 * gleich wie sauber das Schema ist.
 */

describe('titleFor — die Notiz überquert die Grenze nicht', () => {
  it('nimmt den Kartentitel, wenn es einen gibt', () => {
    expect(titleFor({ cardTitle: 'Trade Languages For One Evening' }))
      .toBe('Trade Languages For One Evening');
  });

  it('nimmt sonst das Thema', () => {
    expect(titleFor({ themeTitle: 'Wochen-Challenge: zusammen kochen' }))
      .toBe('Wochen-Challenge: zusammen kochen');
  });

  it('gibt lieber nichts zurück, als etwas zu erfinden', () => {
    // Ein leeres Feld ist ehrlicher als ein vorbefülltes, das man übersieht.
    expect(titleFor({})).toBe('');
  });

  /**
   * DER TEST, WEGEN DEM ES DIESE DATEI GIBT.
   *
   * `TitleSources` hat bewusst kein Feld für die Notiz. Wer eines ergänzt,
   * bricht hier — und sollte diesen Kommentar lesen, bevor er ihn löscht.
   */
  it('kennt gar keine Möglichkeit, die Notiz zu übernehmen', () => {
    const quellen = { cardTitle: undefined, themeTitle: undefined };
    // Ein zusätzliches Feld ändert nichts: titleFor liest nur die zwei.
    const mitNotiz = { ...quellen, note: 'wir haben geweint und dann gelacht' };
    expect(titleFor(mitNotiz as typeof quellen)).toBe('');
  });

  it('kürzt auf die Länge, die auch die Datenbank prüft', () => {
    const lang = 'a'.repeat(SHARE_TITLE_MAX + 40);
    expect(titleFor({ cardTitle: lang })).toHaveLength(SHARE_TITLE_MAX);
  });
});

describe('checkShare — was rausgeht, und was nicht', () => {
  const gueltig = { memoryId: 'm1', audienceId: 'a1', title: 'Zusammen gekocht' };

  it('lässt einen sauberen Entwurf durch und normalisiert die Leerzeichen', () => {
    const r = checkShare({ ...gueltig, title: '  Zusammen   gekocht  ' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.draft.title).toBe('Zusammen gekocht');
  });

  it('lehnt einen leeren Titel ab, bevor irgendetwas das Gerät verlässt', () => {
    const r = checkShare({ ...gueltig, title: '   ' });
    expect(r).toEqual({ ok: false, reason: 'empty_title' });
  });

  it('lehnt ohne Moment und ohne Publikum ab', () => {
    expect(checkShare({ ...gueltig, memoryId: '' }).ok).toBe(false);
    expect(checkShare({ ...gueltig, audienceId: '' }).ok).toBe(false);
  });

  /**
   * Auch das ist eine Zusage: Der Entwurf kann mitbringen, was er will —
   * heraus kommen genau vier Felder. Kein Space, keine Person, keine Notiz,
   * auch nicht versehentlich durchgereicht.
   */
  it('gibt NUR die vier erlaubten Felder heraus', () => {
    const r = checkShare({
      ...gueltig,
      photoPath: 'space-1/foto.jpg',
      // Felder, die ein unachtsamer Aufrufer mitgeben könnte:
      spaceId: 'space-1',
      createdBy: 'user-1',
      note: 'sehr privat',
    } as never);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.draft).sort()).toEqual(
      ['audienceId', 'memoryId', 'photoPath', 'title'].sort(),
    );
    expect(JSON.stringify(r.draft)).not.toContain('sehr privat');
    expect(JSON.stringify(r.draft)).not.toContain('user-1');
  });
});

describe('challengeAnchor', () => {
  it('baut einen stabilen Anker pro Challenge', () => {
    expect(challengeAnchor('weekly-2026-34')).toBe('challenge:weekly-2026-34');
  });

  it('ist für zwei Challenges verschieden', () => {
    expect(challengeAnchor('a')).not.toBe(challengeAnchor('b'));
  });
});
