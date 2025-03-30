import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

// Initialize Pinata SDK on the server side
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || '',
  pinataGateway: process.env.PINATA_GATEWAY || ''
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'uploadMetadata': {
        console.log('uploadMetadata');
        console.log(data);
        const { metadata, category } = data;
        
        // Create or get private group for metadata
        let groupId: string = '';
        try {
          const groups = await pinata.groups.private.list()
            .name(category)
            .limit(1);

          if (groups.groups.length === 0) {
            const newGroup = await pinata.groups.private.create({
              name: category,
              isPublic: false
            });
            groupId = newGroup.id;
          } else {
            groupId = groups.groups[0].id;
          }
        } catch (error) {
          console.error('Error managing groups:', error);
        }

        // Upload metadata as JSON
        const uploadResponse = await pinata.upload.private.json(metadata).group(groupId).vectorize();

        return NextResponse.json({ cid: uploadResponse.cid });
      }

      case 'uploadImage': {
        const { file, metadata } = data;
        
        // Convert base64 to File
        const base64Data = file.split(',')[1];
        const binaryData = Buffer.from(base64Data, 'base64');
        
        // Create a File object with the required properties
        const fileObj = new File(
          [binaryData],
          metadata.name || 'image.jpg',
          { type: 'image/jpeg' }
        );
        
        // Upload file with metadata
        const uploadResponse = await pinata.upload.public.file(fileObj)
          .name(metadata.name)
          .keyvalues({
            description: metadata.description,
            location: metadata.location,
            category: metadata.category,
            eventDate: metadata.eventDate.toString(),
            price: metadata.price.toString(),
            maxTickets: metadata.maxTickets.toString()
          });

        return NextResponse.json({ cid: uploadResponse.cid });
      }

      case 'getMetadata': {
        const { cid } = data;
        const response = await pinata.gateways.private.get(cid);
        return NextResponse.json(response.data);
      }

      case 'getImage': {
        const { cid } = data;
        const response = await pinata.gateways.public.get(cid);
        return NextResponse.json(response.data);
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Pinata API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process Pinata request' },
      { status: 500 }
    );
  }
} 