import crypto from "node:crypto";

export const hashing = (data: string) => {
    return crypto.createHash("sha256").update(data).digest("hex")
} 