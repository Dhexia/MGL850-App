import { apiFetch } from '@/lib/api';
import type { BoatCertificate, BlockchainCertificateRow } from '@/lib/boat.types';

export async function getBoatCertificates(boatId: number): Promise<BlockchainCertificateRow[]> {
  return (await apiFetch(`/certificates/boat/${boatId}`)) as BlockchainCertificateRow[];
}

export async function createCertificate(data: {
  boatId: number;
  certType: number;
  issuer: string;
  expiresAt?: string;
  ipfsHash: string;
}): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch('/certificates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }) as { success: boolean; txHash?: string };
}

export async function validateCertificate(certificateId: string): Promise<{ success: boolean; txHash?: string }> {
  return await apiFetch(`/certificates/${certificateId}/validate`, {
    method: 'PUT',
  }) as { success: boolean; txHash?: string };
}

export async function getPendingCertificates(): Promise<BlockchainCertificateRow[]> {
  return (await apiFetch('/certificates/pending')) as BlockchainCertificateRow[];
}

export function blockchainCertificateToUICertificate(cert: BlockchainCertificateRow): BoatCertificate {
  const certTypeMap = {
    0: 'Assurance',
    1: 'Contrôle technique',
    2: 'Permis de navigation',
    3: 'Certification environnementale',
  };

  const certType = certTypeMap[cert.cert_type as keyof typeof certTypeMap] || 'Certificat';
  
  return {
    person: cert.issuer,
    date: new Date(cert.issued_at).toLocaleDateString('fr-FR'),
    title: certType,
    expires: cert.expires_at ? new Date(cert.expires_at).toLocaleDateString('fr-FR') : undefined,
    status: cert.validated ? 'validated' : 'pending',
    description: `Certificat émis par ${cert.issuer}`,
    attachments: cert.ipfs_hash ? [{
      title: 'Données certificat',
      uri: cert.ipfs_hash || ''
    }] : [],
  };
}