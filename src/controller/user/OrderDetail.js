import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, OrderStatus, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class OrderDetailController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
                orderId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { status: { contains: search } },
                    { productId: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            if (status) {
                const checkStatus = Object.values(OrderStatus).includes(status);
                if (!checkStatus) return resError(res, 400, EMessage.BadRequest, "status");
                query.status = status;
            }

            if (orderId) {
                query.orderId = orderId;
            }

            const orderDetails = await prisma.orderDetail.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    order: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!orderDetails) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.orderDetail.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: orderDetails, totalPage });
        } catch (error) {
            console.error("Get all OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByOrder(req, res) {
        try {
            const { order_id } = req.params;

            const checkOrder = await prisma.order.findFirst({
                where: { order_id },
            });
            if (!checkOrder) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.orderDetail.findMany({
                where: { orderId: order_id },
                orderBy: { createdAt: "desc" },
                include: { order: true },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by order OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { ordrd_id } = req.params;

            const data = await prisma.orderDetail.findFirst({
                where: { ordrd_id },
                include: { order: true },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { orderId, productId, amount, total, status } = req.body;

            const validate = await ValidateData({ orderId, productId, amount, total, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkOrder = await prisma.order.findFirst({
                where: { order_id: orderId },
            });
            if (!checkOrder) return resError(res, 404, EMessage.NotFound);

            const checkProduct = await prisma.product.findFirst({
                where: { product_id: productId },
            });
            if (!checkProduct) return resError(res, 404, EMessage.NotFound);

            const checkStatus = Object.values(OrderStatus).includes(status);
            if (!checkStatus) return resError(res, 400, EMessage.BadRequest, "status");

            const data = await prisma.orderDetail.create({
                data: {
                    orderId,
                    productId,
                    amount: parseInt(amount),
                    total: parseInt(total),
                    status,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { ordrd_id } = req.params;
            const { orderId, productId, amount, total, status } = req.body;

            const validate = await ValidateData({ orderId, productId, amount, total, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.orderDetail.findFirst({ where: { ordrd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkOrder = await prisma.order.findFirst({
                where: { order_id: orderId },
            });
            if (!checkOrder) return resError(res, 404, EMessage.NotFound);

            const checkProduct = await prisma.product.findFirst({
                where: { product_id: productId },
            });
            if (!checkProduct) return resError(res, 404, EMessage.NotFound);

            const checkStatus = Object.values(OrderStatus).includes(status);
            if (!checkStatus) return resError(res, 400, EMessage.BadRequest, "status");

            const data = await prisma.orderDetail.update({
                where: { ordrd_id },
                data: {
                    orderId,
                    productId,
                    amount: parseInt(amount),
                    total: parseInt(total),
                    status,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { ordrd_id } = req.params;
            const { status } = req.body;

            if (!status) return resError(res, 400, EMessage.BadRequest, "status");

            const checkStatus = Object.values(OrderStatus).includes(status);
            if (!checkStatus) return resError(res, 400, EMessage.BadRequest, "status");

            const checkId = await prisma.orderDetail.findFirst({ where: { ordrd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.orderDetail.update({
                where: { ordrd_id },
                data: { status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { ordrd_id } = req.params;

            const checkId = await prisma.orderDetail.findFirst({ where: { ordrd_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.orderDetail.delete({
                where: { ordrd_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete OrderDetail Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}