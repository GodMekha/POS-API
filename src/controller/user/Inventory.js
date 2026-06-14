import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class InventoryController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                status,
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

            const inventory = await prisma.inventory.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!inventory) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.inventory.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: inventory, totalPage });
        } catch (error) {
            console.error("Get all Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { inventory_id } = req.params;

            const data = await prisma.inventory.findFirst({
                where: { inventory_id },

            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { list, unit, amount, price } = req.body;

            const validate = await ValidateData({ list, unit, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const totalPrice = parseInt(amount) * parseInt(price);

            const data = await prisma.inventory.create({
                data: {
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    totalPrice,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { inventory_id } = req.params;
            const { list, unit, amount, price } = req.body;

            const validate = await ValidateData({ list, unit, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.inventory.findFirst({ where: { inventory_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const totalPrice = parseInt(amount) * parseInt(price);

            const data = await prisma.inventory.update({
                where: { inventory_id },
                data: {
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    totalPrice,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateStatus(req, res) {
        try {
            const { inventory_id } = req.params;

            const checkId = await prisma.inventory.findFirst({ where: { inventory_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.inventory.update({
                where: { inventory_id },
                data: { status: !checkId.status },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Status Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { inventory_id } = req.params;

            const checkId = await prisma.inventory.findFirst({ where: { inventory_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.inventory.delete({
                where: { inventory_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Inventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}