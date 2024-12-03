import { LucideIcon } from 'lucide-react';

export type AccountType = 'income' | 'expense' | 'asset' | 'liability';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  accountType: AccountType;
  party: string;
  account: string;
  narration?: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  description?: string;
  parent?: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'customer' | 'vendor' | 'employee' | 'other';
  gstin?: string;
  contact?: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  assets: number;
  liabilities: number;
  netWorth: number;
  transactionCount: number;
}