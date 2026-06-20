import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class SellController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
                customerId,
                packageId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { status: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            if (status !== undefined) {
                query.status = status;
            }

            if (customerId) {
                query.customerId = customerId;
            }

            if (packageId) {
                query.packageId = packageId;
            }

            const sells = await prisma.sell.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    customer: true,
                    package: true,
                    sellDetails: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!sells) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.sell.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: sells, totalPage });
        } catch (error) {
            console.error("Get all Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByCustomer(req, res) {
        try {
            const { id } = req.params;

            const checkCustomer = await prisma.customer.findFirst({
                where: { id },
            });
            if (!checkCustomer) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.findMany({
                where: { customerId: id },
                orderBy: { createdAt: "desc" },
                include: {
                    customer: true,
                    package: true,
                    sellDetails: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by customer Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByPackage(req, res) {
        try {
            const { id } = req.params;

            const checkPackage = await prisma.package.findFirst({
                where: { id },
            });
            if (!checkPackage) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.findMany({
                where: { packageId: id },
                orderBy: { createdAt: "desc" },
                include: {
                    customer: true,
                    package: true,
                    sellDetails: true,
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by package Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.sell.findFirst({
                where: { id },
                include: {
                    customer: true,
                    package: true,
                    sellDetails: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { customerId, packageId, discount, totalPrice, status } = req.body;

            const validate = await ValidateData({ customerId, packageId, discount, totalPrice, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkCustomer = await prisma.customer.findFirst({
                where: { id: customerId },
            });
            if (!checkCustomer) return resError(res, 404, EMessage.NotFound);

            const checkPackage = await prisma.package.findFirst({
                where: { id: packageId },
            });
            if (!checkPackage) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.create({
                data: {
                    customerId,
                    packageId,
                    discount: parseFloat(discount),
                    totalPrice: parseInt(totalPrice),
                    status,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { customerId, packageId, discount, totalPrice, status } = req.body;

            const validate = await ValidateData({ customerId, packageId, discount, totalPrice, status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.sell.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkCustomer = await prisma.customer.findFirst({
                where: { id: customerId },
            });
            if (!checkCustomer) return resError(res, 404, EMessage.NotFound);

            const checkPackage = await prisma.package.findFirst({
                where: { id: packageId },
            });
            if (!checkPackage) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.update({
                where: { id },
                data: {
                    customerId,
                    packageId,
                    discount: parseFloat(discount),
                    totalPrice: parseInt(totalPrice),
                    status,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validate = await ValidateData({ status });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.sell.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.update({
                where: { id },
                data: { status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.sell.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.sell.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Sell Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}