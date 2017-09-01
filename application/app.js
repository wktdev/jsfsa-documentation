"use strict";

//______________________________________BEGIN setup
const Sequelize = require("sequelize");

const connection = new Sequelize("jsfsa", "postgres", "password", {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres',
    logging: false
});

const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const salt = bcrypt.genSaltSync(10);
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://sillylittletester1234%40gmail.com:wordpass1234@smtp.gmail.com');
const app = express();
const session = require('client-sessions');
const expressHbs = require('express-handlebars');
const csrf = require("csurf");
app.engine('hbs', expressHbs({
    extname: 'hbs'
}));
app.set('view engine', 'hbs');

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    cookieName: 'session',
    secret: "isuhvouisbvi98r9u23o989473u8roijfnvidnvj",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    ephemeral: true
        // secure:true 



}));


//_________________________________________END Setup____________________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Session-check middleware
//______________________________________________________________________________________________

app.use(csrf());


app.use((req, res, next) => {

    if (req.session && req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            }
        }).then((user) => {
            req.user = user;
            delete req.user.password;
            req.session.user = user;
            res.locals.user = user;


            next();

        });
    } else {


        res.locals.logInOutText = "Log In"
        res.locals.logInOut = "login";

        next();
    }

});




//_________________________________________END session check middleware__________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Models
//_______________________________________________________________________________________________


const User = connection.define("user", {
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING,
        unique: true

    },
    password: {
        type: Sequelize.STRING
    },

    isStudent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },

    subscribed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false

    },


    isMentor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false

    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false

    },

    resetLinkExpires: {
        type: Sequelize.BIGINT
    },
    resetLinkEndPoint: {
        type: Sequelize.STRING,
        defaultValue: false

    },


});

connection.sync();



//_________________________________________END Models__________________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Create Admin(s)
//_____________________________________________________________________________________________




// function makeAdmin(firstName, lastName, email, password) {
//     let hash = bcrypt.hashSync(password, salt);
//     let user = User.build({
//         firstName: firstName,
//         lastName: lastName,
//         email: email,
//         password: hash,
//         isStudent: false,
//         subscribed: true,
//         isMentor: true,
//         isAdmin: true

//     });

//     user.save();
// }

// makeAdmin("Bob", "James", "xxx@gmail.com", "password"); // CHANGE DATA !!!!!!!!!!!!!




//_________________________________________END Create Admin(s)_________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN middleware
//_____________________________________________________________________________________________



app.use(function(req, res, next) {
    console.log("middleware is working");

    if (req.session && req.session.user) {
        // console.log(req.session.user.email);


        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            // console.log(user);
            res.locals.logInOutText = "Log Out";
            res.locals.logInOut = "/logout";
            res.locals.dashboardText = "Dashboard";

            next();
        })



    } else {

        res.locals.logInOutText = "Log In"
        res.locals.logInOut = "/login";

        next();
    }

})


//_________________________________________END Middleware______________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Basic routes
//_____________________________________________________________________________________________

app.get("/", (req, res) => {
    res.render("page/index");

});

app.get("/home", function(req, res) {
    res.redirect("/")
})

app.get("/about", function(req, res) {
    res.render("page/about")
})

app.get("/faq", function(req, res) {
    res.render("page/faq")

})

app.get("/contact", function(req, res) {
    res.render("page/contact")

})

//_________________________________________END Basic routes____________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Registration
//_____________________________________________________________________________________________


app.get("/register", (req, res) => {



    if (req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            if (user.subscribed) {
                res.redirect("/error");
            } else {
                res.redirect("/payment")
            }


        })




    } else {

        res.render("page/register", {
            csrfToken: req.csrfToken()
        });

    }

});




app.post("/register", (req, res) => {
    req.session.reset();
    var areFormsEmpty = checkIfEmpty(req.body);
    let hash = bcrypt.hashSync(req.body.password, salt);
    var email = req.body.email;
    if (areFormsEmpty) {

        res.render("register", {
            flashError: "Empty field"
        })
    } else {

        User.findOne({
            where: {
                email: req.body.email
            }
        }).then((user) => {

            if (user) {


                res.render("register", {
                    flashError: "That email is already in use"
                })

            } else {

                var user = User.build({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: hash,
                    subscribed: false

                })

                req.session.user = user;

                user.save();

                res.redirect("/payment");

            }

        });
    }

});


//_________________________________________END Registration___________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Login
//____________________________________________________________________________________________




app.get("/login", function(req, res) {

    if (req.session.user) {
        res.redirect("/error")
    } else {
        res.render("page/login", {
            csrfToken: req.csrfToken()
        })
    }
})


app.post("/login", (req, res) => {

    User.findOne({
        where: {
            email: req.body.email
        },
    }).then((user) => {

        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {

                req.session.user = user;
                res.redirect("/dashboard")
            } else {

                res.render("page/login", {
                    csrfToken: req.csrfToken(),
                    flashError: "The email or password is invalid"
                })


            }
        } else {
            res.render("page/login", {
                csrfToken: req.csrfToken(),
                flashError: "The email or password is invalid"
            })
        }

    });


});





app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/")

});


//_________________________________________END Login__________________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Dashboard
//____________________________________________________________________________________________


app.get("/dashboard", function(req, res) {

    // Add dashboard for mentors 

    if (req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            console.log(user.subscribed);

            if (user.subscribed === true) {
                res.render("page/dashboard", {
                    firstName: user.firstName,
                    lastName: user.lastName
                })
            } else {
                res.redirect("/payment")
            }

        });
    } else {
        res.redirect("/login")
    }

});


