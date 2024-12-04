'use client'

import { useState, useRef, useEffect } from "react"
import { Upload, X, FileText, AlertCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { Progress } from "./ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Account } from "@/types/finance"
import { refreshAccounts } from "@/lib/events"

export function StatementUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          setAccounts(data)
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error)
      }
    }

    fetchAccounts()

    const handleRefresh = () => fetchAccounts()
    document.addEventListener('refresh-accounts', handleRefresh)

    return () => {
      document.removeEventListener('refresh-accounts', handleRefresh)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === "text/csv") {
      setFile(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile?.type === "text/csv") {
      setFile(selectedFile)
    }
  }

  const handleUpload = async (isRandom: boolean = false) => {
    if (!selectedAccount) {
      toast.error('Please select an account')
      return
    }

    if (!isRandom && (!file || file.type !== 'text/csv')) {
      toast.error('Please select a valid CSV file')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(10) // Show initial progress
      
      const formData = new FormData()
      if (!isRandom && file) {
        formData.append('file', file)
        
        // Log file details for debugging
        console.log('Uploading file:', {
          name: file.name,
          type: file.type,
          size: file.size
        })
      }
      formData.append('accountId', selectedAccount)
      formData.append('isRandom', isRandom.toString())

      setUploadProgress(30)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(60)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(90)

      toast.success(
        isRandom 
          ? `Successfully generated ${result.transactionCount} transactions`
          : `Successfully uploaded ${result.transactionCount} transactions`
      )
      
      refreshAccounts()
      
      if (!isRandom) {
        setFile(null)
      }
      setUploadProgress(100)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Transaction Management</CardTitle>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <CardDescription>
          Upload statements or generate random transactions
        </CardDescription>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Bank Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.bankName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 transition-colors",
                "hover:border-primary/50 hover:bg-muted/50",
                isDragActive && "border-primary bg-muted",
                "cursor-pointer"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <Upload className={cn(
                  "h-10 w-10 text-muted-foreground transition-colors",
                  isDragActive && "text-primary"
                )} />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the file here</p>
                ) : (
                  <>
                    <p className="font-medium">
                      Drag & drop your CSV file here, or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Only CSV files are supported
                    </p>
                  </>
                )}
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress}% complete
                </p>
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                CSV file should have these columns: date (YYYY-MM-DD), description (text), amount (number).
                <br />
                Example: 2024-03-20,Grocery Shopping,-50.00
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => handleUpload(false)}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Statement
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleUpload(true)}
                disabled={uploading}
                variant="secondary"
                className="w-full"
              >
                {uploading ? (
                  "Generating..."
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Random
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
} 