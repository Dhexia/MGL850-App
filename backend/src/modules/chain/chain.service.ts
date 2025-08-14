import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, ZeroAddress } from 'ethers';
import { getDevAccountByAddress, isDevMode } from '../../lib/dev-accounts';

import {
  BoatEvents__factory,
  BoatPassport__factory,
  RoleRegistry__factory,
  BoatCertificate__factory,
} from '../../abi/factories/contracts';
import {
  BoatEvents,
  BoatPassport,
  RoleRegistry,
  BoatCertificate,
} from '../../abi/contracts';

@Injectable()
export class ChainService {
  private readonly log = new Logger(ChainService.name);

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;
  private readonly devSigners: Map<string, ethers.Wallet> = new Map();

  private readonly boatEvents: BoatEvents;
  private readonly boatPassport: BoatPassport;
  private readonly roleRegistry: RoleRegistry;
  private readonly boatCertificate: BoatCertificate;

  constructor(private readonly cfg: ConfigService) {
    // lecture / écriture
    this.provider = new ethers.JsonRpcProvider(
      this.cfg.getOrThrow<string>('SEPOLIA_RPC_URL'),
    );
    this.signer = new ethers.Wallet(
      this.cfg.getOrThrow<string>('PRIVATE_KEY'),
      this.provider,
    );

    // Initialiser les signers des comptes de développement
    if (isDevMode()) {
      this.initializeDevSigners();
    }

    // contrats (lecture via provider; écriture via connect(signer))
    this.boatEvents = BoatEvents__factory.connect(
      this.cfg.getOrThrow<string>('BOAT_EVENTS_ADDRESS'),
      this.provider,
    );
    this.boatPassport = BoatPassport__factory.connect(
      this.cfg.getOrThrow<string>('BOAT_PASSPORT_ADDRESS'),
      this.provider,
    );
    this.roleRegistry = RoleRegistry__factory.connect(
      this.cfg.getOrThrow<string>('ROLE_REGISTRY_ADDRESS'),
      this.provider,
    );
    this.boatCertificate = BoatCertificate__factory.connect(
      this.cfg.getOrThrow<string>('BOAT_CERTIFICATE_ADDRESS'),
      this.provider,
    );
  }

  private initializeDevSigners() {
    const { DEV_ACCOUNTS } = require('../../lib/dev-accounts');
    for (const account of DEV_ACCOUNTS) {
      const wallet = new ethers.Wallet(account.privateKey, this.provider);
      this.devSigners.set(account.address.toLowerCase(), wallet);
      this.log.debug(`Initialized dev signer for ${account.name} (${account.address})`);
    }
  }

  // Obtenir le bon signer selon le contexte (dev account ou default)
  private getSigner(forAddress?: string): ethers.Wallet {
    if (isDevMode() && forAddress) {
      const devSigner = this.devSigners.get(forAddress.toLowerCase());
      if (devSigner) {
        this.log.debug(`Using dev signer for address: ${forAddress}`);
        return devSigner;
      }
    }
    return this.signer;
  }

  /* ================= LECTURE ================= */

  async getHistory(boatId: number) {
    const total = await this.boatEvents.eventCount(boatId);
    const events = [];
    for (let i = 0; i < total; i++) {
      events.push(await this.boatEvents.eventByIndex(boatId, i));
    }
    return events;
  }

  async isCertifiedProfessional(address: string) {
    // En mode développement, vérifier d'abord les comptes de dev
    if (isDevMode()) {
      const devAccount = getDevAccountByAddress(address);
      if (devAccount && devAccount.role === 'certifier') {
        this.log.debug(`Dev mode: ${address} is certified professional (${devAccount.name})`);
        return true;
      }
    }
    
    // Vérification on-chain pour les comptes réels
    return this.roleRegistry.isProfessional(address);
  }

  async boatExists(boatId: number) {
    try {
      await this.boatPassport.ownerOf(boatId);
      return true;
    } catch {
      return false;
    }
  }

  async getOwner(boatId: number) {
    return this.boatPassport.ownerOf(boatId);
  }

  async isOwner(boatId: number, caller: string) {
    return (await this.getOwner(boatId)).toLowerCase() === caller.toLowerCase();
  }

  async isStandardUser(caller: string) {
    return this.roleRegistry.isStandardUser(caller);
  }

  async getUserRole(caller: string): Promise<'standard_user' | 'certifier'> {
    if (await this.isCertifiedProfessional(caller)) {
      return 'certifier';
    }
    return 'standard_user';
  }

