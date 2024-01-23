import express from "express";
import {
    getPosts,
    getPost,
    addPost,
    updatePost,
    deletePost,
} from "../controllers/post.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/", protect, getPosts);
router.get("/:id", protect, getPost);
router.post("/", protect, addPost);
router.delete("/:id", protect, deletePost);
router.put("/:id", protect, updatePost);

export default router;
