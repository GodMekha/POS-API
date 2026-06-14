import { ValidateData } from "../service/validate.js";
import { resError, resSuccess } from "../service/response.js";
import { EMessage, SMessage } from "../service/message.js";
import prisma from "../config/prisma.js";

export default class PurchaseController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
                supplyId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { currency: { contains: search } },
                    { expressName: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            if (status !== undefined) {
                query.status = status === "true";
            }

            if (supplyId) {
                query.supplyId = supplyId;
            }

            const purchases = await prisma.purchase.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    supply: true,

                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!purchases) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.purchase.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: purchases, totalPage });
        } catch (error) {
            console.error("Get all Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getBySupply(req, res) {
        try {
            const { supply_id } = req.params;

            const checkSupply = await prisma.supply.findFirst({
                where: { supply_id },
            });
            if (!checkSupply) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchase.findMany({
                where: { supplyId: supply_id },
                orderBy: { createdAt: "desc" },
                include: {
                    supply: true,

                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by supply Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { purchase_id } = req.params;

            const data = await prisma.purchase.findFirst({
                where: { purchase_id },
                include: {
                    supply: true,

                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { supplyId, currency, expressName, expressPrice, totalPrice } = req.body;

            const validate = await ValidateData({ supplyId, currency, expressPrice, totalPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkSupply = await prisma.supply.findFirst({
                where: { supply_id: supplyId },
            });
            if (!checkSupply) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchase.create({
                data: {
                    supplyId,
                    currency,
                    expressName: expressName || null,
                    expressPrice: parseInt(expressPrice),
                    totalPrice: parseInt(totalPrice),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { purchase_id } = req.params;
            const { supplyId, currency, expressName, expressPrice, totalPrice } = req.body;

            const validate = await ValidateData({ supplyId, currency, expressPrice, totalPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.purchase.findFirst({ where: { purchase_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkSupply = await prisma.supply.findFirst({
                where: { supply_id: supplyId },
            });
            if (!checkSupply) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchase.update({
                where: { purchase_id },
                data: {
                    supplyId,
                    currency,
                    expressName: expressName || null,
                    expressPrice: parseInt(expressPrice),
                    totalPrice: parseInt(totalPrice),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { purchase_id } = req.params;

            const checkId = await prisma.purchase.findFirst({ where: { purchase_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchase.update({
                where: { purchase_id },
                data: { status: !checkId.status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { purchase_id } = req.params;

            const checkId = await prisma.purchase.findFirst({ where: { purchase_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchase.delete({
                where: { purchase_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Purchase Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}