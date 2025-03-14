import { request, response } from 'express';
import { UserType } from '../types';
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      type: UserType;
      [key: string]: any;
    };
  }
}

// const roleAccess = (permissions) => {

//     return (req, res, next) => {
//         try {
//             if(permissions.includes(req.userType)){
//                 next();
//             }else {
//                 res.status(401).json({
//                     message: "you not have access to this service"
//                 })
//             }
//         }catch(error){
//             res.status(401).json({
//                 message: "you not have access to this service",
//                 error
//             })
//         }
//     }
// }

// const roleAccess = (permissions) => {

//     return (req, res, next) => {
// try {
//     if(req.user && req.user.type === )
// }
//     }
// }

// module.exports = roleAccess;

const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.type === "SUPERADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: SuperAdmin access required" });
  }
};

const isSeller = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.type === "SELLER") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Seller access required" });
  }
};

const roleAccess = (allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && allowedRoles.includes(req.user.type)) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: ${allowedRoles.join(" or ")} access required`,
      });
    }
  };
};

export default roleAccess;
