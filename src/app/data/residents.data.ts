import type {
  AccountBalances,
  Announcement,
  Bill,
  Transaction,
} from './interfaces';

export const announcements: Announcement[] = [
  {
    id: 1,
    message: 'Следващо събрание на входа: 19 февруари 2026 г. в 19:30 ч.',
    icon: 'event',
  },
  // Add more announcements as needed
];

export const accountBalances: AccountBalances = {
  expensesBalance2025: 349.13,
  repairsBalance2025: 267.67,
};

export const bills: Bill[] = [
  {
    id: 1,
    type: 'Поддръжка асансьор',
    amount: 61.36,
    paid: true,
    paidDate: '10-Oct-2025',
    description: 'Сметка за декември 2025',
  },
  {
    id: 2,
    type: 'Ток асансьор',
    amount: 20.79,
    paid: true,
    paidDate: '16-Dec-2025',
    description: 'Сметка за ноември 2025',
  },
  {
    id: 3,
    type: 'Ток общи части',
    amount: 6.14,
    paid: true,
    paidDate: '16-Dec-2025',
    description: 'Сметка за ноември 2025',
  },
  {
    id: 4,
    type: 'Поддръжка асансьор',
    amount: 184.02,
    paid: true,
    paidDate: '12-Dec-2025',
    description: 'Поддръжка на асансьор до края на март 2026',
  },
];

export const currentExpensesTransactions: Transaction[] = [
  {
    id: 150120261,
    accountType: 'currentExpenses',
    type: 'income',
    amount: 192,
    date: '19-Jan-2026',
    description: 'Платени такси за цялата година от апартаменти 121, 123 и 134',
  },
  {
    id: 150120261,
    accountType: 'currentExpenses',
    type: 'income',
    amount: 24,
    date: '19-Jan-2026',
    description: 'Платени такси за януари и февруари от апартаменти 129 и 131',
  },
];

export const repairsTransactions: Transaction[] = [
  {
    id: 150120262,
    accountType: 'repairs',
    type: 'income',
    amount: 90.0,
    date: '19-Jan-2026',
    description: 'Платени такси за цялата година от апартаменти 121, 123 и 134',
  },
  {
    id: 150120262,
    accountType: 'repairs',
    type: 'income',
    amount: 10,
    date: '19-Jan-2026',
    description: 'Платени такси за януари и февруари от апартаменти 129 и 131',
  },
];

// Combined array for backward compatibility (used for bill-specific transactions)
export const transactions: Transaction[] = [
  ...currentExpensesTransactions,
  ...repairsTransactions,
];
