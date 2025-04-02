import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT
});

export async function POST(request: Request) {
  try {
    const { content, category } = await request.json();

    // Create or get group for the category
    const groups = await pinata.groups.private.list()
      .name(category)
      .limit(1);

    let groupId: string;
    if (groups.groups.length === 0) {
      const newGroup = await pinata.groups.private.create({
        name: category,
        isPublic: false
      });
      groupId = newGroup.id;
    } else {
      groupId = groups.groups[0].id;
    }

    // Upload and vectorize the content
    const uploadResponse = await pinata.upload.private.json(content)
      .name(`${category}-${Date.now()}.json`)
      .group(groupId)
      .vectorize();

    return NextResponse.json({
      success: true,
      fileId: uploadResponse.id,
      groupId,
      cid: uploadResponse.cid
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 