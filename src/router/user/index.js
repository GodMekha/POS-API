import express from "express";
import AuthController from "../../controller/user/Auth.js";
import { auth, authAdmin } from "../../middleware/auth.js";
import CategoryController from "../../controller/user/Category.js";
import CustomerController from "../../controller/user/Customer.js";
import HistoryInInventoryController from "../../controller/user/HistoryInInventory.js";
import HistoryInProductController from "../../controller/user/HistoryInProduct.js";
import InventoryController from "../../controller/user/Inventory.js";
import OrderController from "../../controller/user/Order.js";
import SellController from "../../controller/user/Sell.js";
import PartController from "../../controller/user/Part.js";
import ProductController from "../../controller/user/Product.js";
import PackageController from "../../controller/user/Package.js";
import PurchaseController from "../../controller/user/Purchase.js";
import PurchaseDetailController from "../../controller/user/PurchaseDetail.js";
import SellDetailController from "../../controller/user/SellDetail.js";
import SupplyController from "../../controller/user/Supply.js";

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
router.post("/category/insert", auth, CategoryController.Insert);
router.put("/category/update/:category_id", auth, CategoryController.UpdateCategory);
router.delete("/category/delete/:category_id", auth, CategoryController.DeleteCategory)
//---- customer ---
router.get("/customer/getall", auth, CustomerController.getAll);
router.get("/customer/getone/:customer_id", auth, CustomerController.getOne);
router.post("/customer/insert", auth, CustomerController.Insert);
router.put("/customer/update/:id", auth, CustomerController.Update);
router.put("/customer/update/active/:id", auth, CustomerController.UpdateActive);
router.delete("/customer/delete/:id", auth, CustomerController.Delete)
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
//---- package ---
router.get("/package/getAll", auth, PackageController.getAll);
router.get("/package/getOne/:id", auth, PackageController.getOne);
router.post("/package/insert", auth, PackageController.Insert);
router.put("/package/update/:id", auth, PackageController.Update);
router.put("/package/update/status/:id", auth, PackageController.UpdateActive);
router.delete("/package/delete/:id", auth, PackageController.Delete);
//---- part ---
router.get("/part/getAll", auth, PartController.getAll);
router.get("/part/getOne/:id", auth, PartController.getOne);
router.post("/part/insert", auth, PartController.Insert);
router.put("/part/update/:id", auth, PartController.Update);
router.delete("/part/delete/:id", auth, PartController.Delete);
//---- Product ---
router.get("/product/getAll", auth, ProductController.getAll);
router.get("/product/getBy/:category_id", auth, ProductController.getBy);
router.get("/product/getOne/:product_id", auth, ProductController.getOne);
router.post("/product/insert", auth, ProductController.Insert);
router.put("/product/update/:product_id", auth, ProductController.UpdateProduct);
router.delete("/product/delete/:product_id", auth, ProductController.DeleteProduct);
//---- Purchase ---
router.get("/purchase/getAll", auth, PurchaseController.getAll);
router.get("/purchase/getBy/:supply_id", auth, PurchaseController.getBySupply);
router.get("/purchase/getOne/:purchase_id", auth, PurchaseController.getOne);
router.post("/purchase/insert", auth, PurchaseController.Insert);
router.put("/purchase/update/:purchase_id", auth, PurchaseController.Update);
router.put("/purchase/update/status/:purchase_id", auth, PurchaseController.UpdateStatus);
router.delete("/purchase/delete/:purchase_id", auth, PurchaseController.Delete);
//---- Purchase Detail ---
router.get("/purchase/detail/getAll", auth, PurchaseDetailController.getAll);
router.get("/purchase/detail/getBy/:purchase_id", auth, PurchaseDetailController.getByPurchase);
router.get("/purchase/detail/getOne/:pd_id", auth, PurchaseDetailController.getOne);
router.post("/purchase/detail/insert", auth, PurchaseDetailController.Insert);
router.put("/purchase/detail/update/:pd_id", auth, PurchaseDetailController.Update);
router.put("/purchase/detail/update/status/:pd_id", auth, PurchaseDetailController.UpdateStatus);
router.delete("/purchase/detail/delete/:pd_id", auth, PurchaseDetailController.Delete);
//--- sell ---
router.get("/sell/getAll", auth, SellController.getAll);
router.get("/sell/getBy/customer/:id", auth , SellController.getByCustomer);
router.get("/sell/getBy/package/:id", auth , SellController.getByPackage);
router.get("/sell/getOne/:id", auth , SellController.getOne);
router.post("/sell/insert", auth , SellController.Insert);
router.put("/sell/update/:id", auth , SellController.Update);
router.put("/sell/update/status/:id", auth , SellController.UpdateStatus);
router.delete("/sell/delete", auth, SellController.Delete);
//--- sell details ---
router.get("/sell/detail/getAll", auth, SellDetailController.getAll);
router.get("/sell/detail/getBy/sell/detail/:id", auth , SellDetailController.getBySell);
router.get("/sell/detail/getBy/part/:id", auth , SellDetailController.getByPart);
router.get("/sell/detail/getOne/:id", auth , SellDetailController.getOne);
router.post("/sell/detail/insert", auth , SellDetailController.Insert);
router.put("/sell/detail/update/:id", auth , SellDetailController.Update);
router.delete("/sell/detail/delete", auth, SellDetailController.Delete);
//--- supply ---
router.get("/supply/getAll", auth, SupplyController.getAll);
router.get("/supply/getOne/:supply_id", auth , SupplyController.getOne);
router.post("/supply/insert", auth , SupplyController.Insert);
router.put("/supply/update/:supply_id", auth , SupplyController.Update);
router.put("/supply/update/active/:supply_id", auth , SupplyController.UpdateActive);
router.delete("/supply/delete", auth, SupplyController.Delete);
export default router;