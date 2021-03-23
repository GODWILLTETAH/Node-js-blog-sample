var express = require ('express');
var multer = require ('multer');
var fs = require ('fs');
const path = require ('path');
var app = express ();
var bodyParser = require ("body-parser");
app.use(express.static(__dirname+"/static"));
//app.use( '/uploads', express.static(__dirname+'/uploads'));
app.use(express.static("uploads"))
app.set("view engine", "ejs");
//var expressLayouts = require('express-ejs-layouts');
var session = require ('express-session');
app.use(session({
  key: "admin",
  secret: "any random string"
}));

//app.use (bodyParser.urlencoded());
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
//connect to database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/studies', {useNewUrlParser: true, useUnifiedTopology: true}
, (err) => {
if (!err) {
  console.log ('Connection to database established succesfully!');
} else {
  console.log(err);
}
});

const storage = multer.diskStorage({
  destination:(req, file, cb) => {
      cb(null, './uploads');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

var upload = multer({ storage: storage });

var blogSchema = new mongoose.Schema({
    title:{
      type:String,
      required: 'this field is required'
    },
    content: {
      type:String,
      required: 'this field is required'
    },
    image:
    {
        type: String
    }
  });
  const post = mongoose.model ('post', blogSchema);


app.post('/do-post', upload.single('image'), function (req, res, next){
  console.log(req.file) ;
  var blogpost = new post ();
  blogpost.title = req.body.title;
  blogpost.content = req.body.content;
  blogpost.image = req.file.filename;
  blogpost.save ((err, doc)=>{
  if (!err)
  {
    console.log('saved');
res.send ("posted successfully");
  }
  else
  console.log (err);
});
})

app.get ('/', function (req, res){
  post.find().sort({"_id":-1})
      .then(function(doc) {
        res.render('user/home', {post: doc});
      });
});

app.get ('/admin/dashboard', function (req, res){
if(req.session.admin){
  res.render ('admin/dashboard.ejs');
}else {
res.redirect ("/admin");
}

});

app.get ('/admin/post', function (req, res){
if (req.session.admin){
  res.render ('admin/posts');
} else {
res.redirect("/admin")
}
});

app.get ("/admin", function (req, res){
  res.send ('a form to login or register')
})

app.get('/posts/:id', function (req, res){
  post.findById(req.params.id, (err, doc) => {
    res.render ('user/posts', {post: doc});
    });
});












app.listen (3000, function (){
    console.log ('running on 3000');
});