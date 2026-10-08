export interface TenantUserLink {
  tenantId: string;
  userId: string;
  providedIdentifiers: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  };
  createdAt: string; // ISO date
}

export interface IdentityMatch {
  type: 'new' | 'existing' | 'conflict';
  userId?: string; // set for 'new' and 'existing'
  candidateIds?: string[]; // set for 'conflict' (email->userA, phone->userB)
}
