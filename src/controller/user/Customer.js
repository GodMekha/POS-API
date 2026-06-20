import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class CustomerController {

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
                    { fullname: { contains: search } },
                    { address: { contains: search } },
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

            const customers = await prisma.customer.findMany({
                where: query,
                orderBy: { createdAt: "desc" },
                include: {
                    sells: true,
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!customers) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.customer.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: customers, totalPage });
        } catch (error) {
            console.error("Get all Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const data = await prisma.customer.findFirst({
                where: { id },
                include: {
                    sells: true,
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Insert(req, res) {
        try {
            const { fullname, phone, address } = req.body;

            const validate = await ValidateData({ fullname, phone, address });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const data = await prisma.customer.create({
                data: {
                    fullname,
                    phone: parseInt(phone),
                    address,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { fullname, phone, address } = req.body;

            const validate = await ValidateData({ fullname, phone, address });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const checkId = await prisma.customer.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.customer.update({
                where: { id },
                data: {
                    fullname,
                    phone: parseInt(phone),
                    address,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateActive(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.customer.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.customer.update({
                where: { id },
                data: { active: !checkId.active },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update Active Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const checkId = await prisma.customer.findFirst({ where: { id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.customer.delete({
                where: { id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Customer Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}