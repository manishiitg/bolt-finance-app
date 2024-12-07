import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;  // Extract id from body
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data
    });

    return NextResponse.json(transaction);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
} 