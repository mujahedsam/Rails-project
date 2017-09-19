var express = require('express');
var router = express.Router();


router.get('/registration',(req,res)=>{
	console.log("Register's get method");
	res.render('registration');
})

router.get('/login',(req,res)=>{
	console.log("login's get method");
	res.render('login',{msg:"welcome to rails login page"});
	// res.send("biscuit")
})
router.get('/dashboard',(req,res)=>{
	console.log("dashboard's get method");
	res.render('dashboard');
})

router.get('/',(req,res)=>{
	console.log("home's get method");
	res.render('homepage');
})
router.get('/activation?',(req,res)=>{
	console.log(req.query.token+"frm get mthd");
	var xyz=req.query.token;
         res.render('reg2',{token:xyz});   
})
router.get('/logout',(req,res)=>{
      req.session.destroy(function() {
                 console.log("logged out"); 
             })
      res.redirect('/login');
})
 
module.exports = router;