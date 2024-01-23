import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {
    console.log(req.user);

    const query = req.query.cat
        ? "SELECT * FROM posts WHERE cat=$1"
        : "SELECT * FROM posts";

    db.query(query, req.query.cat ? [req.query.cat] : [], (err, data) => {
        if (err) return res.send(err);

        if (req.query.cat && data.rowCount === 0) {
            return res
                .status(404)
                .json(`Posts not found for ${req.query.cat} cateory`);
        }

        return res.status(200).json(data.rows);
    });
};

export const getPost = (req, res) => {
    // GET A SINGLE POST
    // console.log(req.params.id);
    const query = `
        SELECT USERNAME,
            TITLE,
            DESCRIPTION,
            P.IMG AS postImg,
            U.IMG AS userImg,
            CAT, date
        FROM USERS AS U
        JOIN POSTS AS P ON U.ID = P.UID
        WHERE P.ID = $1;
    `;

    db.query(query, [req.params.id], (err, data) => {
        if (err) return res.json(err);

        if (req.params.id && data.rowCount === 0) {
            return res.status(404).json("Post Not Found");
        }

        return res.status(200).json(data.rows[0]);
    });
};

export const addPost = (req, res) => {
    const token = req.cookies.access_token;

    console.log(token);

    if (!token) return res.status(403).json("Not authorized");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const query = `INSERT INTO posts 
                (title, description, img, cat, date, uid)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
            `;

        const values = [
            req.body.title,
            req.body.description,
            req.body.img,
            req.body.cat,
            req.body.date,
            userInfo.id,
        ];

        db.query(query, values, (err, data) => {
            if (err) return res.status(500).json(err);

            console.log(data.rows[0]);
            return res.json("Post has been created");
        });
    });
};

export const updatePost = (req, res) => {
    const token = req.cookies.access_token;

    const postId = req.params.id;

    if (!token) return res.status(403).json("Not authorized");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const query = `UPDATE posts 
                SET title = $1, description = $2, img = $3, cat = $4
                WHERE id = $5 AND uid = $6 RETURNING *
            `;

        const values = [
            req.body.title,
            req.body.description,
            req.body.img,
            req.body.cat,
            postId,
            userInfo.id,
        ];

        db.query(query, values, (err, data) => {
            if (err) return res.status(500).json(err);

            console.log(data.rows[0]);
            return res.json("Post has been updated!");
        });
    });
};

export const deletePost = (req, res) => {
    // DELETE POST
    console.log(req.cookies);

    const token = req.cookies.access_token;

    if (!token) return res.status(401).json("Not authenticated");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const postId = req.params.id;

        const query = "DELETE FROM posts WHERE id = $1 AND uid = $2";

        db.query(query, [postId, userInfo.id], (err, data) => {
            if (err)
                return res
                    .status(403)
                    .json("You can only delete your own post");

            return res.status(200).json("Post has been deleted!");
        });
    });
};
