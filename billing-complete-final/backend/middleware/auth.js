const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next){
  const header = req.headers['authorization'];
  if(!header) return res.status(401).json({message:'Authorization header missing'});
  const parts = header.split(' ');
  if(parts.length !== 2) return res.status(401).json({message:'Malformed authorization header'});
  const token = parts[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(e){
    return res.status(401).json({message:'Invalid token'});
  }
}

module.exports = authMiddleware;
