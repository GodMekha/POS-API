import { ValidateData } from "../../service/validate.js";
import { resError, resSuccess } from "../../service/response.js";
import { EMessage, SMessage } from "../../service/message.js";
import prisma from "../../config/prisma.js";

export default class HistoryInProductController {

    // ດຶງຂໍ້ມູນທັງໝົດ (ຮອງຮັບ pagination, search, startDate, endDate)
    static async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 15,
                search,
                startDate,
                endDate,
                productId,
            } = req.query;

            const query = {};

            if (search) {
                query.OR = [
                    { productName: { contains: search } },
                    { productDetail: { contains: search } },
                ];
            }

            if (startDate || endDate) {
                query["createdAt"] = {};
                if (startDate) query["createdAt"]["gte"] = new Date(startDate);
                if (endDate) query["createdAt"]["lt"] = new Date(endDate);
            }

            // filter ຕາມ productId ຖ້າສົ່ງມາ
            if (productId) {
                query.productId = productId;
            }

            const histories = await prisma.historyInProduct.findMany({
                where: query,
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    products: {
                        include: {
                            category: true,
                        },
                    },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
            });

            if (!histories) return resError(res, 404, EMessage.NotFound);

            const count = await prisma.historyInProduct.count({ where: query });
            const totalPage = Math.ceil(count / parseInt(limit));

            return resSuccess(res, SMessage.getAll, { data: histories, totalPage });
        } catch (error) {
            console.error("Get all HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    // ດຶງຂໍ້ມູນຕາມ product_id (ປະຫວັດທັງໝົດຂອງສິນຄ້ານັ້ນ)
    static async getByProduct(req, res) {
        try {
            const { product_id } = req.params;

            // ກວດສອບວ່າ product ມີຢູ່ຈິງ
            const product = await prisma.product.findFirst({
                where: { product_id },
            });
            if (!product) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInProduct.findMany({
                where: { productId: product_id },
                orderBy: { createdAt: "desc" },
                include: {
                    products: {
                        include: { category: true },
                    },
                },
            });

            return resSuccess(res, SMessage.getAll, data);
        } catch (error) {
            console.error("Get by product HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    // ດຶງຂໍ້ມູນ 1 ລາຍການຕາມ hip_id
    static async getOne(req, res) {
        try {
            const { hip_id } = req.params;

            const data = await prisma.historyInProduct.findFirst({
                where: { hip_id },
                include: {
                    products: {
                        include: { category: true },
                    },
                },
            });

            if (!data) return resError(res, 404, EMessage.NotFound);

            return resSuccess(res, SMessage.getOne, data);
        } catch (error) {
            console.error("Get one HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    // ສ້າງປະຫວັດໃໝ່
    static async Insert(req, res) {
        try {
            const { productId, productName, productDetail, productQty, productPrice } = req.body;

            const validate = await ValidateData({ productId, productName, productQty, productPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            // ກວດສອບວ່າ product ມີຢູ່ຈິງ
            const product = await prisma.product.findFirst({
                where: { product_id: productId },
            });
            if (!product) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInProduct.create({
                data: {
                    productId,
                    productName,
                    productDetail: productDetail || null,
                    productQty: parseInt(productQty),
                    productPrice: parseInt(productPrice),
                },
            });

            return resSuccess(res, SMessage.Insert, data);
        } catch (error) {
            console.error("Insert HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    // ແກ້ໄຂປະຫວັດ
    static async Update(req, res) {
        try {
            const { hip_id } = req.params;
            const { productId, productName, productDetail, productQty, productPrice } = req.body;

            const validate = await ValidateData({ productId, productName, productQty, productPrice });
            if (validate.length) {
                return resError(res, 400, EMessage.BadRequest, validate.join(","));
            }

            // ກວດສອບວ່າ history record ມີຢູ່ຈິງ
            const checkId = await prisma.historyInProduct.findFirst({ where: { hip_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            // ກວດສອບວ່າ product ມີຢູ່ຈິງ
            const product = await prisma.product.findFirst({
                where: { product_id: productId },
            });
            if (!product) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInProduct.update({
                where: { hip_id },
                data: {
                    productId,
                    productName,
                    productDetail: productDetail || null,
                    productQty: parseInt(productQty),
                    productPrice: parseInt(productPrice),
                },
            });

            return resSuccess(res, SMessage.updated, data);
        } catch (error) {
            console.error("Update HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }

    // ລຶບປະຫວັດ
    static async Delete(req, res) {
        try {
            const { hip_id } = req.params;

            const checkId = await prisma.historyInProduct.findFirst({ where: { hip_id } });
            if (!checkId) return resError(res, 404, EMessage.NotFound);

            const data = await prisma.historyInProduct.delete({
                where: { hip_id },
            });

            return resSuccess(res, SMessage.deleted, data);
        } catch (error) {
            console.error("Delete HistoryInProduct Controller Error:", error);
            return resError(res, 500, EMessage.ErrorServer, error.message);
        }
    }
}