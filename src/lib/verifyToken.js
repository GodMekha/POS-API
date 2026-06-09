import jwt from "jsonwebtoken";
import { EMessage } from "../service/message.js";
import { SECREAT_KEY, SECREAT_KEY_REFRESH } from "../config/globalKey.js";
import prisma from "../config/prisma.js";

export const VerifyToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(token, SECREAT_KEY, async (err, decode) => {
                if (err) return reject(err);

                const data = await prisma.user.findFirst({ where: { user_id: decode.id } });
                if (!data) return reject(EMessage.NotFound);
                return resolve(data);
            })
        } catch (error) {
            return reject(error)
        }
    })
}
export const VerifyRefreshToken = async (refreshToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            jwt.verify(refreshToken, SECREAT_KEY_REFRESH, async (err, decode) => {
                if (err) return reject(err);

                const data = await prisma.user.findFirst({ where: { user_id: decode.id } });
                if (!data) return reject(EMessage.NotFound);
                return resolve(data);
            })
        } catch (error) {
            return reject(error)
        }
    })
}