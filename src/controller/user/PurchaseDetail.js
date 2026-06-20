import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class PurchaseDetailController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
                purchaseId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { list: { contains: search } },
                    { unit: { contains: search } },
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

            if (purchaseId) {
                query.purchaseId = purchaseId;
            }

            const purchaseDetails = await prisma.purchaseDetail.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    purchase: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!purchaseDetails) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.purchaseDetail.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: purchaseDetails, totalPage });
        } catch (error) {
            console.error("Get all PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByPurchase(req, res) {
        try {
            const { purchase_id } = req.params;

            const checkPurchase = await prisma.purchase.findFirst({
                where: { purchase_id },
            });
            if (!checkPurchase) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchaseDetail.findMany({
                where: { purchaseId: purchase_id },
                orderBy: { createdAt: "desc" },
                include: {
                    purchase: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by purchase PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { pd_id } = req.params;

            const data = await prisma.purchaseDetail.findFirst({
                where: { pd_id },
                include: {
                    purchase: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { purchaseId, list, unit, amount, price, total } = req.body;

            const validate = await ValidateData({ purchaseId, list, unit, amount, price, total });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkPurchase = await prisma.purchase.findFirst({
                where: { purchase_id: purchaseId },
            });
            if (!checkPurchase) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchaseDetail.create({
                data: {
                    purchaseId,
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    total: parseInt(total),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { pd_id } = req.params;
            const { purchaseId, list, unit, amount, price, total } = req.body;

            const validate = await ValidateData({ purchaseId, list, unit, amount, price, total });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.purchaseDetail.findFirst({ where: { pd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkPurchase = await prisma.purchase.findFirst({
                where: { purchase_id: purchaseId },
            });
            if (!checkPurchase) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchaseDetail.update({
                where: { pd_id },
                data: {
                    purchaseId,
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    total: parseInt(total),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { pd_id } = req.params;

            const checkId = await prisma.purchaseDetail.findFirst({ where: { pd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchaseDetail.update({
                where: { pd_id },
                data: { status: !checkId.status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { pd_id } = req.params;

            const checkId = await prisma.purchaseDetail.findFirst({ where: { pd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.purchaseDetail.delete({
                where: { pd_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete PurchaseDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}