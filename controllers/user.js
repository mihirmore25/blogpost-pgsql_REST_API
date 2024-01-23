import { db } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const getUsers = (req, res) => {
    const query = "SELECT username, email, img FROM users";

    db.query(query, [], (err, data) => {
        if (err) return res.status(500).json(err);

        if (data.rowCount === 0) {
            return res.status(404).json(`Users not found!`);
        }

        return res.status(200).json(data.rows);
    });
};

export const getUser = (req, res) => {
    console.log(req.params.id);
    const userId = req.params.id;

    const query = `
        SELECT username, img, email FROM users
        WHERE id = $1
    `;

    db.query(query, [userId], (err, data) => {
        if (err) return res.status(500).json(err);

        if (userId && data.rowCount === 0) {
            return res.status(404).json("User Not Found");
        }

        return res.status(200).json(data.rows[0]);
    });
};

export const addUser = (req, res) => {
    const token = req.cookies.access_token;

    // console.log(token);

    if (!token) return res.status(403).json("Not authorized");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        // console.log(userInfo);

        if (userInfo.id === 6) {
            const query = `
                INSERT INTO users (username, email, password, img)
                VALUES ($1, $2, $3, $4) RETURNING *
            `;

            // Hash the password and add a user
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            const values = [
                req.body.username,
                req.body.email,
                hash,
                req.body.img,
            ];

            db.query(query, values, (err, data) => {
                if (err) return res.status(500).json(err);

                console.log(data.rows[0]);
                return res.json("User has been created");
            });
        } else {
            return res.status(403).json("Only admin could add user!");
        }
    });
};

export const updateUser = (req, res) => {
    const token = req.cookies.access_token;

    const userId = req.params.id;

    if (!token) return res.status(403).json("Not authorized");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        console.log(userInfo);
        console.log(userId);

        if (userId == userInfo.id || userInfo.id == 6) {
            // only user and admin can update user account
            const query = `UPDATE users
                    SET username = $1, password = $2, email = $3, img = $4
                    WHERE id = $5 RETURNING *
                `;
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            const values = [
                req.body.username,
                hash,
                req.body.email,
                req.body.img,
                userId,
            ];
            db.query(query, values, (err, data) => {
                if (err) return res.status(500).json(err);
                console.log(data.rows[0]);
                return res.status(200).json("User has been updated!");
            });
        } else {
            return res
                .status(403)
                .json("You can update your own user account only!");
        }
    });
};

export const deleteUser = (req, res) => {
    const token = req.cookies.access_token;

    const userId = req.params.id;

    // console.log(token);

    if (!token) return res.status(403).json("Not authorized");

    jwt.verify(token, "secretmihir", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        console.log(`UserId --> ${userId}`, `User Info Id --> ${userInfo.id}`);

        const query = "DELETE FROM users WHERE id = $1 AND id = $2";

        if (userId === userInfo.id) {
            db.query(query, [userId, userInfo.id], (err, data) => {
                if (err) return res.status(500).json(err);

                console.log(data.rows);

                return res.status(200).json("Post has been deleted!");
            });
        } else {
            return res
                .status(403)
                .json("You can only delete your own user account");
        }
    });
};
