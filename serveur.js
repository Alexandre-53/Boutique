//API EXPRESS
const express = require('express');
const bodyParser= require('body-parser'); 
const session = require('express-session'); 
const app = express();
var ObjectId = require('mongodb').ObjectId; 
var crypto = require('crypto');
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
  app.use((req, res, next) => {
    res.locals.user = req.session.user
    next()
  })
app.listen(4242, function() {
    console.log('Serveur web : http://127.0.0.1:4242')
  })

  //MESSAGE
  message = "Email ou mot de passe incorrecte";
  messageadd = "";
  messagecat = "";
  registermess = "";
  var registermessok = "Vous êtes maintenant inscrit";
  var registermessfail = "Erreur lors de l'inscription";
  var messageok = "Produit ajouté avec succès";
  var messagefail = "Erreur lors de l'ajout du produit";
  var messagecatok = "Produit ajouté avec succès";
  var messagecatfail = "Erreur lors de l'ajout du produit";

  //CONNEXION MONGODB
  const MongoClient = require('mongodb').MongoClient  
  MongoClient.connect('mongodb://127.0.0.1:27042', { useUnifiedTopology: true }, (err, database) => {
    db = database.db("makina");
            if (err) {
                console.log("Connection failed.");       
            } else {
                console.log("Connection successfull.");
            }
 })

  //ROUTES INDEX
  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html')
 })


 //ROUTES LOGIN
 app.get('/login',function (req, res) {
    res.render('user/login.ejs',{message: ""});
     });
    
app.get('/accueil',function (req, res) {
res.render('welcome/index.ejs');
    });

app.post('/accueil', (req, res) => {
    user = req.body.username;
    password = req.body.password;

var hash = crypto.createHash('sha1').update(password).digest('hex');

db.collection('utilisateur').findOne({email: user, password: hash}, function(err,confirm ) {
    if (!confirm) {
        
     res.status(400).render('user/login.ejs', {message: message});
        
    } else{
        req.session.user = confirm;
        res.status(200).redirect('/accueil');
    }
  })
})

//ROUTE LOGOUT
app.get('/logout', (req, res) => {
    delete req.session.user;
    res.sendFile(__dirname + '/views/index.html');
})

//ROUTES REGISTER
app.get('/register',function (req, res) {
    res.render('user/register.ejs',{registermess: ""});
     });

app.post('/register', (req, res) => { 
    login = req.body.login;
    email = req.body.email;
    password = req.body.password;
    admin = false;
var hash = crypto.createHash('sha1').update(password).digest('hex');

user ={
    login:login,
    email:email,
    password:hash,
    admin:admin
}

db.collection('utilisateur').insert(user, function (err, result){
    if(err){
        res.render('user/register.ejs', {registermess: registermessfail});
    }else{
        res.render('user/register.ejs', {registermess: registermessok});
    }
    })
})

//ROUTE COMPTE
app.get('/compte',function (req, res) {
    res.render('user/compte.ejs');
     });

//ROUTE BOUTIQUE
app.get('/boutique',function (req, res) {
db.collection('boutique').find({}).sort({}).toArray(function(err, result) {
    if (err) throw err;
res.render('boutiques/index.ejs', {results: result});
    });
})

app.get('/boutique/:id',function (req, res) {
    idprod = req.params.id;
    db.collection('boutique').findOne({"_id": ObjectId(idprod)}, function(err, result) {
        if (err) throw err;
    res.render('boutiques/article.ejs', {article: result});
        });
    })


//ROUTE ADMIN PRODUIT
app.get('/admin/add/product',function (req, res) {
    db.collection('boutique').find({}).sort({}).toArray(function(err, articles) {
        if (err) throw err;
    res.render('admin/addarticle.ejs', {messageadd: "", results: articles});
    })
})

app.post('/admin/add/product/', (req, res) => {
    titre = req.body.titre;
    description = req.body.description;
    prix = req.body.prix;
    categorie = req.body.categorie;
    
    
    produit ={
    titre:titre,
    description:description,
    prix:prix,
    categorie:categorie
    }
    
    db.collection('boutique').insert(produit, function (err, result){
    if(err){
        res.status(400).render('admin/addarticle.ejs', {messageadd: messagefail, results: false});
    }else{
        res.status(200).render('admin/addarticle.ejs', {messageadd: messageok, results: false});
    }
    })
    })

//ROUTE ADMIN GEST PRODUIT
app.get('/admin/gest/product',function (req, res) {
    db.collection('boutique').find({}).sort({}).toArray(function(err, articles) {
        if (err) throw err;
    res.render('admin/gestarticle.ejs', {results: articles});
    })
})

app.get('/admin/delete/product/:id',function (req, res) {
    idprod = req.params.id;
    console.log(idprod)
    db.collection('boutique').deleteOne({"_id": ObjectId(idprod)}, function(err, result) {
        if (err) throw err;
        });
        res.redirect('../../../admin/gest/product');
    })



//ROUTE ADMIN CATEGORIE
app.get('/admin/add/category',function (req, res) {
    res.render('admin/addarticle.ejs', {messageadd: ""});
        });

app.post('/admin/add/category', (req, res) => {
titre = req.body.categorie;
description = req.body.description;
prix = req.body.prix;

produit ={
titre:titre,
description:description,
prix:prix
}

db.collection('boutique').insert(produit, function (err, result){
if(err){
    res.status(400).render('admin/addarticle.ejs', {messageadd: messagefail});
}else{
    res.status(200).render('admin/addarticle.ejs', {messageadd: messageok});
}
})
})

//ROUTE ADMIN GEST UTILISATEUR
app.get('/admin/gest/user',function (req, res) {
    db.collection('utilisateur').find({}).sort({}).toArray(function(err, user) {
        if (err) throw err;
    res.render('admin/gestuser.ejs', {results: user});
    })
})

app.get('/admin/delete/user/:id',function (req, res) {
    idprod = req.params.id;
    console.log(idprod)
    db.collection('utilisateur').deleteOne({"_id": ObjectId(idprod)}, function(err, result) {
        if (err) throw err;
        });
        res.redirect('../../../admin/gest/user');
    })