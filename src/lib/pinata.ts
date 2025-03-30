import { PinataSDK } from 'pinata';

// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || ''
});

export interface EventImageMetadata {
  name: string;
  description: string;
  location: string;
  category: string;
  eventDate: number;
  price: number;
  maxTickets: number;
}

export async function uploadEventImage(
  file: File,
  metadata: EventImageMetadata
): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT is not configured. Please check your environment variables.');
    }

    // Create or get group for the category
    let groupId: string | undefined;
    try {
      const groups = await pinata.groups.public.list()
        .name(metadata.category)
        .limit(1);

      if (groups.groups.length === 0) {
        // Create new group if it doesn't exist
        const newGroup = await pinata.groups.public.create({
          name: metadata.category,
          isPublic: true
        });
        groupId = newGroup.id;
      } else {
        groupId = groups.groups[0].id;
      }
    } catch (error) {
      console.error('Error managing groups:', error);
      // Continue without group if there's an error
    }

    // Upload file with metadata
    let upload = pinata.upload.public.file(file)
      .name(metadata.name)
      .keyvalues({
        description: metadata.description,
        location: metadata.location,
        category: metadata.category,
        eventDate: metadata.eventDate.toString(),
        price: metadata.price.toString(),
        maxTickets: metadata.maxTickets.toString()
      });

    if (groupId) {
      upload = upload.group(groupId);
    }

    const uploadResponse = await upload;
    return uploadResponse.cid;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        throw new Error('Pinata authentication failed. Please check your JWT token.');
      }
    }
    throw error;
  }
}

export async function getEventImage(cid: string): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT is not configured. Please check your environment variables.');
    }

    if (!cid) {
      return '/placeholder-event.jpg'; // Return a placeholder image path
    }

    // Ensure the gateway URL has a protocol
    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY || '';
    const baseUrl = gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
    
    // Remove any trailing slash from the base URL and ensure CID doesn't start with a slash
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanCid = cid.replace(/^\//, '');
    
    // Return the properly formatted IPFS gateway URL
    return `${cleanBaseUrl}/ipfs/${cleanCid}`;
  } catch (error) {
    console.error('Error getting image from Pinata:', error);
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        throw new Error('Pinata authentication failed. Please check your JWT token.');
      }
    }
    throw error;
  }
}

export async function getEventImageMetadata(cid: string): Promise<EventImageMetadata> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      throw new Error('Pinata JWT is not configured. Please check your environment variables.');
    }

    // Get file details from Pinata
    const fileDetails = await pinata.files.public.get(cid);
    return {
      name: fileDetails.name || '',
      description: fileDetails.keyvalues.description,
      location: fileDetails.keyvalues.location,
      category: fileDetails.keyvalues.category,
      eventDate: parseInt(fileDetails.keyvalues.eventDate),
      price: parseFloat(fileDetails.keyvalues.price),
      maxTickets: parseInt(fileDetails.keyvalues.maxTickets)
    };
  } catch (error) {
    console.error('Error getting image metadata from Pinata:', error);
    if (error instanceof Error) {
      if (error.message.includes('not authenticated')) {
        throw new Error('Pinata authentication failed. Please check your JWT token.');
      }
    }
    throw error;
  }
} 