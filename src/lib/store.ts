import { create } from 'zustand';
import { type Transaction, type Account, type Party } from '@/types/finance';
import { dummyTransactions, defaultAccounts } from './dummy-data';

interface FinanceStore {
  transactions: Transaction[];
  accounts: Account[];
  parties: Party[];
  addTransactions: (transactions: Transaction[]) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addParty: (party: Omit<Party, 'id'>) => void;
  updateParty: (id: string, party: Partial<Party>) => void;
  deleteParty: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  transactions: dummyTransactions,
  accounts: defaultAccounts,
  parties: [],
  addTransactions: (newTransactions) =>
    set((state) => ({
      transactions: [...state.transactions, ...newTransactions],
    })),
  addAccount: (account) =>
    set((state) => ({
      accounts: [
        ...state.accounts,
        { ...account, id: crypto.randomUUID() },
      ],
    })),
  updateAccount: (id, updatedAccount) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...updatedAccount } : account
      ),
    })),
  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
    })),
  addParty: (party) =>
    set((state) => ({
      parties: [
        ...state.parties,
        { ...party, id: crypto.randomUUID() },
      ],
    })),
  updateParty: (id, updatedParty) =>
    set((state) => ({
      parties: state.parties.map((party) =>
        party.id === id ? { ...party, ...updatedParty } : party
      ),
    })),
  deleteParty: (id) =>
    set((state) => ({
      parties: state.parties.filter((party) => party.id !== id),
    })),
}));