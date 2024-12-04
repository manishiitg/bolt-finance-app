import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle GET requests to fetch all tags
export async function GET() {
  try {
    const tags = await prisma.tag.findMany(); // Fetch all tags from the database
    return NextResponse.json(tags);
  } catch (error) {
    return NextResponse.error();
  }
}

// Handle POST requests to create a new tag
export async function POST(request: Request) {
  const { name } = await request.json(); // Get the tag name from the request body

  try {
    const newTag = await prisma.tag.create({ data: { name } }); // Create a new tag in the database
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    return NextResponse.error();
  }
}

// Handle DELETE requests to remove a tag
export async function DELETE(request: Request) {
  const { id } = await request.json(); // Get the tag ID from the request body

  try {
    await prisma.tag.delete({ where: { id } }); // Delete the tag from the database
    return NextResponse.json({ message: 'Tag deleted' });
  } catch (error) {
    return NextResponse.error();
  }
}
