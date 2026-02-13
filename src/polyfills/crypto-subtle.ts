/**
 * Polyfill crypto.subtle for Hermes (React Native)
 * Implements Ed25519 + SHA-256 digest using @noble/curves and expo-crypto
 */
import { ed25519 } from '@noble/curves/ed25519';
import { digest as expoDigest } from 'expo-crypto';

const ED25519_ALGO = 'Ed25519';

// PKCS#8 header for Ed25519 private keys (16 bytes)
const PKCS8_HEADER = new Uint8Array([
    0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06,
    0x03, 0x2b, 0x65, 0x70, 0x04, 0x22, 0x04, 0x20,
]);

function toUint8Array(data: BufferSource): Uint8Array {
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

function getAlgoName(algorithm: string | { name: string }): string {
    return typeof algorithm === 'string' ? algorithm : algorithm.name;
}

// Fake CryptoKey wrapper
class PolyfillCryptoKey {
    readonly type: 'public' | 'private';
    readonly extractable: boolean;
    readonly algorithm: { name: string };
    readonly usages: string[];
    readonly _bytes: Uint8Array; // raw key bytes

    constructor(type: 'public' | 'private', bytes: Uint8Array, extractable: boolean, usages: string[]) {
        this.type = type;
        this._bytes = bytes;
        this.extractable = extractable;
        this.algorithm = { name: ED25519_ALGO };
        this.usages = usages;
    }
}

async function importKey(
    format: string,
    keyData: BufferSource | JsonWebKey,
    algorithm: string | { name: string },
    extractable: boolean,
    keyUsages: string[],
): Promise<PolyfillCryptoKey> {
    const algoName = getAlgoName(algorithm);
    if (algoName !== ED25519_ALGO) {
        throw new Error(`Unsupported algorithm: ${algoName}`);
    }

    if (format === 'raw') {
        // Public key import (32 bytes)
        const bytes = toUint8Array(keyData as BufferSource);
        return new PolyfillCryptoKey('public', bytes, extractable, keyUsages as string[]);
    }

    if (format === 'pkcs8') {
        // Private key import — strip PKCS#8 header to get 32-byte seed
        const bytes = toUint8Array(keyData as BufferSource);
        const seed = bytes.slice(PKCS8_HEADER.length);
        return new PolyfillCryptoKey('private', seed, extractable, keyUsages as string[]);
    }

    if (format === 'jwk') {
        const jwk = keyData as JsonWebKey;
        if (jwk.d) {
            // Private key
            const seed = base64UrlDecode(jwk.d);
            return new PolyfillCryptoKey('private', seed, extractable, keyUsages as string[]);
        } else if (jwk.x) {
            // Public key
            const pubBytes = base64UrlDecode(jwk.x);
            return new PolyfillCryptoKey('public', pubBytes, extractable, keyUsages as string[]);
        }
        throw new Error('JWK must have d (private) or x (public)');
    }

    throw new Error(`Unsupported format: ${format}`);
}

async function exportKey(format: string, key: PolyfillCryptoKey): Promise<ArrayBuffer | JsonWebKey> {
    if (!key.extractable) {
        throw new Error('Key is not extractable');
    }

    if (format === 'raw') {
        if (key.type === 'public') {
            return key._bytes.buffer.slice(key._bytes.byteOffset, key._bytes.byteOffset + key._bytes.byteLength);
        }
        throw new Error('Cannot export private key as raw');
    }

    if (format === 'jwk') {
        if (key.type === 'private') {
            const pubBytes = ed25519.getPublicKey(key._bytes);
            return {
                crv: 'Ed25519',
                d: base64UrlEncode(key._bytes),
                x: base64UrlEncode(pubBytes),
                kty: 'OKP',
                ext: key.extractable,
                key_ops: key.usages,
            };
        } else {
            return {
                crv: 'Ed25519',
                x: base64UrlEncode(key._bytes),
                kty: 'OKP',
                ext: key.extractable,
                key_ops: key.usages,
            };
        }
    }

    throw new Error(`Unsupported export format: ${format}`);
}

async function sign(
    algorithm: string | { name: string },
    key: PolyfillCryptoKey,
    data: BufferSource,
): Promise<ArrayBuffer> {
    if (key.type !== 'private') throw new Error('Key must be a private key');
    const message = toUint8Array(data);
    const sig = ed25519.sign(message, key._bytes);
    return sig.buffer.slice(sig.byteOffset, sig.byteOffset + sig.byteLength);
}

async function verify(
    algorithm: string | { name: string },
    key: PolyfillCryptoKey,
    signature: BufferSource,
    data: BufferSource,
): Promise<boolean> {
    if (key.type !== 'public') throw new Error('Key must be a public key');
    const sig = toUint8Array(signature);
    const message = toUint8Array(data);
    return ed25519.verify(sig, message, key._bytes);
}

async function generateKey(
    algorithm: string | { name: string },
    extractable: boolean,
    keyUsages: string[],
): Promise<{ publicKey: PolyfillCryptoKey; privateKey: PolyfillCryptoKey }> {
    const seed = new Uint8Array(32);
    crypto.getRandomValues(seed);
    const pubBytes = ed25519.getPublicKey(seed);

    return {
        publicKey: new PolyfillCryptoKey('public', pubBytes, true, ['verify']),
        privateKey: new PolyfillCryptoKey('private', seed, extractable, ['sign']),
    };
}

async function digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer> {
    // expo-crypto expects "SHA-256" format
    const algoName = typeof algorithm === 'string' ? algorithm : (algorithm as any).name;
    const bytes = toUint8Array(data);
    const result = await expoDigest(algoName as any, bytes);
    return result;
}

// Base64url helpers
function base64UrlEncode(bytes: Uint8Array): string {
    const binary = String.fromCharCode(...bytes);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Install polyfill
export function installCryptoSubtlePolyfill() {
    if (typeof globalThis.crypto === 'undefined') {
        (globalThis as any).crypto = {};
    }
    if (!globalThis.crypto.subtle) {
        (globalThis.crypto as any).subtle = {
            importKey,
            exportKey,
            sign,
            verify,
            generateKey,
            digest,
        };
    }
}
