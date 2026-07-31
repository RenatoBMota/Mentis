import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  function buildService(): CryptoService {
    const key = randomBytes(32).toString('base64');
    const config = { getOrThrow: () => key } as unknown as ConfigService;
    const service = new CryptoService(config);
    service.onModuleInit();
    return service;
  }

  it('encrypts and decrypts back to the original plain text', () => {
    const service = buildService();
    const plainText = 'Relato de evolução com dados clínicos sensíveis.';

    const encrypted = service.encrypt(plainText);

    expect(encrypted).not.toContain(plainText);
    expect(service.decrypt(encrypted)).toBe(plainText);
  });

  it('produces a different ciphertext for the same plain text (random IV)', () => {
    const service = buildService();
    const plainText = 'Mesmo conteúdo, duas cifragens diferentes.';

    expect(service.encrypt(plainText)).not.toBe(service.encrypt(plainText));
  });

  it('returns undefined for optional empty values without touching the crypto', () => {
    const service = buildService();

    expect(service.encryptOptional(undefined)).toBeUndefined();
    expect(service.encryptOptional(null)).toBeUndefined();
    expect(service.decryptOptional(undefined)).toBeUndefined();
  });

  it('throws when the payload is malformed', () => {
    const service = buildService();
    expect(() => service.decrypt('not-a-valid-payload')).toThrow('ENCRYPTED_PAYLOAD_MALFORMED');
  });

  it('fails to decrypt with a different key (authenticity check)', () => {
    const serviceA = buildService();
    const serviceB = buildService();
    const encrypted = serviceA.encrypt('conteúdo confidencial');

    expect(() => serviceB.decrypt(encrypted)).toThrow();
  });
});
