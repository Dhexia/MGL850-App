import { apiFetch } from '@/lib/api';
import type { BoatRow, BoatIPFSData } from '@/lib/boat.types';

export async function listBoats(): Promise<BoatRow[]> {
  return (await apiFetch('/boats')) as BoatRow[];
}

export async function getBoat(id: number): Promise<BoatRow & { exists?: boolean }> {
  return (await apiFetch(`/boats/${id}`)) as any;
}

export async function uploadBoatDataToIPFS(boatData: BoatIPFSData): Promise<{ ipfsHash: string }> {
  return await apiFetch('/documents/upload-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boatData),
  }) as { ipfsHash: string };
}

export async function mintPassport(to: string, uri: string) {
  return await apiFetch('/boats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, uri }),
  });
}

export async function uploadImages(images: Array<{ uri: string; name: string }>): Promise<{ images: Array<{ url: string; public_id: string }> }> {
  const formData = new FormData();
  
  images.forEach((image, index) => {
    formData.append('images', {
      uri: image.uri,
      type: 'image/jpeg',
      name: image.name || `image_${index}.jpg`,
    } as any);
  });

  return await apiFetch('/boats/upload/images', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as { images: Array<{ url: string; public_id: string }> };
}