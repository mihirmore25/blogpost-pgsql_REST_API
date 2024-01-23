import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    let token;

    if (req.cookies.access_token) {
        token = req.cookies.access_token;
    }

    if (!token)
        return res.status(401).json("Not authorize to access this route");

    try {
        // Verify token
        const decoded = jwt.verify(token, "secretmihir");

        console.log(decoded);

        req.user = decoded.id;

        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json("Not authorized");
    }
};
