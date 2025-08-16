import jwt from 'jsonwebtoken'

export const authMiddleware = async(req,res, next) => {
    const authHeader = req.headers['Authorization'];

    if (!authHeader) {
        return res.status(401).json({error: "Authorization header required"});

    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
} 