import express from 'express'
import UserController from "../Controllers/Users.js"

const router= express.Router();

router.use("/register", UserController.createUsers);
router.use("/login", UserController.Login);
router.use("/logout", UserController.Logout);
router.use("/forget-password", UserController.forgetPassword);
router.use("/reset-password", UserController.resetPassword); 
router.post("/check-user",UserController.checkUser);

export default router