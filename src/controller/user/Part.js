import { ValidateData } from "../service/validate.js";
import { resError, resSuccess } from "../service/response.js";
import { EMessage, SMessage } from "../service/message.js";
import prisma from "../config/prisma.js";

export default class PartController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { list: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            const parts = await prisma.part.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    sellDetails: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!parts) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.part.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: parts, totalPage });
        } catch (error) {
            console.error("Get all Part Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.part.findFirst({
                where: { id },
                include: {
                    sellDetails: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Part Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { list, amount, price } = req.body;

            const validate = await ValidateData({ list, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const data = await prisma.part.create({
                data: {
                    list,
                    amount: parseInt(amount),
                    price: parseInt(price),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Part Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { list, amount, price } = req.body;

            const validate = await ValidateData({ list, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.part.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.part.update({
                where: { id },
                data: {
                    list,
                    amount: parseInt(amount),
                    price: parseInt(price),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Part Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.part.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.part.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Part Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}