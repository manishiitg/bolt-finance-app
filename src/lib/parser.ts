import * as XLSX from 'xlsx';

export async function parseTransactions(
  file: File,
  onProgress: (progress: number) => void
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Transform the data into our transaction format
        const transactions = jsonData.map((row: any) => ({
          id: crypto.randomUUID(),
          date: new Date(row.Date).toISOString().split('T')[0],
          description: row.Description || row.Narrative || row.Details || '',
          amount: parseFloat(row.Amount || row.Value || 0),
          type: parseFloat(row.Amount || row.Value || 0) >= 0 ? 'credit' : 'debit',
        }));

        onProgress(100);
        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}