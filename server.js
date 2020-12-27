//import
const { EILSEQ } = require('constants');
const express= require('express');
const app = express();
const session = require('cookie-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const { get } = require('http');
const mongourl = 'mongodb+srv://demo:1234@cluster0.hdjot.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'assignment';
//Restful
const cors = require('cors')
app.use(cors())

//Handle File CSS  js  and img
app.use(express.static('public'));
app.use('/css',express.static(__dirname+'public/css'));
app.use('/js',express.static(__dirname+'public/js'));
app.use('/img',express.static(__dirname+'public/img'));
// Middleware->support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set View
app.set('view engine','ejs');
//Create Session
const SECRETKEY='secretkeyyyy';
app.use(session({
    name: 'loginSession',
    keys: [SECRETKEY],
    cookie:{maxAge:6000}//timeout
}));


////////////////////////////////
//Default Page
app.get('/',(req,res)=>{
    returnTime(req);
    console.log('/ -->GET');
    //console.log(req.session);
	if (!req.session.authenticated) {    // user not logged in!
		res.redirect('/login'); //--> to GET /login
	} else {  
        //to index.ejs
        res.redirect('/index');
	}
});
//GET login
app.get('/login',(req,res)=>{
    console.log('/login -->GET');
    returnTime(req);
    //read login.ejs
    if(!req.session.authenticated){
        res.render('login');
    }else{
        //to index.ejs
        res.redirect('/index');
    }
    
    
});
app.post('/login',(req,res)=>{
    console.log('/login -->POST');
    authUser(req,res);
});



//GET index & //Get the detail of restaruant

app.get('/index',(req,res)=>{
    if(!req.session.authenticated){
        res.render('login');
    }else{
        const client = new MongoClient(mongourl);
        const criteria = {};
        client.connect((err) => {
          assert.equal(null, err);
          console.log("Connected successfully to server");
          const db = client.db(dbName);
          findDocument(db, criteria, (docs) => { //if smthing need to return ()<--(docs)
              client.close();
              console.log("Closed DB connection");
          })
      });
        const findDocument = (db, criteria, callback) => {
          let cursor = db.collection('restaurant').find(criteria).toArray(function(err,docs){
            //handle here
            console.log(docs.length);
            //console.log( docs[3].name);

            res.render('index.ejs',{userID:req.session.userID,noR:docs.length,r:docs});
          });
      
        
         callback();
         
        }
         
        
    }
});


  
//Create New Restaurent 
//from index to create form
app.get('/createRestForm',(req,res)=>{
    if(!req.session.authenticated){
        res.render('login');
    }else{
        //New Restarant Form
        res.render('createRestForm');
    }
});
//Hand in restarent form
app.post('/createRestForm',(req,res)=>{
    if(!req.session.authenticated){
        res.render('login');
    }else{
        //New Restarant Form
        //check form ,insert and 
        insertNewREST(req,res);
    }
});

//Check User Name for Register
function authUser(req,res){
    const client = new MongoClient(mongourl); 
    const userID=req.body.userID;
    const userPW=req.body.userPW;
    const criteria = {"name":userID,"password":userPW};
    
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        findDocument(db, criteria, () => { //if smthing need to return ()<--(docs)
            client.close();
            console.log("Closed DB connection");
        })
       
    });
    const findDocument = (db, criteria, callback) => {
        let cursor = db.collection('user').find(criteria);
        cursor.forEach((doc)=> {
            if (doc.name == userID && doc.password==userPW) {
                req.session.authenticated = true;        // 'authenticated': true
                req.session.userID = req.body.userID;	 // 'username': req.body.name	  
                res.redirect('/');
            }
        });
        callback();
    }
    }





//function INSERT new Restaurent
function insertNewREST(req,res){

const client =new MongoClient(mongourl);
const DOC={"name":req.body.name,"cuisine":req.body.cuisine,"street":req.body.street,"building":req.body.building,"zipcode":req.body.zipcode};

const insertDocument = (db, doc, callback) => {
    db.collection('restaurant').
    insertOne(doc, (err, results) => {
        assert.equal(err,null);
        console.log(`Inserted document(s): ${results.insertedCount}`);
        res.redirect('/');
        callback();
    });
}

client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    insertDocument(db, DOC, () => {
        client.close();
        console.log("Closed DB connection");
    })
});
}



app.listen(process.env.PORT||8099);


//return visit time
function returnTime(req){
    let timestamp = new Date().toISOString();
    return console.log(`${timestamp} and ${req.method}`);
}


//////API  Name
app.get('/api/name/:name', (req,res) => {
    var result={};
    const client = new MongoClient(mongourl);
    const criteria = {"name":req.params.name};
    const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurant').find(criteria);
    cursor.forEach((doc) => {
        console.log(doc);
        if(doc.name.toUpperCase()==req.params.name.toUpperCase()){
            result[req.params]=doc;
            res.status(200).json(result)}
        else{result[req.params.name]='unknown'
             res.status(200).json(result)}
    });
    
    callback();
}
client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocument(db, criteria, () => { //if smthing need to return ()<--(docs)
        client.close();
        console.log("Closed DB connection");
    })
});

    
})




//////API  borough
app.get('/api/borough/:borough', (req,res) => {
    var result={};
    const client = new MongoClient(mongourl);
    const criteria = {"borough":req.params.borough};
    const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurant').find(criteria);
    cursor.forEach((doc) => {
        console.log(doc);
        if(doc.borough.toUpperCase()==req.params.borough.toUpperCase()){
            result[req.params]=doc;
            res.status(200).json(result)}
        else{result[req.params.borough]='unknown'
             res.status(200).json(result)}
    });
    
    callback();
}
client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocument(db, criteria, () => { //if smthing need to return ()<--(docs)
        client.close();
        console.log("Closed DB connection");
    })
});

    
})



//////API  cuisine
app.get('/api/cuisine/:cuisine', (req,res) => {
    var result={};
    const client = new MongoClient(mongourl);
    const criteria = {"cuisine":req.params.cuisine};
    const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurant').find(criteria);
    cursor.forEach((doc) => {
        console.log(doc);
        if(doc.cuisine.toUpperCase()==req.params.cuisine.toUpperCase()){
            result[req.params]=doc;
            res.status(200).json(result)}
        else{result[req.params.cuisine]='unknown'
             res.status(200).json(result)}
    });
    
    callback();
}
client.connect((err) => {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    findDocument(db, criteria, () => { //if smthing need to return ()<--(docs)
        client.close();
        console.log("Closed DB connection");
    })
});

    
})
