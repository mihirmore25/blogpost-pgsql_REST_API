import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    console.log(req.body);
    // CHECK EXISTING USER
    const query = "SELECT * FROM users WHERE username = $1 OR email = $2";
    const filter = [req.body.username, req.body.email];
    db.query(query, filter, (err, data) => {
        if (err) return res.json(err);

        // console.log(data.rows.length);
        if (data.rowCount) return res.status(409).json("User already exist!");

        // Hash the password and create a user
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        // INSERT A NEW USER INTO THE DATABASE
        const insertQuery =
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";

        const values = [req.body.username, req.body.email, hash];

        db.query(insertQuery, values, (err, data) => {
            if (err) return res.json(err.stack, err.message, err.name);

            console.log("Created User", data.rows);
            return res.status(201).json({
                message: "User has been created successfully.",
                user: {
                    username: data.rows[0].username,
                    email: data.rows[0].email,
                },
            });
        });
    });
};

export const login = (req, res) => {
    // CHECK USER

    const query = "SELECT * FROM users WHERE username = $1";
    const filter = [req.body.username];

    db.query(query, filter, (err, data) => {
        if (err) return res.json(err);

        if (data.rowCount === 0)
            return res.status(404).json({ message: "User Not Found!" });

        // CHECK PASSWORD
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            data.rows[0].password
        );

        if (!isPasswordCorrect)
            return res
                .status(400)
                .json({ message: "Wrong Username or Password." });

        const token = jwt.sign({ id: data.rows[0].id }, "secretmihir");
        const { password, ...other } = data.rows[0];

        res.cookie("access_token", token, {
            httpOnly: true,
        })
            .status(200)
            .json(other);
    });
};

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        sameSite: "none",
        secure: true,
    })
        .status(200)
        .json("User has been logged out successfully.");
};
