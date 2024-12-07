'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Account, Transaction, TransactionCategory } from "@/types/finance"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Tag as TagIcon, Plus } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandInput, CommandEmpty, CommandGroup } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "./ui/button"

const CATEGORIES: TransactionCategory[] = ['Income', 'Expense', 'Asset', 'Liability']

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [transactionsRes, accountsRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/accounts')
        ])

        if (transactionsRes.ok && accountsRes.ok) {
          const [transactionsData, accountsData] = await Promise.all([
            transactionsRes.json(),
            accountsRes.json()
          ])
          setTransactions(transactionsData)
          setAccounts(accountsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Generate last 12 months for the filter
  const getMonthOptions = () => {
    const options = []
    const today = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      options.push({
        value: `${date.getFullYear()}-${date.getMonth()}`,
        label: format(date, 'MMMM yyyy')
      })
    }
    
    return options
  }

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    
    // Filter by account
    const accountMatch = selectedAccount === "all" || transaction.accountId === selectedAccount
    
    // Filter by month
    let monthMatch = true
    if (selectedMonth !== "all") {
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = startOfMonth(new Date(year, month))
      const endDate = endOfMonth(startDate)
      
      monthMatch = isWithinInterval(transactionDate, { start: startDate, end: endDate })
    }
    
    // Filter by category
    const categoryMatch = selectedCategory === "all" || transaction.category === selectedCategory
    
    return accountMatch && monthMatch && categoryMatch
  })

  const handleCategoryChange = async (transactionId: string, category: TransactionCategory) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: transactionId, category }),
      })

      if (!response.ok) throw new Error('Failed to update category')

      // Update local state
      setTransactions(prev => 
        prev.map(t => 
          t.id === transactionId ? { ...t, category } : t
        )
      )

      toast.success('Category updated')
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error('Failed to update category')
    }
  }

  const handleAddTag = async (transactionId: string, tagName: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: transactionId, 
          tags: { create: [{ name: tagName }] }
        })
      })

      if (!response.ok) throw new Error('Failed to add tag')

      const updatedTransaction = await response.json()
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? updatedTransaction : t)
      )
      toast.success('Tag added')
    } catch (error: unknown) {
      console.error('Failed to add tag:', error)
      toast.error('Failed to add tag')
    }
  }

  const handleUpdateComment = async (transactionId: string, comment: string) => {
    try {
      const response = await fetch(`/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId, comment })
      })

      if (!response.ok) throw new Error('Failed to update comment')

      const updatedTransaction = await response.json()
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? updatedTransaction : t)
      )
      toast.success('Comment updated')
    } catch (error: unknown) {
      console.error('Failed to update comment:', error)
      toast.error('Failed to update comment')
    }
  }

  if (loading) return <div>Loading transactions...</div>

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Recent Transactions</CardTitle>
            <span className="text-sm text-muted-foreground">
              ({filteredTransactions.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className={cn(
                        category === 'Income' && "text-green-600",
                        category === 'Expense' && "text-red-600",
                        category === 'Asset' && "text-blue-600",
                        category === 'Liability' && "text-orange-600"
                      )}
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredTransactions.length} transactions
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.accountId)
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{account?.name}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className={cn(
                              "text-sm font-medium",
                              transaction.category === 'Income' && "text-green-600",
                              transaction.category === 'Expense' && "text-red-600",
                              transaction.category === 'Asset' && "text-blue-600",
                              transaction.category === 'Liability' && "text-orange-600"
                            )}>
                              {transaction.category || 'Uncategorized'}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {CATEGORIES.map((category) => (
                                <DropdownMenuItem
                                  key={category}
                                  onClick={() => handleCategoryChange(transaction.id, category)}
                                >
                                  {category}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {transaction.tags?.map(tag => (
                              <Badge key={tag.id} variant="secondary">
                                {tag.name}
                              </Badge>
                            ))}
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <TagIcon className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search or add tag..." 
                                    onValueChange={setNewTag}
                                  />
                                  <CommandEmpty>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() => handleAddTag(transaction.id, newTag)}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Create {newTag}
                                    </Button>
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {/* tags.map(tag => (
                                      <CommandItem
                                        key={tag.id}
                                        onSelect={() => handleAddTag(transaction.id, tag.name)}
                                      >
                                        {tag.name}
                                      </CommandItem>
                                    )) */}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                                {transaction.comment && <span className="ml-2">Edit</span>}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Comment</DialogTitle>
                              </DialogHeader>
                              <Textarea
                                defaultValue={transaction.comment || ''}
                                placeholder="Add a comment..."
                                onBlur={(e) => handleUpdateComment(transaction.id, e.target.value)}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        <TableCell className={`text-right ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}$
                          {transaction.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 