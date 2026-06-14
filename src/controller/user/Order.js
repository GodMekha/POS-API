import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, OrderStatus, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class OrderController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
                userId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { currency: { contains: search } },
                    { status: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            if (status) {
                query.status = status;
            }

            if (userId) {
                query.userId = userId;
            }

            const orders = await prisma.order.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    users: true,
                    details: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!orders) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.order.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: orders, totalPage });
        } catch (error) {
            console.error("Get all Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByUser(req, res) {
        try {
            const { user_id } = req.user;

            const checkUser = await prisma.user.findFirst({
                where: { user_id },
            });
            if (!checkUser) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.order.findMany({
                where: { userId: user_id },
                orderBy: { createdAt: "desc" },
                include: {
                    users: true,
                    details: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by user Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async getByStatus(req, res) {
        try {
            const { user_id } = req.user;
            const { status } = req.query; // ✅ destructure ໃຫ້ຊັດເຈນ

            const checkUser = await prisma.user.findFirst({
                where: { user_id },
            });
            if (!checkUser) return resError(res, 404, EMessage.NotFound);

            const query = { userId: user_id }; // ✅ filter ຕາມ user ກ່ອນ


            if (status) {
                const checkStatus = Object.values(OrderStatus).includes(status);
                if (!checkStatus) return resError(res, 400, EMessage.BadRequest, "status");
                query.status = status;
            }
            const data = await prisma.order.findMany({
                where: query, // ✅ ໃຊ້ query ທີ່ມີ status ແລ້ວ
                orderBy: { createdAt: "desc" },
                include: {
                    users: true,
                    details: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by status Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { order_id } = req.params;

            const data = await prisma.order.findFirst({
                where: { order_id },
                include: {
                    users: true,
                    details: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { userId, totalPrice, currency, status } = req.body;

            const validate = await ValidateData({ userId, totalPrice, currency, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkUser = await prisma.user.findFirst({
                where: { user_id: userId },
            });
            if (!checkUser) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.order.create({
                data: {
                    userId,
                    totalPrice: parseInt(totalPrice),
                    currency,
                    status,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { order_id } = req.params;
            const { userId, totalPrice, currency, status } = req.body;

            const validate = await ValidateData({ userId, totalPrice, currency, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.order.findFirst({ where: { order_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkUser = await prisma.user.findFirst({
                where: { user_id: userId },
            });
            if (!checkUser) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.order.update({
                where: { order_id },
                data: {
                    userId,
                    totalPrice: parseInt(totalPrice),
                    currency,
                    status,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { order_id } = req.params;
            const { status } = req.body;

            if (!status) {
                return resError(res, 400, EMessage.BadRequest, "status");
            }

            const checkId = await prisma.order.findFirst({ where: { order_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.order.update({
                where: { order_id },
                data: { status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { order_id } = req.params;

            const checkId = await prisma.order.findFirst({ where: { order_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.order.delete({
                where: { order_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Order Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}