//_________________________________________END Dashboard__________________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Dashboard Checkpoint Lessons
//____________________________________________________________________________________________


app.get("/dashboard/jsfsa/:id", function(req, res) {

    // Add dashboard for mentors 

    if (req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            console.log(user.subscribed);

            if (user.subscribed === true) {
                res.render("modules/jsfsa/lesson-" + req.params.id + "/lesson", {
                    firstName: user.firstName,
                    lastName: user.lastName
                })
            } else {
                res.redirect("/payment")
            }

        });
    } else {
        res.redirect("/login")
    }

});


//_________________________________________END Dashboard Checkpoint Lessons____________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Administrators Dashboard
//_____________________________________________________________________________________________

app.get("/admin", (req, res) => {


    if (req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            if (user.isAdmin === true) {

                User.findAll({
                    where: {
                        isMentor: true
                    }
                }).then((mentorList) => {


                    res.render("page/admin", {
                        mentors: mentorList

                    })


                });


            } else {
                res.redirect("/")
            }

        });
    } else {
        res.redirect("/")
    }


});





//_________________________________________END Administrators Dashboard________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Payment
//_____________________________________________________________________________________________





app.get("/payment", (req, res) => {

    if (req.session.user) {

        User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {

            if (user.subscribed) { //________________User does not exist
                res.redirect("/error");
            } else if (user.subscribed === false) {

                res.render("page/payment", {
                    csrfToken: req.csrfToken()
                })

            } else { //______________________________Password is wrong


                res.render("page/payment", {
                    csrfToken: req.csrfToken()
                })

            }

        });


    } else {
        res.redirect("/")
    }
});



app.post("/payment", function(req, res) {
    console.log(req.body.stripeToken)
    if (req.session.user.email) {
        var user = User.findOne({
            where: {
                email: req.session.user.email
            },
        }).then((user) => {
            user.subscribed = true;
            user.save();
            // console.log(user);
            res.redirect("/dashboard")


        });
    }
})

//_________________________________________END Payment______________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Password Reset
//__________________________________________________________________________________________



app.get("/reset", (req, res) => {
    res.render("page/reset_password", {
        csrfToken: req.csrfToken()

    })
});

app.post("/resetPassword", (req, res) => {
    var user = User.findOne({
        where: {
            email: req.body.email
        }
    }).then((user) => {
        if (user) {

            var token = undefined;

            crypto.randomBytes(20, function(err, buf) {
                token = buf.toString('hex');
                console.log(token);
                user.update({
                    resetLinkEndPoint: token,
                    resetLinkExpires: Date.now() + 3600000
                });

                res.render("page/email_sent", {
                    message: "An email has been sent to you with further instructions"
                });



                var mailOptions = {
                    from: '"JavaScript For Sound Artists" <wktdev@gmail.com>', // sender address
                    to: user.email,
                    subject: 'Hello ✔', // Subject line
                    text: 'http://localhost:3000/reset/' + user.resetLinkEndPoint
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: ' + info.response);
                });


            })




        } else {
            console.log("no user");
            res.render("page/reset_password", {
                csrfToken: req.csrfToken(),
                flashError: "The email or password is invalid"

            })
        }

    })

});

app.post("/updatepassword/:reset_id", (req, res) => {
    console.log(req.params.reset_id);

    //Check if passwords match
    if (req.body.password === req.body.password_verify) {
        console.log("Password verify matches");

        var user = User.findOne({
            where: {
                resetLinkEndPoint: req.params.reset_id
            }
        }).then((user) => {

            console.log("user resetLink: " + user.resetLinkEndPoint);
            console.log("URL resetLink endpoint: " + req.params.reset_id);

            if (user.resetLinkEndPoint === req.params.reset_id) {
                console.log("endpoints match");
                let hash = bcrypt.hashSync(req.body.password, salt);
                user.update({
                    password: hash
                }).then((user) => {
                    console.log("Password changed");
                })
            }

        });



    } else {
        console.log("Passwords don't match");
    }

    res.redirect("/")



});

app.get("/reset/:token", (req, res) => {


    var user = User.findOne({
        where: {
            resetLinkEndPoint: req.params.token
        }
    }).then((user) => {

        if (user.resetLinkExpires < Date.now()) {
            res.render("page/general_error", {
                message: "Password reset has expired"
            });
        } else if (user.resetLinkExpires > Date.now()) {
            res.render("page/reset", {
                message: "Please enter your email and a new password",
                value: req.params.token,
                csrfToken: req.csrfToken()

            });

        } else {
            res.redirect("/");
        }

    }).catch(function(err) {
        res.redirect("/"); // If user does not exist -> then redirect
    });


});






//_________________________________________END Password Reset________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Error check
//___________________________________________________________________________________________




app.get("/error", function(req, res) {

    if (req.session.user) {
        res.render("page/error");
    } else {
        res.redirect("/");
    }


});



//_________________________________________END Error Check____________________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Helper Functions
//____________________________________________________________________________________________


function checkIfEmpty(obj) {
    var empty = false;
    for (var prop in obj) {

        if (obj[prop] === "") {

            empty = true

        }

    }

    return empty
}



//_________________________________________END Helper Functions_____________________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Default Route Redirect
//__________________________________________________________________________________________


app.get("*", function(req, res) {
    res.redirect("/")
})


//_________________________________________END Default Route Redirect______________________
//:::::::::::::::::::::::::::::::::::::::
//:::::::::::::::::::::::::::::::::::::::  BEGIN Start Server
//_________________________________________________________________________________________

app.listen("3000", (err) => {

    if (err) {
        console.log("server is not working");
    } else {
        console.log("Server is working on 3000");
    }
});