import { useState } from 'react';
import { Plus, ChevronRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useFinanceStore } from '@/lib/store';
import { AccountType } from '@/types/finance';

interface AccountManagerProps {
  showDetailed?: boolean;
}

export function AccountManager({ showDetailed = false }: AccountManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('asset');
  const [description, setDescription] = useState('');

  const accounts = useFinanceStore((state) => state.accounts);
  const addAccount = useFinanceStore((state) => state.addAccount);
  const transactions = useFinanceStore((state) => state.transactions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      name,
      type,
      description,
    });
    setOpen(false);
    setName('');
    setType('asset');
    setDescription('');
  };

  const getAccountBalance = (accountId: string) => {
    return transactions
      .filter((t) => t.account === accounts.find((a) => a.id === accountId)?.name)
      .reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
  };

  const accountsByType = {
    income: accounts.filter((a) => a.type === 'income'),
    expense: accounts.filter((a) => a.type === 'expense'),
    asset: accounts.filter((a) => a.type === 'asset'),
    liability: accounts.filter((a) => a.type === 'liability'),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Chart of Accounts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as AccountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {(['asset', 'liability', 'income', 'expense'] as const).map((type) => (
          <Card key={type}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold capitalize mb-4">{type}s</h3>
              <div className="space-y-2">
                {accountsByType[type].map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{account.name}</p>
                        {showDetailed && account.description && (
                          <p className="text-sm text-gray-500">{account.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        getAccountBalance(account.id) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{Math.abs(getAccountBalance(account.id)).toFixed(2)}
                      </span>
                      {showDetailed && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}