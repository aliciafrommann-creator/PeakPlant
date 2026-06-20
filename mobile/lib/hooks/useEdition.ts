import { useState, useEffect } from 'react';
import { localCardRepository } from '../repositories/local';
import { SEED_EDITION } from '../seed';
import type { Edition, MomentCard } from '../types';

export function useEdition() {
  const [edition] = useState<Edition>(SEED_EDITION);
  const [cards, setCards] = useState<MomentCard[]>(SEED_EDITION.cards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localCardRepository.getAll('edition-01').then((data) => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const activateCard = async (cardId: string) => {
    const updated = await localCardRepository.activate(cardId);
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  };

  const activatedCount = cards.filter((c) => c.status === 'activated').length;

  return { edition, cards, loading, activateCard, activatedCount };
}
