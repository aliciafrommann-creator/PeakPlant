export type CardType = 'question' | 'action';
export type CardStatus = 'sealed' | 'activated';

export interface MomentCard {
  id: string;
  number: number;
  prompt: string;
  type: CardType;
  edition: string;
  status: CardStatus;
}

export interface Memory {
  id: string;
  cardId: string;
  coupleId: string;
  note: string;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Couple {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  coupleId: string;
}

export interface Edition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  cards: MomentCard[];
  coverImage?: string;
}

export interface Goal {
  id: string;
  label: string;
  description: string;
}
