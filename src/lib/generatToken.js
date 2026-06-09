import { SECREAT_KEY, SECREAT_KEY_REFRESH } from "../config/globalKey.js";
import jwt from "jsonwebtoken";
export const GenerateToken = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const payload = {
                id: data
            }
            const payload_refresh = {
                id: payload.id
            }
            const token = jwt.sign(payload, SECREAT_KEY, { expiresIn: "1h" });
            const refreshToken = jwt.sign(payload_refresh, SECREAT_KEY_REFRESH, { expiresIn: "3h" });
            return resolve({ token, refreshToken });
        } catch (error) {
            return reject(error);
        }
    })
}