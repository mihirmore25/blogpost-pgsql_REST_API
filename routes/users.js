import express from "express";
import {
    getUsers,
    getUser,
    addUser,
    deleteUser,
    updateUser,
} from "../controllers/user.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUser);
router.post("/", protect, addUser);
router.delete("/:id", protect, deleteUser);
router.put("/:id", protect, updateUser);

export default router;
