import { useAuth } from '@/contexts/AuthContext';
import type { UIBoat } from './boat.types';

// Hook pour vérifier si l'utilisateur peut modifier un bateau
export function useCanEditBoat(boat: UIBoat) {
  const { address } = useAuth();
  
  if (!address) return false;
  
  // Vérifier si l'utilisateur est le propriétaire
  return boat.specification.owner_id?.toLowerCase() === address.toLowerCase();
}

// Hook pour les permissions générales de l'utilisateur
export function useUserPermissions() {
  const { address, userRole } = useAuth();
  
  if (!address) {
    return {
      canAddBoats: false,
      canEditOwnBoats: false,
      canCertify: false,
      role: 'standard_user' as const
    };
  }
  
  // Utiliser le rôle de l'auth
  return {
    canAddBoats: userRole === 'standard_user',
    canEditOwnBoats: userRole === 'standard_user', 
    canCertify: userRole === 'certifier',
    role: userRole
  };
}

// Fonction pour obtenir le nom d'affichage de l'utilisateur connecté
export function useCurrentUserDisplayName(): string {
  const { address } = useAuth();
  
  if (!address) return 'Utilisateur inconnu';
  
  return `Utilisateur ${address.slice(0, 6)}...${address.slice(-4)}`;
}