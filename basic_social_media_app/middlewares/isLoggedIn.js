var jwt = require('jsonwebtoken');

function isLoggedIn(req,res,next){
    if(req.cookies.token==null){
        console.log('user must be logged in')
        return res.redirect('/login');
    } 
    const data = jwt.verify(req.cookies.token, 'secret');
    req.user=data;
    next();
}

module.exports=isLoggedIn;