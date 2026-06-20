import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class SellDetailController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                startDate,
                endDate,
                sellId,
                partId,
            } = req.query;

            const query = {};

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            if (sellId) {
                query.sellId = sellId;
            }

            if (partId) {
                query.partId = partId;
            }

            const sellDetails = await prisma.sellDetail.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    sell: true,
                    part: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!sellDetails) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.sellDetail.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: sellDetails, totalPage });
        } catch (error) {
            console.error("Get all SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getBySell(req, res) {
        try {
            const { id } = req.params;

            const checkSell = await prisma.sell.findFirst({
                where: { id },
            });
            if (!checkSell) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sellDetail.findMany({
                where: { sellId: id },
                orderBy: { createdAt: "desc" },
                include: {
                    sell: true,
                    part: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by sell SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByPart(req, res) {
        try {
            const { id } = req.params;

            const checkPart = await prisma.part.findFirst({
                where: { id },
            });
            if (!checkPart) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sellDetail.findMany({
                where: { partId: id },
                orderBy: { createdAt: "desc" },
                include: {
                    sell: true,
                    part: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by part SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.sellDetail.findFirst({
                where: { id },
                include: {
                    sell: true,
                    part: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { sellId, partId, amount, total } = req.body;

            const validate = await ValidateData({ sellId, partId, amount, total });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkSell = await prisma.sell.findFirst({
                where: { id: sellId },
            });
            if (!checkSell) return resError(res, 404, EMessage.NotFound);

            const checkPart = await prisma.part.findFirst({
                where: { id: partId },
            });
            if (!checkPart) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sellDetail.create({
                data: {
                    sellId,
                    partId,
                    amount: parseInt(amount),
                    total: parseInt(total),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { sellId, partId, amount, total } = req.body;

            const validate = await ValidateData({ sellId, partId, amount, total });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.sellDetail.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkSell = await prisma.sell.findFirst({
                where: { id: sellId },
            });
            if (!checkSell) return resError(res, 404, EMessage.NotFound);

            const checkPart = await prisma.part.findFirst({
                where: { id: partId },
            });
            if (!checkPart) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sellDetail.update({
                where: { id },
                data: {
                    sellId,
                    partId,
                    amount: parseInt(amount),
                    total: parseInt(total),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.sellDetail.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sellDetail.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete SellDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}