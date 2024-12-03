import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useFinanceStore } from '@/lib/store';
import { parseTransactions } from '@/lib/parser';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addTransactions = useFinanceStore((state) => state.addTransactions);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const transactions = await parseTransactions(file, (progress) => {
        setProgress(progress);
      });
      addTransactions(transactions);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Statements</CardTitle>
        <CardDescription>
          Upload your bank statements or Excel sheets to analyze your finances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="file-upload"
            className="w-full cursor-pointer"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                CSV, XLSX up to 10MB
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <div className="w-full">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-500 mt-2">
                Processing your file...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}