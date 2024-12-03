import { FileUpload } from '@/components/FileUpload';
import { AccountManager } from '@/components/AccountManager';
import { TransactionList } from '@/components/TransactionList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Finance Manager
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload />
                <AccountManager />
              </div>
              <TransactionList />
            </TabsContent>
            
            <TabsContent value="accounts">
              <AccountManager showDetailed />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default App;