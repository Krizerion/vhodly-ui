export interface Apartment {
  number: number | null;
  residentsCount?: number;
  repairsFee?: number; // Такса за ремонти (фиксирана €2.50)
  currentExpensesFee?: number; // Такса за текущи разходи (според етажа и брой живущи)
  totalDebt?: number; // Общ дълг на апартамента
  lastPaymentDate?: string;
}

export interface Floor {
  number: number;
  apartments: Apartment[];
}

export interface Announcement {
  id: number;
  message: string;
  date?: string;
  icon: string;
}

export interface AccountBalances {
  expensesBalance2025: number;
  repairsBalance2025: number;
}

export interface Bill {
  id: number;
  type: string; // e.g., "Електричество", "Вода", "Отопление"
  amount: number | null;
  paid: boolean;
  paidDate?: string | null; // Format: "DD-MMM-YYYY"
  description?: string;
}

export interface Transaction {
  id: number;
  billId?: number; // For bill-specific transactions
  accountType?: 'currentExpenses' | 'repairs'; // For account-specific transactions
  type: 'income' | 'expense';
  amount: number;
  date: string; // Format: "DD-MMM-YYYY"
  description: string;
}
