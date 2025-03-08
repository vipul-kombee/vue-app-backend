const Session = require("../Apis/Session/session.model");
const userModel = require("./Apis/User/user.model");
import { Request, Response, NextFunction } from 'express';

const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "No Token available"
        });
    }

    try {
        const session = await Session.findOne({ token });

        if (!session || session.expires < Date.now()) {
            return res.status(401).json({
                message: "Invalid or expired token"
            })
        }

        req.user = await userModel.findById(session.userId);

        next();
    } catch (err) {
        res.status(500).json({
            message: "Error validating token",
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}

module.exports = authenticateToken;