import { useState, useEffect } from 'react';
import { localCardRepository } from '../repositories/local';
import { SEED_EDITION } from '../seed';
import type { Edition, MomentCard } from '../types';

export function useEdition(spaceId?: string) {
  const [edition] = useState<Edition>(SEED_EDITION);
  const [cards, setCards] = useState<MomentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spaceId) {
      setCards([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    localCardRepository.getAll('edition-01', spaceId).then((data) => {
      if (active) {
        setCards(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [spaceId]);

  const activatedCount = cards.filter((c) => c.status === 'activated').length;

  return { edition, cards, loading, activatedCount };
}
