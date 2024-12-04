import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface CSVRecord {
  date: string
  description: string
  amount: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const accountId = formData.get('accountId') as string
    const isRandom = formData.get('isRandom') === 'true'
    
    console.log('Processing upload request:', {
      hasFile: !!file,
      accountId,
      isRandom
    })

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    if (!isRandom && !file) {
      return NextResponse.json(
        { error: 'File is required for CSV upload' },
        { status: 400 }
      )
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Invalid account ID' },
        { status: 400 }
      )
    }

    if (!isRandom) {
      try {
        const text = await file!.text()
        console.log('Raw CSV content:', text.substring(0, 200)) // Debug log

        // Parse CSV with explicit options
        const records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          delimiter: ',',
          relaxColumnCount: true,
          relaxQuotes: true,
          cast: true
        }) as CSVRecord[]

        console.log('Parsed records:', records.slice(0, 2)) // Debug log

        if (!Array.isArray(records) || records.length === 0) {
          throw new Error('No valid records found in CSV')
        }

        // Validate the first record
        const firstRecord = records[0]
        if (!firstRecord.date || !firstRecord.description || !firstRecord.amount) {
          throw new Error('CSV must contain date, description, and amount columns')
        }

        const transactions = await Promise.all(
          records.map(async (record, index) => {
            try {
              const amount = parseFloat(record.amount.replace(/[^-0-9.]/g, ''))
              if (isNaN(amount)) {
                throw new Error(`Invalid amount at row ${index + 1}: ${record.amount}`)
              }

              const date = new Date(record.date)
              if (isNaN(date.getTime())) {
                throw new Error(`Invalid date at row ${index + 1}: ${record.date}`)
              }

              return prisma.transaction.create({
                data: {
                  date,
                  description: record.description,
                  amount: Math.abs(amount),
                  type: amount >= 0 ? 'credit' : 'debit',
                  accountId,
                  category: amount >= 0 ? 'Income' : 'Expense',
                }
              })
            } catch (error) {
              console.error(`Error processing row ${index + 1}:`, error)
              throw error
            }
          })
        )

        const totalBalance = transactions.reduce((sum, t) => {
          return sum + (t.type === 'credit' ? t.amount : -t.amount)
        }, 0)

        await prisma.account.update({
          where: { id: accountId },
          data: {
            balance: { increment: totalBalance }
          }
        })

        return NextResponse.json({
          success: true,
          transactionCount: transactions.length
        })
      } catch (error) {
        console.error('CSV processing error:', error)
        return NextResponse.json(
          { error: `CSV processing error: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        )
      }
    }

    // ... rest of the code for random transactions ...

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process transactions' },
      { status: 500 }
    )
  }
} 