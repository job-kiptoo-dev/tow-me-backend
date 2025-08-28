export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    
    
    
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient role." });
    }

    next();
  };
};
