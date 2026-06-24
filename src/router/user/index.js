import express from "express";
import AuthController from "../../controller/user/Auth.js";
import { auth, authAdmin } from "../../middleware/auth.js";
import CategoryController from "../../controller/user/Category.js";
import CustomerController from "../../controller/user/Customer.js";
import HistoryInInventoryController from "../../controller/user/HistoryInInventory.js";
import HistoryInProductController from "../../controller/user/HistoryInProduct.js";
import InventoryController from "../../controller/user/Inventory.js";
import OrderController from "../../controller/user/Order.js";
const router = express.Router();
//----- auth -----
router.get("/auth/getall", auth, AuthController.getAll);
router.get("/auth/getone/:user_id", AuthController.getOne);
router.post("/auth/register", AuthController.Register);
router.post("/auth/login", AuthController.Login);
router.post("/auth/forgot", AuthController.Forgot);
router.put("/auth/changePassword", auth, AuthController.ChangePassword);
router.delete("/auth/delete", auth, AuthController.DeleteUser);
//----- category ---
router.get("/category/getall", auth, CategoryController.getAll);
router.get("/category/getone/:category_id", auth, CategoryController.getOne);
router.post("/category/getone/:category_id", auth, CategoryController.Insert);
router.put("/category/update/category_id", auth, CategoryController.UpdateCategory);
router.delete("/category/delete/:category_id", auth, CategoryController.DeleteCategory)
//---- customer ---
router.get("/customer/getall", auth, CustomerController.getAll);
router.get("/customer/getone/:customer_id", auth, CustomerController.getOne);
router.post("/customer/insert", auth, CustomerController.Insert);
router.put("/customer/update/:customer_id", auth, CustomerController.Update);
router.put("/customer/update/active/:customer_id", auth, CustomerController.UpdateActive);
router.delete("/customer/delete/:customer_id", auth, CustomerController.Delete)
//---- history in inventory ---
router.get("/history/inventory/getall", auth, HistoryInInventoryController.getAll);
router.get("/history/inventory/getone/:history_id", auth, HistoryInInventoryController.getOne);
router.post("/history/inventory/insert", auth, HistoryInInventoryController.Insert);
router.put("/history/inventory/update/:history_id", auth, HistoryInInventoryController.Update);
router.put("/history/inventory/update/active/:history_id", auth, HistoryInInventoryController.UpdateActive);
router.delete("/history/inventory/delete/:history_id", auth, HistoryInInventoryController.Delete)
//---- history in product ---
router.get("/history/product/getall", auth, HistoryInProductController.getAll);
router.get("/history/product/getone/:hip_id", auth, HistoryInProductController.getOne);
router.get("/history/product/getby/:product_id", auth, HistoryInProductController.getByProduct);
router.post("/history/product/insert", auth, HistoryInProductController.Insert);
router.put("/history/product/update/:hip_id", auth, HistoryInProductController.Update);
router.delete("/history/product/delete/:hip_id", auth, HistoryInProductController.Delete)
//---- inventory ---
router.get("/inventory/getall", auth, InventoryController.getAll);
router.get("/inventory/getone/:inventory_id", auth, InventoryController.getOne);
router.post("/inventory/insert", auth, InventoryController.Insert);
router.put("/inventory/update/:inventory_id", auth, InventoryController.Update);
router.delete("/inventory/delete/:inventory_id", auth, InventoryController.Delete)
//---- order ---
router.get("/order/getall", auth, OrderController.getAll);
router.get("/order/getone/:order_id", auth, OrderController.getOne);
router.get("/order/getby", auth, OrderController.getByUser);
router.get("/order/status", auth, OrderController.getByStatus);
router.post("/order/insert", auth, OrderController.Insert);
router.put("/order/update/:order_id", auth, OrderController.Update);
router.put("/order/update/status/:order_id", auth, OrderController.UpdateStatus);
router.delete("/order/delete/:order_id", auth, OrderController.Delete)
//---- order detail ---
router.get("/order/detail/getall", auth, OrderController.getAll);
router.get("/order/detail/getone/:order_id", auth, OrderController.getOne);
router.get("/order/detail/getby", auth, OrderController.getByUser);
router.get("/order/detail/status", auth, OrderController.getByStatus);
router.post("/order/detail/insert", auth, OrderController.Insert);
router.put("/order/detail/update/:order_id", auth, OrderController.Update);
router.put("/order/detail/update/status/:order_id", auth, OrderController.UpdateStatus);
router.delete("/order/detail/delete/:order_id", auth, OrderController.Delete)
export default router;