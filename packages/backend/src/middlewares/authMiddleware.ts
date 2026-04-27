import { NextFunction, Request, Response } from "express";
import { UserRole } from "@eventix/shared";
import jwt from "jsonwebtoken";
//Defines what the information contained within the token looks like
export interface JwtPayload {
    userId: string;
    email?: string;
    role?: UserRole; // Optional, can be used for role-based access control
}
//Sets the maximum time without activity: 30 minutes.
const MAX_INACTIVITY_MS = 30 * 60 * 1000;
export const authMiddleware = async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction
) => {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;
    const lastActivity = req.cookies?.lastActivity;
    const now = Date.now();


    console.log("🔐 Auth Middleware triggered");
    console.log("📦 Cookies received:", {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        lastActivity,
    });

    try {
        if (accessToken) {
            console.log("✅ Access token found - verifying...");
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as JwtPayload;
            //Put the information that came from the JWT on the req object.
            req.user = decoded;
            console.log(`👤 Access token valid - userId: ${decoded.userId}`);
            console.log(decoded.role);
            
            

            res.cookie('lastActivity', now.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            console.log(`👤 Access token valid - userId: ${decoded.userId}`);
            return next();
        }

        if (refreshToken) {
            console.log("🔄 No access token - checking refresh token...");
            const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET!) as JwtPayload;

            if (!lastActivity) {
                console.log("⏳ Missing lastActivity - session expired");
                return res.status(401).json({ message: "Session expired due to inactivity" });
            }

            const inactivityDuration = now - parseInt(lastActivity);
            if (inactivityDuration > MAX_INACTIVITY_MS) {
                console.log(`⏱️ Inactivity of ${inactivityDuration / 1000}s - session expired`);
                return res.status(401).json({ message: "Session expired due to inactivity" });
            }

            const newAccessToken = jwt.sign(
                { userId: decodedRefresh.userId ,role: decodedRefresh.role},
                process.env.JWT_SECRET!,
                { expiresIn: '15m' }
            );
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('lastActivity', now.toString(), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            });
            console.log(decodedRefresh.role);
            

            //Put the information that came from the JWT on the req object.
            req.user = decodedRefresh;
            console.log("userrole",req.user.role);
            
            console.log(`🔁 Access token refreshed - userId: ${decodedRefresh.userId}`);
            return next();
        }
        console.log("❌ No valid tokens provided - access denied");
        return res.status(401).json({ message: "Missing token" });

    } catch (err) {
        console.log("🚫 Token verification failed:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};
