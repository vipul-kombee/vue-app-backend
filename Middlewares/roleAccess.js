const roleAccess = (permissions) => {
      
    return (req, res, next) => {
        try {
            if(permissions.includes(req.userType)){
                next();
            }else {
                res.status(401).json({
                    message: "you not have access to this service"
                })
            }
        }catch(error){
            res.status(401).json({
                message: "you not have access to this service",
                error
            })
        }
    }
}

module.exports = roleAccess;