import { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useFinanceStore } from '@/lib/store';
import { MonthlySummary } from '@/types/finance';
import { format, parseISO } from 'date-fns';

export function TransactionList() {
  const [showSummary, setShowSummary] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const transactions = useFinanceStore((state) => state.transactions);
  const buckets = useFinanceStore((state) => state.buckets);
  const assignToBucket = useFinanceStore((state) => state.assignToBucket);

  const accounts = useMemo(() => {
    const accountSet = new Set(transactions.map(t => t.account));
    return Array.from(accountSet);
  }, [transactions]);

  const monthlySummaries = useMemo(() => {
    const summariesMap = new Map<string, MonthlySummary>();
    
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      const current = summariesMap.get(month) || {
        month,
        totalCredits: 0,
        totalDebits: 0,
        netAmount: 0,
        transactionCount: 0
      };

      if (transaction.type === 'credit') {
        current.totalCredits += transaction.amount;
      } else {
        current.totalDebits += transaction.amount;
      }

      current.netAmount = current.totalCredits - current.totalDebits;
      current.transactionCount++;
      summariesMap.set(month, current);
    });

    return Array.from(summariesMap.values())
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (selectedBucket === 'all' && selectedAccount === 'all') return true;
        if (selectedBucket === 'unassigned' && selectedAccount === 'all') return !t.bucketId;
        if (selectedBucket === 'all' && selectedAccount !== 'all') return t.account === selectedAccount;
        if (selectedBucket === 'unassigned') return !t.bucketId && t.account === selectedAccount;
        return t.bucketId === selectedBucket && (selectedAccount === 'all' || t.account === selectedAccount);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedBucket, selectedAccount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Monthly Summary</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSummary(!showSummary)}
          className="flex items-center gap-2"
        >
          {showSummary ? (
            <>
              Hide Summary
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show Summary
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {showSummary && (
        <div className="grid md:grid-cols-2 gap-4">
          {monthlySummaries && monthlySummaries.map((summary) => (
            <Card key={summary.month}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(parseISO(`${summary.month}-01`), 'MMMM yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Income</dt>
                    <dd className="text-lg font-semibold text-green-600">
                      ${summary.totalCredits.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Expenses</dt>
                    <dd className="text-lg font-semibold text-red-600">
                      ${summary.totalDebits.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Net</dt>
                    <dd className={`text-lg font-semibold ${
                      summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(summary.netAmount).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Transactions</dt>
                    <dd className="text-lg font-semibold">
                      {summary.transactionCount}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <Select
            value={selectedAccount}
            onValueChange={setSelectedAccount}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts && accounts.map((account) => (
                <SelectItem key={account} value={account}>
                  {account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedBucket}
            onValueChange={setSelectedBucket}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {buckets.map((bucket) => (
                <SelectItem key={bucket.id} value={bucket.id}>
                  {bucket.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bucket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions && filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{transaction.account}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Select
                    value={transaction.bucketId || ''}
                    onValueChange={(value) => assignToBucket(transaction.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign bucket" />
                    </SelectTrigger>
                    <SelectContent>
                      {buckets.map((bucket) => (
                        <SelectItem key={bucket.id} value={bucket.id}>
                          {bucket.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}