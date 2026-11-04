// REXXALLFINANCE END-TO-END ENCRYPTION UTILITIES
class RexxCrypto {
    static async generateKey(passphrase, salt = 'rexxall_salt_2026') {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw", enc.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]
        );
        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode(salt),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    }

    static async encryptData(dataObject, passphrase) {
        try {
            const key = await this.generateKey(passphrase);
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const enc = new TextEncoder();
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: iv },
                key,
                enc.encode(JSON.stringify(dataObject))
            );
            return {
                iv: Array.from(iv),
                ciphertext: Array.from(new Uint8Array(encrypted))
            };
        } catch(e) {
            console.error('Encryption failed:', e);
            return null;
        }
    }
}
