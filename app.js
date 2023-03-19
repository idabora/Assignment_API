const express = require('express');
const app = express();
const session = require('express-session');
require('./connection/connection')
const Form_data = require('./DB/schema')
const controller=require('./middleware/controller')
// const hbs=require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');


const hostname = '127.0.0.1';
const PORT = process.env.PORT || 4000;

const templatePath = path.join(__dirname, '/public')
app.set('view engine', 'hbs');
app.set('views', templatePath)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
   res.render("register");
});

app.post('/register', async (req, res) => {

   const Username = req.body.username.trim();
   const Email = req.body.email.trim();
   const Password = req.body.password.trim();
   const Cpassword = req.body.confirm_p.trim();

   console.log(Username, Email, Password, Cpassword);

   if (Username && Email && Password && Cpassword) {

      var user = await Form_data.findOne(
         {
            $and:[
               { username: Username },{ email: Email }
            ]
         }
      )
      // .catch((err)=>{
         //    console.log('User Already Exist with this Username and Email');
         // })
      if (user == null) {
         const data = new Form_data({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirm_p,

         })
         if (req.body.password == req.body.confirm_p) {
            
            data.password = await bcrypt.hash(req.body.password, 10);
            console.log(data);
            Form_data.create(data)
            .then((user) => {
               res.json({
                  message: 'Registered Successfully...',
                  values: user
                  })
               })
         }
         else {
            req.flash('message', 'Passwords are not matching');
            return res.redirect('/', { message: res.flash('message') })
         }
      }
      else {
         req.flash('message', 'Username and Email already in use');
        return  res.redirect('/', { message: res.flash('message') })
      }


   }
   else {
      req.flash('message', 'Make sure each input is filled');
      res.render('/', { message: req.flash('message') })
   }
})


app.get('/login',(req,res)=>{
   res.render('login');
})

app.post('/login',async (req,res)=>{

   const Username=req.body.username;
   const Password=req.body.password;

   if(Username && Password)
   {
      var user=await Form_data.findOne({username:Username})
      
      if(user!=null)
      {
         const ismatch= await bcrypt.compare(Password,user.password)

         if(ismatch==true)
         {
            // req.session.user=user;
            return res.send({
               message:'Successfully LOGGED IN.....',
               value:user
            })
         }
         else{
            req.flash('message','Incorrect Password')
            return res.redirect('/login',{message:req.flash('message')});
         }

      }
      else{
         req.flash('message','User not found')
         return res.redirect('/login',{message:req.flash('message')});


      }
   }
   else{
      req.flash('message','Make sure each input field is filled');
      return res.redirect('/login',{message:req.flash('message')});
   }

})


app.get('/forgetPassword',(req,res)=>{
   res.render('forget');
})

app.post('/forgetPassword',controller.forget_password)


app.get('/resetpassword',controller.reset_password)

app.listen(PORT, () => {
   console.log(`Listening on Port http://${hostname}:${PORT}`);
})