  async tokenURI(boatId: number) {
    try {
      return await this.boatPassport.tokenURI(boatId);
    } catch {
      return undefined;
    }
  }

  /* ================= ÉCRITURE ================= */

  /** Mint un passeport et retourne { txHash, tokenId } */
  async mintPassport(to: string, uri: string, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const tx = await this.boatPassport.connect(signer).mint(to, uri);
    this.log.log(`mint tx sent: ${tx.hash} → to=${to}`);
    const receipt = await tx.wait();
    // parse log Transfer(from=0x0, to, tokenId)
    const topic = this.boatPassport.interface.getEvent('Transfer').topicHash;
    const tf = receipt.logs.find((l) => l.topics?.[0] === topic);
    if (!tf) {
      this.log.warn(`mint receipt has no Transfer log: tx=${tx.hash}`);
      return { txHash: tx.hash };
    }
    const parsed = this.boatPassport.interface.parseLog(tf);
    const from = (parsed.args[0] as string).toLowerCase();
    const toAddr = (parsed.args[1] as string).toLowerCase();
    const tokenId = parsed.args[2].toString();
    if (from !== ZeroAddress) {
      this.log.warn(
        `Transfer not mint (from!=0x0): tx=${tx.hash}, from=${from}`,
      );
    }
    this.log.log(`mint success: tokenId=${tokenId}, to=${toAddr}`);
    return { txHash: tx.hash, tokenId };
  }

  /** Brûle un passeport et retourne { txHash } */
  async burnPassport(tokenId: number, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const tx = await this.boatPassport.connect(signer).burn(tokenId);
    this.log.log(`burn tx sent: ${tx.hash} → tokenId=${tokenId}`);
    await tx.wait();
    this.log.log(`burn success: tokenId=${tokenId}`);
    return { txHash: tx.hash };
  }

  /** Met à jour le tokenURI d'un passeport et retourne { txHash } */
  async updateTokenURI(tokenId: number, newUri: string, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    
    // Force gas limit pour éviter l'estimation qui échoue
    const tx = await this.boatPassport.connect(signer).setTokenURI(tokenId, newUri, {
      gasLimit: 200000n // Gas fixe élevé
    });
    
    this.log.log(`updateTokenURI tx sent: ${tx.hash} → tokenId=${tokenId}, newUri=${newUri}`);
    await tx.wait();
    this.log.log(`updateTokenURI success: tokenId=${tokenId}`);
    return { txHash: tx.hash };
  }

  /** Ajoute un événement on-chain et retourne { txHash } */
  async addEventTx(boatId: number, kind: number, ipfsHash: string, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const tx = await this.boatEvents
      .connect(signer)
      .addEvent(boatId, kind, ipfsHash);
    this.log.log(`addEvent tx sent: ${tx.hash} → boat=${boatId}, kind=${kind}`);
    return { txHash: tx.hash };
  }

  /* ================= CERTIFICATS ================= */

  /**
   * Émet un certificat on-chain
   */
  async issueCertificate(
    boatId: number,
    certificateType: string,
    ipfsHash: string,
    expiresAt: number = 0,
    fromAddress?: string,
  ) {
    const signer = this.getSigner(fromAddress);
    const contract = this.boatCertificate.connect(signer);
    const tx = await contract.issueCertificate(boatId, certificateType, ipfsHash, expiresAt);
    
    this.log.log(`issueCertificate tx sent: ${tx.hash} → boat=${boatId}, type=${certificateType}`);
    return { txHash: tx.hash };
  }

  /**
   * Valide un certificat on-chain
   */
  async validateCertificateOnChain(certificateId: number, isValid: boolean, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const contract = this.boatCertificate.connect(signer);
    const tx = await contract.validateCertificate(certificateId, isValid);
    
    this.log.log(`validateCertificate tx sent: ${tx.hash} → cert=${certificateId}, valid=${isValid}`);
    return { txHash: tx.hash };
  }

  /**
   * Récupère un certificat depuis la blockchain
   */
  async getCertificate(certificateId: number) {
    return this.boatCertificate.getCertificate(certificateId);
  }

  /**
   * Récupère tous les certificats d'un bateau
   */
  async getBoatCertificates(boatId: number) {
    return this.boatCertificate.getBoatCertificates(boatId);
  }

  /**
   * Vérifie si un certificat est valide
   */
  async isCertificateValid(certificateId: number): Promise<boolean> {
    return this.boatCertificate.isCertificateValid(certificateId);
  }

