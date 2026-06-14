const express= require("express");
const app=express();
const db = require('./config/mongoose');
const userModel=require('./models/user');
const postModel=require('./models/post');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const isLoggedIn=require('./middlewares/isLoggedIn');
const crypto = require('crypto');
const path = require('path');
const multer  = require('multer')
const upload=require('./config/multer')
const cookieparser=require('cookie-parser');
const fs = require('fs');

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static('public'));

app.set('view engine','ejs')


//using multer
app.get('/test',function(req,res){
    res.render('test')
})

app.post('/uploadpic',isLoggedIn,upload.single('img'),async function(req,res){
    const user=await userModel.findOne({email : req.user.email});
    if(user.profilepic!='/uploads/images/person.png'){
        fs.unlink('./public'+user.profilepic, (err) => {
            if (err) {
                console.log('Delete Error:', err.message);
                return;
            }
            console.log('File deleted');
        });
    }
    console.log(`posfilepic : ${user.profilepic}`);
    const filepath=req.file.destination +'/'+ req.file.filename;
    const newPath = filepath.replace('./public', '');
    user.profilepic=newPath;
    await user.save();
    console.log(user);
    // console.log(req.user)
    res.redirect('/profile');
})

app.get('/',async function(req,res){
    
    const allposts=await postModel.find({}).populate({
        path: 'user',
        options: {
            sort: { date: -1 }
        }
    });
    if(req.cookies.token){
        const data = jwt.verify(req.cookies.token, 'secret');
        const email=data.email;
        const user=await userModel.findOne({email}).populate({
            path: 'post',
            options: {
                sort: { date: -1 }
            }
        });
        console.log(`user : ${user}`);
        return res.render('root',{flag:true , username : user.name ,allposts}); 
    }
    res.render('root',{flag:false ,username:null, allposts});
})

app.get('/create',function(req,res){
    res.render('index');
})

app.post('/create',function(req,res){
    let {name ,email , password ,age}=req.body;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt,async function(err, hash) {
            // Store hash in your password DB.
            const user=await userModel.create({
                name,
                email,
                password:hash,
                age
            });
            const token=jwt.sign({ email: req.body.email }, 'secret');
            res.cookie('token',token);
            res.redirect('/');
        });
    });
})

app.get('/like/:postId', isLoggedIn, async function(req, res) {

    const user = await userModel.findOne({
        email: req.user.email
    });

    const post = await postModel.findById(req.params.postId);

    const liked = post.likes.some(
        id => id.toString() === user._id.toString()
    );

    if(liked){
        post.likes.pull(user._id);   // unlike
    }else{
        post.likes.push(user._id);   // like
    }

    await post.save();

    res.redirect(req.get('referer'));
});

app.get('/profile',isLoggedIn,async function(req,res){
    const user=await userModel.findOne({email :req.user.email}).populate({
        path: 'post',
        options: {
            sort: { date: -1 }
        }
    });
    res.render('profile',{user});
})

app.get('/login',function(req,res){
    res.render('login')
})

app.post('/login',async function(req,res){
    const user=await userModel.findOne({email : req.body.email})
    if(user===null) return res.send('something went wrong');
    bcrypt.compare(req.body.password, user.password, function(err, result) {
        if(result==true){
            const token=jwt.sign({ email: req.body.email }, 'secret');
            res.cookie('token',token);
            res.redirect('/');
        }
        else{
            res.send('somthing is wrong 2');
        }
    });
})

app.post('/createpost',isLoggedIn,async function(req,res){
    if(req.body.content===""){
        console.log('blank post cannot be created');
        return res.redirect(req.get('referer'));
    }
    const useremail=req.user.email;
    const user=await userModel.findOne({email:useremail});
    const post=await postModel.create({
        content : req.body.content,
        user : user._id
    });
    user.post.push(post._id);
    await user.save();
    console.log(user);
    res.redirect('/profile')
})

app.get('/editpost/:postId', isLoggedIn, async function(req, res) {
    const post = await postModel.findById(req.params.postId);
    // return res.send(post);
    res.render('editpost', { post });
});

app.post('/updatepost/:postId',async function(req,res){
    const post=await postModel.findByIdAndUpdate(
        req.params.postId,
            {
                content:req.body.content
            },
            {
                new: true // returns the updated document
            }
        );
    // await post.save();
    res.redirect('/profile');    
})
 
app.post('/deletepost/:postId', isLoggedIn, async function(req,res){
    const post = await postModel.findById(req.params.postId);
    const userid=post.user;
    const data = jwt.verify(req.cookies.token, 'secret');
    const email=data.email;
    const user=await userModel.findOne({email});
    if(userid.toString() === user._id.toString()){
        const delpost=await postModel.findByIdAndDelete(req.params.postId);
         // user ki post array se id remove karo
        await userModel.findByIdAndUpdate(
            post.user,
            {
                $pull: {
                    post: req.params.postId
                }
            }
        );
        await user.save();
        console.log(delpost);
        //to make sure uss page prr redirect haau jha mai pehlai tha
        //mtlb jha sai post api call hui
        return res.redirect(req.get('referer'));
    }
    res.redirect('/');
});

app.get('/logout',function(req,res){
    if(req.cookies.token){
        res.clearCookie('token');
    }
    res.redirect('/');
})

app.listen(8000,()=>{
    console.log('server is live at port 8000');
})