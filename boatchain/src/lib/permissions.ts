import { useAuth } from '@/contexts/AuthContext';
import { canUserEditBoat, getUserPermissions } from './api/mock-interceptor';
import { PlatformUtils } from './platform-utils';
import type { UIBoat } from './boat.types';

// Hook pour vérifier si l'utilisateur peut modifier un bateau
export function useCanEditBoat(boat: UIBoat) {
  const { address, userRole, isMockMode } = useAuth();
  
  if (!address) return false;
  
  // En mode mock, utiliser la logique mock
  if (isMockMode) {
    return canUserEditBoat(boat.id, address);
  }
  
  // En mode normal, vérifier si l'utilisateur est le propriétaire
  return boat.specification.owner_id?.toLowerCase() === address.toLowerCase();
}

// Hook pour les permissions générales de l'utilisateur
export function useUserPermissions() {
  const { address, userRole, isMockMode } = useAuth();
  
  if (!address) {
    return {
      canAddBoats: false,
      canEditOwnBoats: false,
      canCertify: false,
      role: 'standard_user' as const
    };
  }
  
  // En mode mock, utiliser la logique mock
  if (isMockMode) {
    return getUserPermissions(address);
  }
  
  // En mode normal, utiliser le rôle de l'auth
  return {
    canAddBoats: userRole === 'standard_user',
    canEditOwnBoats: userRole === 'standard_user', 
    canCertify: userRole === 'certifier',
    role: userRole
  };
}

// Fonction utilitaire pour vérifier si on est en mode test
export function isTestMode(): boolean {
  return PlatformUtils.canUseMockMode;
}

// Fonction pour obtenir le nom d'affichage de l'utilisateur connecté
export function useCurrentUserDisplayName(): string {
  const { address, isMockMode } = useAuth();
  
  if (!address) return 'Utilisateur inconnu';
  
  if (isMockMode) {
    // Trouver le nom dans les comptes de test
    const testAccounts = [
      { address: '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8', name: 'Alex Martin' },
      { address: '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E', name: 'Bureau Veritas' },
      { address: '0x8ba1f109551bD432803012645Hac136c30000000', name: 'Sophie Durand' }
    ];
    
    const testAccount = testAccounts.find(
      acc => acc.address.toLowerCase() === address.toLowerCase()
    );
    
    return testAccount?.name || `Utilisateur ${address.slice(0, 6)}...`;
  }
  
  return `Utilisateur ${address.slice(0, 6)}...${address.slice(-4)}`;
}