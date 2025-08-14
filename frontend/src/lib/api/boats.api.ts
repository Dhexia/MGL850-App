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
    body: JSON.stringify({ boatData }),
  }) as { ipfsHash: string };
}

export async function mintPassport(to: string, uri: string) {
  return await apiFetch('/boats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, uri }),
  });
}

export async function updateBoatURI(boatId: number, newUri: string) {
  return await apiFetch(`/boats/${boatId}/update-uri`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenId: boatId, newUri }),
  });
}

export async function uploadImages(images: Array<{ uri: string; name: string }>): Promise<{ images: Array<{ url: string; public_id: string }> }> {
  const formData = new FormData();
  
  images.forEach((image, index) => {
    // Generate a short, safe filename
    const timestamp = Date.now();
    const shortName = `boat_${timestamp}_${index}.jpg`;
    
    formData.append('images', {
      uri: image.uri,
      type: 'image/jpeg',
      name: shortName,
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

export async function certifyBoat(boatId: number): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch(`/boats/${boatId}/certify`, {
    method: 'POST',
  }) as { success: boolean; txHash?: string };
}

export async function revokeBoatCertification(boatId: number): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch(`/boats/${boatId}/revoke`, {
    method: 'POST',
  }) as { success: boolean; txHash?: string };
}

export async function getBoatCertificationStatus(boatId: number): Promise<{ status: 'validated' | 'pending' | 'rejected' }> {
  return await apiFetch(`/boats/${boatId}/status`) as { status: 'validated' | 'pending' | 'rejected' };
}