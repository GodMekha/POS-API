import { VerifyToken } from "../lib/verifyToken.js";
import { EMessage } from "../service/message.js";
import { resError } from "../service/response.js";
import { FindOneUser } from "../service/service.js";

export const auth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return SendError(res, 401, EMessage.Uauthorization)
        }
       
        const token = authorization.replace("Bearer ", "");
        if (!token) return resError(res, 401, EMessage.Uaunthorization)
        const verify = await VerifyToken(token); // ສ້າງໃນ service
        req.user = { user_id: verify.user_id };
        next();
    } catch (error) {
        return resError(res, 500, EMessage.ErrorServer, error);
    }
}


export const authAdmin = async (req, res, next) => {
    try {
        const admin = req.user;
        if (!admin) {
            return resError(res, 401, EMessage.Uauthorization)
        }
        const user = await FindOneUser(admin) 
        if (user.role !== Role.admin || user.role !== Role.superadmin) {
            return resError(res, 401, EMessage.Uauthorization)
        }
        next();
    } catch (error) {
        return resError(res, 500, EMessage.ErrorServer, error);
    }
}

export const authSuperAdmin = async (req, res, next) => {
    try {
        const superadmin = req.user;
        if (!superadmin) {
            return resError(res, 401, EMessage.Uaunthorization)
        }
        const user = await FindOneUser(superadmin) // ສ້າງໃນ serivce
        if (user.role !== Role.superadmin) {
            return resError(res, 401, EMessage.Uaunthorization)
        }
       
        next();
    } catch (error) {
        return resError(res, 500, EMessage.ErrorServer, error);
    }
}

