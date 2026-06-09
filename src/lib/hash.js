import crypto from 'node:crypto';
import { SECREAT_KEY } from '../config/globalKey.js';

const algorithm = 'aes-256-gcm';
const salt = "hash"; 

// ສ້າງ secretKey ຂະໜາດ 32 bytes ຈາກຄີຫຼັກໃນ config
const secretKey = crypto.scryptSync(SECREAT_KEY, salt, 32);

export const HashEncrypt = async (text) => {
    try {
        if (!text) throw new Error("No text provided for encryption");

        // ສຸ່ມ iv ໃໝ່ທຸກຄັ້ງທີ່ມີການເຂົ້າລະຫັດ (ບັງຄັບ 12 bytes ສາກົນສຳລັບ GCM)
        const iv = crypto.randomBytes(12);     

        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // ດຶງ authTag ອອກມາເພື່ອໃຊ້ກວດສອບຄວາມຖືກຕ້ອງຕອນຖອດລະຫັດ
        const authTag = cipher.getAuthTag().toString('hex'); 
        
        // ມັດລວມເປັນ String ດຽວ ຂັ້ນດ້ວຍ ":" ເພື່ອຄວາມງ່າຍໃນການເກັບລົງ Database
        return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error("Encryption Error:", error.message);
        throw error;
    }
}


export const Decrypt = async (fullEncryptedString) => {
    try {
        if (!fullEncryptedString) throw new Error("No encrypted string provided");

        // ແຍກ iv, authTag, ແລະ ຕົວຂໍ້ຄວາມລັອກ ອອກມາດ້ວຍ ເຄື່ອງໝາຍ ":"
        const parts = fullEncryptedString.split(':');
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted string format. Expected iv:authTag:cipherText");
        }

        const [ivHex, authTagHex, encryptedData] = parts;
        
        // ແປງຄ່າ Hex ກັບມາເປັນ Buffer ທີ່ Node.js crypto ຕ້ອງການ
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        
        // ຕິດ authTag ເຂົ້າໄປເພື່ອໃຫ້ AES-GCM ກວດສອບຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        // ຖ້າຂໍ້ມູນຖືກແກ້ໄຂ ຫຼື ຄີບໍ່ຖືກ ມັນຈະຕົກມາບ່ອນນີ້ (ປ້ອງກັນ Server ດັບ)
        console.error("Decryption Error (Data might be tampered or key is wrong):", error.message);
        return null; 
    }
}