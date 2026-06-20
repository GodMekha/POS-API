import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class PackageController {

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
                    { name: { contains: search } },
                    { timeline: { contains: search } },
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

            const packages = await prisma.package.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    sells: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!packages) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.package.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: packages, totalPage });
        } catch (error) {
            console.error("Get all Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.package.findFirst({
                where: { id },
                include: {
                    sells: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { name, timeline, price } = req.body;

            const validate = await ValidateData({ name, timeline, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const data = await prisma.package.create({
                data: {
                    name,
                    timeline,
                    price: parseInt(price),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { name, timeline, price } = req.body;

            const validate = await ValidateData({ name, timeline, price });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.package.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.package.update({
                where: { id },
                data: {
                    name,
                    timeline,
                    price: parseInt(price),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateActive(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.package.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.package.update({
                where: { id },
                data: { active: !checkId.active },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Active Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.package.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.package.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Package Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}