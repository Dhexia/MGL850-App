// DTOs pour la structure modulaire des bateaux

export interface BoatSpecification {
  price: number;
  title: string;
  name: string;
  city: string;
  postal_code: string;
  year: number;
  overall_length: number;
  width: number;
  draft: number;
  engine: string;
  fresh_water_capacity: number;
  fuel_capacity: number;
  cabins: number;
  beds: number;
  boat_type: string;
  navigation_category: string;
  description: string;
  summary: string;
  status: 'validated' | 'pending' | 'rejected';
}

export interface BoatAttachment {
  title: string;
  uri: string;
}

export interface BoatCertificate {
  person: string;
  date: string;
  title: string;
  expires?: string;
  status: 'validated' | 'pending' | 'rejected';
  description: string;
  attachments: BoatAttachment[];
}

export interface BoatEvent {
  boatName: string;
  date: string;
  shortTitle: string;
  title: string;
  description: string;
  attachments: BoatAttachment[];
}

export interface BoatImage {
  uri: string;
}

// Structure complète IPFS
export interface BoatIPFSData {
  specification: BoatSpecification;
  certificates: BoatCertificate[];
  events: BoatEvent[];
  images: BoatImage[];
}

// Structure pour l'UI (identique à IPFS)
export interface UIBoat extends BoatIPFSData {
  id: number;
}

// DTO du formulaire frontend
export interface NewBoatFormData {
  price: number;
  title: string;
  name: string;
  year: number;
  port?: string;
  postalCode?: string;
  overall_length?: string;
  width?: string;
  draft?: string;
  engine?: string;
  fresh_water_capacity?: string;
  fuel_capacity?: string;
  cabins?: string;
  beds?: string;
  boat_type?: string;
  navigation_category?: string;
}

// DTO backend pour les bateaux indexés
export interface BoatRow {
  id: number;
  owner: string;
  tokenURI?: string;
  mintedAt?: string | null;
  blockNumber?: number | null;
  txHash?: string | null;
}

// DTO pour les événements blockchain
export interface BlockchainEventRow {
  boat_id: number;
  kind: number; // 0 Sale, 1 Repair, 2 Incident, 3 Inspection
  ts: string;   // ISO date
  author: string;
  ipfs_hash: string;
  tx_hash: string;
  block_number: number;
}