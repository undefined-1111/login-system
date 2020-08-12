const { black } = require("colors")
console.log(`
░█████╗░██╗░░░██╗████████╗██╗░░██╗░█████╗░██████╗░██╗███████╗░█████╗░████████╗██╗░█████╗░███╗░░██╗
██╔══██╗██║░░░██║╚══██╔══╝██║░░██║██╔══██╗██╔══██╗██║╚════██║██╔══██╗╚══██╔══╝██║██╔══██╗████╗░██║
███████║██║░░░██║░░░██║░░░███████║██║░░██║██████╔╝██║░░███╔═╝███████║░░░██║░░░██║██║░░██║██╔██╗██║
██╔══██║██║░░░██║░░░██║░░░██╔══██║██║░░██║██╔══██╗██║██╔══╝░░██╔══██║░░░██║░░░██║██║░░██║██║╚████║
██║░░██║╚██████╔╝░░░██║░░░██║░░██║╚█████╔╝██║░░██║██║███████╗██║░░██║░░░██║░░░██║╚█████╔╝██║░╚███║
╚═╝░░╚═╝░╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝░╚════╝░╚═╝░░╚═╝╚═╝╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚═╝░░╚══╝

██████╗░██╗░░░██╗
██╔══██╗╚██╗░██╔╝
██████╦╝░╚████╔╝░
██╔══██╗░░╚██╔╝░░
██████╦╝░░░██║░░░
╚═════╝░░░░╚═╝░░░

██╗░░░██╗███╗░░██╗██████╗░███████╗███████╗██╗███╗░░██╗███████╗██████╗░
██║░░░██║████╗░██║██╔══██╗██╔════╝██╔════╝██║████╗░██║██╔════╝██╔══██╗
██║░░░██║██╔██╗██║██║░░██║█████╗░░█████╗░░██║██╔██╗██║█████╗░░██║░░██║
██║░░░██║██║╚████║██║░░██║██╔══╝░░██╔══╝░░██║██║╚████║██╔══╝░░██║░░██║
╚██████╔╝██║░╚███║██████╔╝███████╗██║░░░░░██║██║░╚███║███████╗██████╔╝
░╚═════╝░╚═╝░░╚══╝╚═════╝░╚══════╝╚═╝░░░░░╚═╝╚═╝░░╚══╝╚══════╝╚═════╝░

`.cyan)
console.log("https://github.com/undefined-1111  undefined#1111".brightRed)
console.log("Made with <3 ".cyan)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
  
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const axios = require("axios")

const initializePassport = require('./passport-config')
const { default: Axios } = require("axios")
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET || bcrypt.genSaltSync(),
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    function search(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].name === nameKey) {
                return myArray[i];
            }
        }
    }

    const find = search(req.body.email, users)
    if(find) {
        res.redirect('/login')
    } else {
        let url = `https://google.com/recaptcha/api/siteverify?secret=6LcqE7wZAAAAANRu6nD_swag6pv2Os6JMCW0HHuN&response=${req.body['g-recaptcha-response']}`;
        axios.get(url).then(result=>{
            if(result.data.success !== true) {
                res.send('Капча была не пройдена!')
                return
            }
        })
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        res.redirect('/login')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
    return next()
}

res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(80, function () {
    console.log(`Сервер запущен на 80 порте, можешь зайти по айпи`);
});
