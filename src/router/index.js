import express from "express";
import AuthController from "../controller/user/Auth.js";
import { auth, authAdmin } from "../middleware/auth.js";
const router = express.Router();
//----- auth -----
router.get("/auth/getall", auth,AuthController.getAll);
router.get("/auth/getone/:user_id", AuthController.getOne);
router.post("/auth/register", AuthController.Register);
router.post("/auth/login", AuthController.Login);
router.post("/auth/forgot", AuthController.Forgot);
router.put("/auth/changePassword",auth, AuthController.ChangePassword);
router.delete("/auth/delete",auth, AuthController.DeleteUser);
export default router;