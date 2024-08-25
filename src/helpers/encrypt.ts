import crypto from "crypto";
// Define encryption functions

export const encryptField = (text: any) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("Encryption key is not defined.");
  }
  const key = crypto.scryptSync(
    Buffer.from(encryptionKey, "binary"),
    "salt",
    32
  );
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encryptedText = cipher.update(text, "utf8", "hex");
  encryptedText += cipher.final("hex");
  return encryptedText;
};

export const decryptField = (encryptedText: any) => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("Encryption key is not defined.");
  }
  const key = crypto.scryptSync(
    Buffer.from(encryptionKey, "binary"),
    "salt",
    32
  );
  const iv = Buffer.alloc(16, 0);
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decryptedText = decipher.update(encryptedText, "hex", "utf8");
  decryptedText += decipher.final("utf8");
  return decryptedText;
};
