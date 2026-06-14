import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class HistoryInInventoryController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                active,
                inventoryId,
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

            if (active !== undefined) {
                query.active = active === "true";
            }

            if (inventoryId) {
                query.inventoryId = inventoryId;
            }

            const histories = await prisma.historyInInventory.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: { inventory: true },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!histories) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.historyInInventory.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: histories, totalPage });
        } catch (error) {
            console.error("Get all HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getByInventory(req, res) {
        try {
            const { inventory_id } = req.params;

            const checkInventory = await prisma.inventory.findFirst({
                where: { inventory_id },
            });
            if (!checkInventory) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInInventory.findMany({
                where: { inventoryId: inventory_id },
                orderBy: { createdAt: "desc" },
                include: { inventory: true },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by Inventory HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.historyInInventory.findFirst({
                where: { id },
                include: { inventory: true },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { inventoryId, list, unit, amount, price } = req.body;

            const validate = await ValidateData({ inventoryId, list, unit, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkInventory = await prisma.inventory.findFirst({
                where: { inventory_id: inventoryId },
            });
            if (!checkInventory) return resError(res, 404, EMessage.NotFound);

            const totalPrice = parseInt(amount) * parseInt(price);

            const data = await prisma.historyInInventory.create({
                data: {
                    inventoryId,
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    totalPrice,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { inventoryId, list, unit, amount, price } = req.body;

            const validate = await ValidateData({ inventoryId, list, unit, amount, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.historyInInventory.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const checkInventory = await prisma.inventory.findFirst({
                where: { inventory_id: inventoryId },
            });
            if (!checkInventory) return resError(res, 404, EMessage.NotFound);

            const totalPrice = parseInt(amount) * parseInt(price);

            const data = await prisma.historyInInventory.update({
                where: { id },
                data: {
                    inventoryId,
                    list,
                    unit,
                    amount: parseInt(amount),
                    price: parseInt(price),
                    totalPrice,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateActive(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.historyInInventory.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInInventory.update({
                where: { id },
                data: { active: !checkId.active },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Active HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.historyInInventory.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInInventory.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete HistoryInInventory Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}