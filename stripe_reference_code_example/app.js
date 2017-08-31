
//____________________________________BEGIN setup
var express = require('express');
var path = require('path');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();
var expressHbs = require('express-handlebars');
var stripe = require("stripe")("sk_test__REPLACE-WITH_STRIPE_KEY");

app.engine('hbs', expressHbs({
    extname: 'hbs'
}));

app.set('view engine', 'hbs');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')))




//____________________________________END setup


app.get("/", (req,res)=>{

    res.render("index",{
      data:"oink"
    })


});

app.post("/payment", (req, res) => {

    var stripeUserEmail = req.body.stripeEmail;

    console.log(stripeUserEmail);

    stripe.customers.create({
        description: 'Customer for ' + stripeUserEmail
    }, function(err, customer) {
        console.log(customer.id);
        console.log(customer.description);
        // get user object ID and store it in local database
        
    });

    res.redirect("/");

});




app.get("/users", (req, res) => {

    stripe.customers.list(
        function(err, customers) {
            console.log(customers.data);

           
                res.render("users",{
                  users:customers.data
                
                });

            
        }
    );

});




//____________________________________BEGIN Start server

app.listen("3002");

console.log("working");
//____________________________________END Stat server