  /**
   * Certifie un bateau en créant un certificat de validation générale
   */
  async certifyBoat(boatId: number, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const contract = this.boatCertificate.connect(signer);
    
    // Créer un certificat de type "validation_generale" 
    const tx = await contract.issueCertificate(
      boatId,
      "validation_generale", 
      "certified", // IPFS hash simple pour indiquer la certification
      0 // Pas d'expiration
    );
    
    this.log.log(`certifyBoat tx sent: ${tx.hash} → boat=${boatId}`);
    const receipt = await tx.wait();
    
    // Récupérer l'ID du certificat depuis l'event
    const event = receipt.logs.find(log => {
      try {
        const parsed = this.boatCertificate.interface.parseLog(log);
        return parsed.name === 'CertificateIssued';
      } catch {
        return false;
      }
    });
    
    let certificateId = null;
    if (event) {
      const parsed = this.boatCertificate.interface.parseLog(event);
      certificateId = parsed.args[0].toString();
      
      // Valider automatiquement le certificat
      const validateTx = await contract.validateCertificate(certificateId, true);
      await validateTx.wait();
      this.log.log(`Certificate ${certificateId} validated for boat ${boatId}`);
    }
    
    return { txHash: tx.hash, certificateId };
  }

  /**
   * Transfère la propriété d'un bateau NFT
   */
  async transferBoatOwnership(tokenId: number, toAddress: string, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const contract = this.boatPassport.connect(signer);
    
    // Obtenir l'adresse du propriétaire actuel
    const currentOwner = await contract.ownerOf(tokenId);
    
    // Effectuer le transfert
    const tx = await contract.transferFrom(currentOwner, toAddress, tokenId);
    
    this.log.log(`transferBoatOwnership tx sent: ${tx.hash} → boat=${tokenId} from=${currentOwner} to=${toAddress}`);
    return { txHash: tx.hash, from: currentOwner, to: toAddress };
  }

  /**
   * Révoque la certification d'un bateau
   */
  async revokeBoatCertification(boatId: number, fromAddress?: string) {
    const signer = this.getSigner(fromAddress);
    const contract = this.boatCertificate.connect(signer);
    
    // Récupérer tous les certificats du bateau
    const certificateIds = await contract.getBoatCertificates(boatId);
    
    let revokedCount = 0;
    let lastTxHash = '';
    
    // Révoquer tous les certificats de validation générale
    for (const certId of certificateIds) {
      const cert = await contract.getCertificate(certId);
      if (cert.certificateType === "validation_generale" && cert.isValid) {
        const tx = await contract.revokeCertificate(certId);
        await tx.wait();
        lastTxHash = tx.hash;
        revokedCount++;
        this.log.log(`Certificate ${certId} revoked for boat ${boatId}`);
      }
    }
    
    return { txHash: lastTxHash, revokedCount };
  }

  /**
   * Vérifie si un bateau est certifié (a au moins un certificat de validation valide)
   */
  async isBoatCertified(boatId: number): Promise<boolean> {
    try {
      const certificateIds = await this.boatCertificate.getBoatCertificates(boatId);
      
      for (const certId of certificateIds) {
        const cert = await this.boatCertificate.getCertificate(certId);
        if (cert.certificateType === "validation_generale" && cert.isValid) {
          // Vérifier si le certificat n'est pas expiré
          const isValid = await this.boatCertificate.isCertificateValid(certId);
          if (isValid) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      this.log.warn(`Error checking boat ${boatId} certification: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtient le statut de certification d'un bateau
   */
  async getBoatCertificationStatus(boatId: number): Promise<'validated' | 'pending' | 'rejected'> {
    try {
      const isCertified = await this.isBoatCertified(boatId);
      if (isCertified) {
        return 'validated';
      }
      
      // Vérifier s'il y a des certificats en attente ou rejetés
      const certificateIds = await this.boatCertificate.getBoatCertificates(boatId);
      
      let hasPending = false;
      let hasRejected = false;
      
      for (const certId of certificateIds) {
        const cert = await this.boatCertificate.getCertificate(certId);
        if (cert.certificateType === "validation_generale") {
          if (cert.validatedAt.toString() === '0') {
            hasPending = true;
          } else if (!cert.isValid) {
            hasRejected = true;
          }
        }
      }
      
      if (hasRejected) return 'rejected';
      if (hasPending) return 'pending';
      
      return 'pending'; // Par défaut
    } catch (error) {
      this.log.warn(`Error getting boat ${boatId} status: ${error.message}`);
      return 'pending';
    }
  }
}
