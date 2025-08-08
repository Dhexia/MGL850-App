export enum EventKind {
  SALE = 0,
  REPAIR = 1,
  INCIDENT = 2,
  INSPECTION = 3,
}

export enum Status {
  VALIDATED = 'validated',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SUSPICIOUS = 'suspicious',
}

export enum CertificateType {
  SAFETY = 'safety',
  INSURANCE = 'insurance', 
  TECHNICAL = 'technical',
  INSPECTION = 'inspection',
}