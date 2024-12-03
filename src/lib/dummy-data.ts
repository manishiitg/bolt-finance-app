import { Transaction, Account, AccountType } from '@/types/finance';

export const defaultAccounts: Account[] = [
  // Income accounts
  {
    id: 'income-sales',
    name: 'Sales Account',
    type: 'income',
    description: 'Revenue from sales',
  },
  {
    id: 'income-interest',
    name: 'Interest Income',
    type: 'income',
    description: 'Income from interest',
  },
  
  // Expense accounts
  {
    id: 'expense-purchase',
    name: 'Purchase Account',
    type: 'expense',
    description: 'Expenses for purchases',
  },
  {
    id: 'expense-salary',
    name: 'Salary Expenses',
    type: 'expense',
    description: 'Employee salary expenses',
  },
  
  // Asset accounts
  {
    id: 'asset-cash',
    name: 'Cash in Hand',
    type: 'asset',
    description: 'Physical cash',
  },
  {
    id: 'asset-bank',
    name: 'Bank Account',
    type: 'asset',
    description: 'Bank balance',
  },
  
  // Liability accounts
  {
    id: 'liability-loans',
    name: 'Bank Loans',
    type: 'liability',
    description: 'Outstanding bank loans',
  },
  {
    id: 'liability-creditors',
    name: 'Sundry Creditors',
    type: 'liability',
    description: 'Amount owed to suppliers',
  },
];

export const dummyTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-03-15',
    description: 'Sales Invoice #1001',
    amount: 50000.00,
    type: 'credit',
    accountType: 'income',
    party: 'ABC Trading Co.',
    account: 'Sales Account',
    narration: 'Sale of goods to ABC Trading',
  },
  {
    id: '2',
    date: '2024-03-14',
    description: 'Purchase Invoice #2001',
    amount: 35000.00,
    type: 'debit',
    accountType: 'expense',
    party: 'XYZ Suppliers',
    account: 'Purchase Account',
    narration: 'Purchase of raw materials',
  },
  {
    id: '3',
    date: '2024-03-13',
    description: 'Salary Payment',
    amount: 25000.00,
    type: 'debit',
    accountType: 'expense',
    party: 'Staff',
    account: 'Salary Expenses',
    narration: 'Monthly salary payment',
  },
  {
    id: '4',
    date: '2024-03-12',
    description: 'Bank Loan EMI',
    amount: 15000.00,
    type: 'credit',
    accountType: 'liability',
    party: 'HDFC Bank',
    account: 'Bank Loans',
    narration: 'Monthly loan installment',
  },
  {
    id: '5',
    date: '2024-03-10',
    description: 'Cash Deposit',
    amount: 100000.00,
    type: 'credit',
    accountType: 'asset',
    party: 'Self',
    account: 'Bank Account',
    narration: 'Cash deposit to bank',
  },
];