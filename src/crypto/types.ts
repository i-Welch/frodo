export interface EncryptedField {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded IV */
  iv: string;
  /** Base64-encoded auth tag (GCM) */
  authTag: string;
}

export interface UserDek {
  /** Base64-encoded encrypted DEK (encrypted by KMS CMK) */
  encryptedDek: string;
}
