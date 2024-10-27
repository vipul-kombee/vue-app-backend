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

const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.type === "SUPERADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: SuperAdmin access required" });
  }
};

const isSeller = (req, res, next) => {
  if (req.user && req.user.type === "SELLER") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Seller access required" });
  }
};

const roleAccess = (allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.type)) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: ${allowedRoles.join(" or ")} access required`,
      });
    }
  };
};

module.exports = roleAccess;
