import { apiFetch } from '@/lib/api';
import type { BlockchainEventRow, BoatEvent } from '@/lib/boat.types';

export async function getBoatEvents(boatId: number): Promise<BlockchainEventRow[]> {
  return (await apiFetch(`/events/boat/${boatId}`)) as BlockchainEventRow[];
}

export async function createEvent(data: {
  boatId: number;
  kind: number;
  ipfsHash: string;
}): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as { success: boolean; txHash?: string };
}

export async function validateEvent(boatId: number, txHash: string): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch(`/events/${boatId}/${txHash}/validate`, {
    method: 'PUT',
  }) as { success: boolean; txHash?: string };
}

export async function getPendingEvents(): Promise<BlockchainEventRow[]> {
  return (await apiFetch('/events/pending')) as BlockchainEventRow[];
}

export function blockchainEventToUIEvent(event: BlockchainEventRow, boatId: number): BoatEvent {
  const kindMap = {
    0: { short: 'Vente', title: 'Changement de propriétaire' },
    1: { short: 'Réparation', title: 'Intervention atelier' },
    2: { short: 'Incident', title: 'Déclaration d\'incident' },
    3: { short: 'Inspection', title: 'Inspection / Contrôle' },
  };

  const kind = kindMap[event.kind as keyof typeof kindMap] || { short: 'Événement', title: 'Historique' };
  
  return {
    boatName: `Bateau #${boatId}`,
    date: new Date(event.ts).toLocaleDateString('fr-FR'),
    shortTitle: kind.short,
    title: kind.title,
    description: 'Événement blockchain enregistré',
    attachments: event.ipfs_hash ? [{
      title: 'Données blockchain',
      uri: event.ipfs_hash || ''
    }] : [],
  };
}