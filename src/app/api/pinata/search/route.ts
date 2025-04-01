import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT
});

export async function POST(request: Request) {
  try {
    const { query, category } = await request.json();

    // Get all private groups
    const groups = await pinata.groups.private.list();
    
    // If category is specified, filter for that group
    const targetGroups = category 
      ? groups.groups.filter(g => g.name === category)
      : groups.groups;

    if (targetGroups.length === 0) {
      return NextResponse.json({
        success: true,
        results: []
      });
    }

    // Fetch files from all target groups
    const allFiles = await Promise.all(
      targetGroups.map(async (group) => {
        try {
          const response = await pinata.files.private.list();
          return response.files || [];
        } catch (err) {
          console.error(`Error fetching files for group ${group.id}:`, err);
          return [];
        }
      })
    );

    // Flatten the array of file arrays and remove duplicates
    const flattenedFiles = allFiles.flat().filter((file, index, self) =>
      index === self.findIndex(f => f.id === file.id)
    );

    // Extract relevant content from files
    const fileContents = flattenedFiles.map(file => ({
      id: file.id,
      name: file.name,
      created_at: file.created_at,
      cid: file.cid,
      size: file.size
    }));

    return NextResponse.json({
      success: true,
      results: fileContents
    });

  } catch (error) {
    console.error('Error in search:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 