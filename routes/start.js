var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
const bcrypt = require("bcryptjs")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
router.use(cookieParser());
router.use(express.urlencoded({ extended: 'false' }))
router.use(express.json())
const oneDay = 1000 * 60 * 60 * 24;
var session;

router.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

// display user page
router.get('/', function(req, res, next) {
    res.render("start")
});

// display user page
router.get('/login', function(req, res, next) {
    res.render("start/login")
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

router.post("/auth/register", async function(req, res) {
    const { email, password } = req.body
    let hashedPassword = await bcrypt.hash(password, 8)
    let errors = false;
    console.log(hashedPassword)
    if (email.length === 0 || password.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter username and password");
        // render to add.ejs with flash message
        res.redirect("/login")
    }
    if (!errors) {
        // db.query() code goes here\
        dbConn.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
            req.flash('error', err);

            if (rows.length <= 0) {
                req.flash('error', 'Wrong username or password')
                res.redirect('/login')
            }

            bcrypt.compare(password, rows[0].password, (err, data) => {
                //if error than throw error
                if (err) throw err

                //if both match than you can do anything
                if (data) {
                    // if user found
                    session = req.session;
                    session.userid = email;
                    session.loggeddIn = true;
                    session.admin = rows[0].category == 'Admin' ? true : false;
                    if (rows[0].category == 'Admin') {
                        // render to edit.ejs
                        res.redirect('/stations')
                    } else {
                        res.redirect('/fuelstatus')
                    }
                } else {
                    req.flash('error', 'Wrong username or password')
                    res.redirect('/login')
                }

            })
        })
    }
})

module.exports = router;