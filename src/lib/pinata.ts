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

export interface EventMetadata {
  name: string;
  description: string;
  location: string;
  category: string;
  eventDate: number;
  price: number;
  maxTickets: number;
  additionalInfo?: {
    [key: string]: string;
  };
}

export async function uploadEventImage(
  file: File,
  metadata: EventImageMetadata
): Promise<string> {
  try {
    // Convert file to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
    });
    reader.readAsDataURL(file);
    const base64Data = await base64Promise;

    // Upload through API route
    const response = await fetch('/api/pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'uploadImage',
        data: {
          file: base64Data,
          metadata,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const { cid } = await response.json();
    return cid;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}

export async function uploadEventMetadata(
  metadata: EventMetadata
): Promise<string> {
  try {
    const response = await fetch('/api/pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'uploadMetadata',
        data: {
          metadata,
          category: metadata.category,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to upload metadata');
    }

    const { cid } = await response.json();
    return cid;
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    throw error;
  }
}

export async function getEventImage(cid: string): Promise<string> {
  try {
    if (!cid) {
      return '/placeholder-event.jpg';
    }

    const gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY || '';
    const baseUrl = gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanCid = cid.replace(/^\//, '');
    
    return `${cleanBaseUrl}/ipfs/${cleanCid}`;
  } catch (error) {
    console.error('Error getting image from Pinata:', error);
    throw error;
  }
}

export async function getEventMetadata(cid: string): Promise<EventMetadata> {
  try {
    const response = await fetch('/api/pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getMetadata',
        data: { cid },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get metadata');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting metadata from Pinata:', error);
    throw error;
  }
}

export async function searchSimilarEvents(
  category: string,
  query: string,
  limit: number = 5
): Promise<EventMetadata[]> {
  try {
    const response = await fetch('/api/pinata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'searchSimilarEvents',
        data: {
          category,
          query,
          limit,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to search similar events');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching similar events:', error);
    throw error;
  }
} 