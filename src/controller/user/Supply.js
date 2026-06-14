import { ValidateData } from "../service/validate.js";
import { resError, resSuccess } from "../service/response.js";
import { EMessage, SMessage } from "../service/message.js";
import prisma from "../config/prisma.js";

export default class SupplyController {

    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                active,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { company: { contains: search } },
                    { sellName: { contains: search } },
                    { position: { contains: search } },
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

            const supplies = await prisma.supply.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!supplies) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.supply.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: supplies, totalPage });
        } catch (error) {
            console.error("Get all Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { supply_id } = req.params;

            const data = await prisma.supply.findFirst({
                where: { supply_id },
                
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { company, phone, sellName, position } = req.body;

            const validate = await ValidateData({ company, phone, sellName });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const data = await prisma.supply.create({
                data: {
                    company,
                    phone: parseInt(phone),
                    sellName,
                    position: position || null,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { supply_id } = req.params;
            const { company, phone, sellName, position } = req.body;

            const validate = await ValidateData({ company, phone, sellName });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.supply.findFirst({ where: { supply_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.supply.update({
                where: { supply_id },
                data: {
                    company,
                    phone: parseInt(phone),
                    sellName,
                    position: position || null,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateActive(req, res) {
        try {
            const { supply_id } = req.params;

            const checkId = await prisma.supply.findFirst({ where: { supply_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.supply.update({
                where: { supply_id },
                data: { active: !checkId.active },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Active Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { supply_id } = req.params;

            const checkId = await prisma.supply.findFirst({ where: { supply_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.supply.delete({
                where: { supply_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Supply Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}