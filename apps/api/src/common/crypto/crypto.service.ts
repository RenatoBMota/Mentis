import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;
const KEY_LENGTH_BYTES = 32;

/**
 * Criptografia de campo (AES-256-GCM) para dados sensíveis em repouso —
 * PRD 11.1: evolutionText/stepsText do prontuário e anexos.
 *
 * Formato de saída (string única, persistível em coluna text):
 *   base64(iv) + '.' + base64(authTag) + '.' + base64(ciphertext)
 *
 * A chave vem de ENCRYPTION_KEY (32 bytes em base64). Em produção, deve ser
 * gerida por um cofre de segredos dedicado (PRD 11.1), não em .env versionado.
 */
@Injectable()
export class CryptoService implements OnModuleInit {
  private key!: Buffer;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const encoded = this.config.getOrThrow<string>('ENCRYPTION_KEY');
    const key = Buffer.from(encoded, 'base64');
    if (key.length !== KEY_LENGTH_BYTES) {
      throw new Error(
        `ENCRYPTION_KEY deve ter ${KEY_LENGTH_BYTES} bytes em base64 (recebido: ${key.length})`,
      );
    }
    this.key = key;
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(
      '.',
    );
  }

  decrypt(payload: string): string {
    const [ivB64, authTagB64, ciphertextB64] = payload.split('.');
    if (!ivB64 || !authTagB64 || !ciphertextB64) {
      throw new Error('ENCRYPTED_PAYLOAD_MALFORMED');
    }

    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

    const plainText = Buffer.concat([
      decipher.update(Buffer.from(ciphertextB64, 'base64')),
      decipher.final(),
    ]);

    return plainText.toString('utf8');
  }

  /** Encripta apenas quando há valor — útil para campos opcionais (stepsText). */
  encryptOptional(plainText?: string | null): string | undefined {
    return plainText == null ? undefined : this.encrypt(plainText);
  }

  decryptOptional(payload?: string | null): string | undefined {
    return payload == null ? undefined : this.decrypt(payload);
  }

  /**
   * Mesmo esquema AES-256-GCM de encrypt/decrypt, mas para conteúdo binário
   * (arquivos da Biblioteca Digital) — layout em bytes em vez de string
   * base64, gravado direto em disco: iv (12 bytes) + authTag (16 bytes) + ciphertext.
   */
  encryptBuffer(plainBuffer: Buffer): Buffer {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([iv, authTag, ciphertext]);
  }

  decryptBuffer(payload: Buffer): Buffer {
    const iv = payload.subarray(0, IV_LENGTH_BYTES);
    const authTag = payload.subarray(IV_LENGTH_BYTES, IV_LENGTH_BYTES + 16);
    const ciphertext = payload.subarray(IV_LENGTH_BYTES + 16);

    const decipher = createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}
