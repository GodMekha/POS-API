import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";
import { UploadImageToCloud } from "../../config/cloudinary.js";

export default class ProductController {
    static async getAll(req, res) {
        try {
            const {
                page = 1, limit = 15, search, startDate, endDate, status
            } = req.query;
            const query = {};

            if (search) {
                query.OR = [
                    { productName: { contains: search } },
                ];
            }
            if (startDate || endDate) {
                query['createdAt'] = {};
                if (startDate) query['createdAt']['gte'] = new Date(startDate);
                if (endDate) query['createdAt']['lt'] = new Date(endDate);
            }

            // ✅ ແກ້: query.role => query.active (ຕາມ schema)
            if (status !== undefined) {
                query.active = status === "true";
            }

            const product = await prisma.product.findMany({
                where: query,
                orderBy: { createdAt: 'desc' },
                include: { category: true },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!product) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.product.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: product, totalPage });
        } catch (error) {
            console.error("Get all product Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getBy(req, res) {
        try {
            const category_id = req.params.category_id;

            const data = await prisma.product.findMany({
                where: { categoryId: category_id },
                include: { category: true },
            });
            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getBy, data);
        } catch (error) {
            console.error("Get by category product Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async getOne(req, res) {
        try {
            const product_id = req.params.product_id;

            const data = await prisma.product.findFirst({
                where: { product_id },
                include: { category: true },
            });
            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one product Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message); // ✅ ແກ້: error => error.message
        }
    }

    static async Insert(req, res) {
        try {
            const { categoryId, productName, productDetail, productQty, productPrice } = req.body;

            const validate = await ValidateData({ categoryId, productName, productDetail, productQty, productPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const image = req.files;
            if (!image || !image.image || !image.image.data) {
                return resError(res, 400, EMessage.BadRequest, "image");
            }

            // ✅ ແກ້: ກວດສອບ category ແລ້ວ return error ຖ້າບໍ່ພົບ
            const check = await prisma.category.findFirst({ where: { category_id: categoryId } });
            if (!check) return resError(res, 404, EMessage.NotFound);

            const imageUrl = await UploadImageToCloud(image.image.data, image.image.mimetype);
            if (!imageUrl) return resError(res, 400, EMessage.BadRequest);

            const data = await prisma.product.create({
                data: {
                    categoryId,
                    productName,
                    productDetail,
                    productQty: parseInt(productQty),
                    productPrice: parseInt(productPrice),
                    image: imageUrl,
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Product Insert Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    static async UpdateProduct(req, res) {
        try {
            const product_id = req.params.product_id;
            const { categoryId, productName, productDetail, productQty, productPrice } = req.body;

            const validate = await ValidateData({ categoryId, productName, productDetail, productQty, productPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            const image = req.files;
            if (!image || !image.image || !image.image.data) {
                return resError(res, 400, EMessage.BadRequest, "image");
            }

            // ✅ ແກ້: ກວດສອບ category ແລ້ວ return error ຖ້າບໍ່ພົບ
            const check = await prisma.category.findFirst({ where: { category_id: categoryId } });
            if (!check) return resError(res, 404, EMessage.NotFound);

            const imageUrl = await UploadImageToCloud(image.image.data, image.image.mimetype);
            if (!imageUrl) return resError(res, 400, EMessage.BadRequest);

            const data = await prisma.product.update({
                where: { product_id },
                data: {
                    categoryId,
                    productName,
                    productDetail,
                    productQty: parseInt(productQty),
                    productPrice: parseInt(productPrice),
                    image: imageUrl,
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update product Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message); // ✅ ແກ້: SendError => resError
        }
    }

    static async DeleteProduct(req, res) {
        try {
            const product_id = req.params.product_id;

            const checkId = await prisma.product.findFirst({ where: { product_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound); // ✅ ແກ້: 400 => 404

            const data = await prisma.product.delete({
                where: { product_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete product Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message); // ✅ ແກ້: SendError => resError
        }
    }
}