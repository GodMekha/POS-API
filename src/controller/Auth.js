import { ValidateData } from "../service/validate.js";
import { resError, resSuccess } from "../service/response.js";
import { EMessage, SMessage } from "../service/message.js";
import prisma from "../config/prisma.js"
import { Decrypt, HashEncrypt } from "../lib/hash.js";
import { GenerateToken } from "../lib/generatToken.js";

export default class AuthController {
    static async getAll(req, res) {
        try {
            const {
                page = 1, limit = 15, search, startDate, endDate, status
            } = req.query;
            const query = {};

            if (search) {
                query.OR = [
                    { username: { contains: search } },
                    ...(!isNaN(search)
                        ? [{ phoneNumber: Number(search) }]
                        : [])
                ];
            }
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }

            if (status) {
                query.role = status;
            }
            const user = await prisma.user.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!user) return resError(res, 404, EMessage.NotFound);
          
            const count = await prisma.user.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));
           const safeUsers = user.map(({ password, ...rest }) => rest);
            return resSuccess(res, SMessage.getAll, { data: safeUsers, totalPage })
        } catch (error) {
            console.error("Get all Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async getOne(req, res) {
        try {
            const user_id = req.params.user_id;

            const data = await prisma.user.findFirst({ where: { user_id: user_id } });
            if (!data) return resError(res, 404, EMessage.NotFound);
            data.password = undefined;
            return resSuccess(res, SMessage.getOne, data)
        } catch (error) {
            console.error("Get One Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error);
        }
    }
    static async Login(req, res) {
        try {
            const { password, phoneNumber } = req.body;
            const validate = await ValidateData({ password, phoneNumber });
            if (validate.length > 0) {
                return resError(res, 400, EMessage.BadRequest, validate.join(", "));
            }
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phoneNumber: parseInt(phoneNumber) }
                    ]
                }
            });
            if (!user) {
                return resError(res, 400, "Phone number Not Found");
            }
            const decrypPassowrd = await Decrypt(user.password);
            if (decrypPassowrd !== password) {
                return resError(res, 400, EMessage.BadRequest);
            }
            const tokens = await GenerateToken(user.id);
            const data = Object.assign(
                JSON.parse(JSON.stringify(user)),
                JSON.parse(JSON.stringify(tokens)),
            );
            data.password = undefined;
            data.role = undefined;
            return resSuccess(res, SMessage.Login, data)
        } catch (error) {
            console.error("Login Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async Register(req, res) {
        try {
            const { username, password, phoneNumber } = req.body;
            const validate = await ValidateData({ username, password, phoneNumber });
            if (validate.length > 0) {
                return resError(res, 400, EMessage.BadRequest, validate.join(", "));
            }
            const userExists = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phoneNumber: parseInt(phoneNumber) }
                    ]
                }
            });
            if (userExists) {
                return resError(res, 400, "Phone number already exists");
            }
            const hash = await HashEncrypt(password);
            const user = await prisma.user.create({
                data: {
                    username,
                    phoneNumber: parseInt(phoneNumber),
                    password: hash
                }
            });
            const { password: _, ...userDataWithoutPassword } = user;
            return resSuccess(res, SMessage.Register, userDataWithoutPassword);
        } catch (error) {
            console.error("Register Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async Forgot(req, res) {
        try {
            const { phoneNumber, newPassword } = req.body;
            const validate = await ValidateData({ phoneNumber, newPassword });
            if (validate.length > 0) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const user = await prisma.user.findFirst({ where: { phoneNumber: parseInt(phoneNumber) } })
            if (!user) return resError(res, 404, EMessage.NotFound);
            const generatePassword = await HashEncrypt(newPassword);
            const data = await prisma.user.update({
                data: {
                    password: generatePassword,
                },
                where: {
                    user_id: user.user_id
                }
            });
            if (!data) return resError(res, 404, EMessage.ErrorUpdate);
            return resSuccess(res, SMessage.updated)
        } catch (error) {
            console.error("Forgot Controller Error:", error);
            return SendError(res, 500, EMessage.ErrorServer, error.message)
        }
    }
    static async ChangePassword(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token 
            console.log(user_id);
            const { oldPassword, newPassword } = req.body;
            const validate = await ValidateData({ oldPassword, newPassword });
            if (validate.length > 0) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","))
            }
            const user = await prisma.user.findFirst({ where: { user_id: user_id } })
            const decrypt = await Decrypt(user.password)
            if (oldPassword !== decrypt) {
                return resError(res, 400, EMessage.isNotMatch)
            }
            const generatePassword = await HashEncrypt(newPassword);
            const data = await prisma.user.update({
                data: {
                    password: generatePassword,
                },
                where: {
                    user_id: user_id
                }
            });
            if (!data) return resError(res, 404, EMessage.ErrorUpdate);
            return resSuccess(res, SMessage.updated)
        } catch (error) {
            console.error("Change Password Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message)
        }
    }
    static async DeleteUser(req, res) {
        try {
            const user_id = req.user; // ມາຈາກ token 
            const data = await prisma.user.delete({ where: { user_id: user_id } })
            if (!data) return resError(res, 404, EMessage.EDelete);
            return resSuccess(res, SMessage.Delete,data);
        } catch (error) {
            console.error("Delete Controller Error:", error);
            return SendError(res, 500, EMessage.ErrorServer, error.message)
        }
    }
}