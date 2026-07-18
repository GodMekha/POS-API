import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js"
import { UploadImageToCloud } from "../../config/cloudinary.js";
export default class CategoryController {
    static async getAll(req, res) {
        try {
            const {
                page = 1, limit = 15, search, startDate, endDate, status
            } = req.query;
            const query = {};

            if (search) {
                query.OR = [
                    { name: { contains: search } },

                ];
            }
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }

            if (status) {
                query.role = status;
            }
            const category = await prisma.category.findMany({
                where: query,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });
            if (!category) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.category.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: category, totalPage })
        } catch (error) {
            console.error("Get all Category Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async getOne(req, res) {
        try {
            const category_id = req.params.category_id;

            const data = await prisma.category.findFirst({ where: { category_id: category_id } });
            if (!data) return resError(res, 404, EMessage.NotFound);
          
            return resSuccess(res, SMessage.getOne, data)
        } catch (error) {
            console.error("Get One Category Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error);
        }
    }
    static async Insert(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return resError(res, 400, EMessage.BadRequest, "name");
            }
            const icon = req.files;
            
            if (!icon.files || !icon.files.data) {
                return resError(res, 400, EMessage.BadRequest, "icon");
            }
            const iconUrl = await UploadImageToCloud(icon.files.data, icon.files.mimetype);
            if (!iconUrl) return resError(res, 400, EMessage.BadRequest);
            const data = await prisma.category.create({
                data: {
                    name,
                    icon: iconUrl
                }
            })
            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Category Insert Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
    static async UpdateCategory(req, res) {
        try {
            const category_id = req.params.category_id;
            const { name } = req.body;
            if (!name) {
                return resError(res, 400, EMessage.BadRequest, "name");
            }
            const icon = req.files;
            if (!icon.icon || !icon.icon.data) {
                return resError(res, 400, EMessage.BadRequest, "icon");
            }
            const iconUrl = await UploadImageToCloud(icon.icon.data, icon.icon.mimetype);
            if (!iconUrl) return resError(res, 400, EMessage.BadRequest);
            const update = await prisma.category.update({
                where: { category_id }, data: {
                    name, icon: iconUrl,
                }
            });
            return resSuccess(res, SMessage.updated, update);
        } catch (error) {
            console.error("Update Category Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message)
        }
    }
    static async DeleteCategory(req, res) {
        try {
            const category_id = req.params.category_id;

            const checkId = await prisma.category.findFirst({ where: { category_id } })
            if (!checkId) {
                return resError(res, 400, EMessage.BadRequest);
            }
            const data = await prisma.category.delete({
                where: { category_id }
            });
            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete Category Controller Error:", error);
            return SendError(res, 500, EMessage.ErrorServer, error.message)
        }
    }
}