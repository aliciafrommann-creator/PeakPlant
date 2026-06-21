import { useState, useEffect } from 'react';
import { cardRepository } from '../repositories';
import { getEdition, SEED_EDITION } from '../seed';
import type { Edition, MomentCard } from '../types';

export function useEdition(spaceId?: string, editionId: string = SEED_EDITION.id) {
  const edition: Edition = getEdition(editionId) ?? SEED_EDITION;
  const [cards, setCards] = useState<MomentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId || edition.status !== 'available') {
      setCards([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    cardRepository.getAll(edition.id, spaceId).then((data) => {
      if (active) {
        setCards(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [spaceId, edition.id, edition.status]);

  const activatedCount = cards.filter((c) => c.status === 'activated').length;

  return { edition, cards, loading, activatedCount };
}
