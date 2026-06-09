import { EMessage } from "./message.js";

export const FindOneUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {

            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) {
                return reject(EMessage.NotFound);
            }
            return resolve(data)
        } catch (error) {
            return reject(error)
        }
    })
}