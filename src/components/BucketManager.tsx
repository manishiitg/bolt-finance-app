import { useState } from 'react';
import { Plus, Trash2, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
import { useFinanceStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function BucketManager() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  
  const addBucket = useFinanceStore((state) => state.addBucket);
  const deleteBucket = useFinanceStore((state) => state.deleteBucket);
  const buckets = useFinanceStore((state) => state.buckets);
  const transactions = useFinanceStore((state) => state.transactions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBucket({
      name,
      description,
      color,
      rules: [],
    });
    setOpen(false);
    setName('');
    setDescription('');
  };

  const getBucketStats = (bucketId: string) => {
    const bucketTransactions = transactions.filter(t => t.bucketId === bucketId);
    const total = bucketTransactions.reduce((sum, t) => 
      sum + (t.type === 'credit' ? t.amount : -t.amount), 0);
    const credits = bucketTransactions.filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const debits = bucketTransactions.filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    const count = bucketTransactions.length;
    
    return { total, credits, debits, count };
  };

  const totalTransactions = transactions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Buckets</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Bucket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bucket</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10"
                />
              </div>
              <Button type="submit" className="w-full">
                Create Bucket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buckets.map((bucket) => {
          const stats = getBucketStats(bucket.id);
          const percentage = totalTransactions ? (stats.count / totalTransactions) * 100 : 0;
          
          return (
            <Card key={bucket.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: bucket.color }}
              />
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{bucket.name}</h3>
                    {bucket.description && (
                      <p className="text-sm text-gray-500">{bucket.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => deleteBucket(bucket.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats.count} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Income</p>
                        <p className="font-medium">${stats.credits.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm text-gray-500">Expenses</p>
                        <p className="font-medium">${stats.debits.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Net Total</span>
                      <span className={`font-medium ${stats.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(stats.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}