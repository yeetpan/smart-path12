
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


// Importing Libraies that we installed using npm
const path=require('path')
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []
app.use(express.static('html')); // Assuming your HTML files are in the "html" directory
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role:req.body.role
        })
        console.log(users); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        
        const userRole = req.user.role;

        
        let dashboardRoute;

        if (userRole === 'student') {
            dashboardRoute = 'student.html'; 
        } else if (userRole === 'teacher') {
            dashboardRoute = 'teacher.html'; 
        } else if (userRole === 'parent') {
            dashboardRoute = 'parent.html'; 
        } else {
           
            return res.status(403).send('Access denied');
        }

       
        res.sendFile(path.join(__dirname, 'html', dashboardRoute));
    } else {
       
        res.render('login.ejs');
    }
});

app.get('/student', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'student.html'));
});

app.get('/teacher', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'teacher.html'));
});

app.get('/parent', checkAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'parent.html'));
});




app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.get("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

app.listen(3000)

// app.get('/', checkAuthenticated, (req, res) => {
//     res.render("index.ejs", {name: req.user.name})
// })