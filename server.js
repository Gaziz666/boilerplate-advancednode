'use strict'
require('dotenv').config()
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const myDB = require('./connection')
const fccTesting = require('./freeCodeCamp/fcctesting.js')
const ObjectId = require('mongodb').ObjectId

const app = express()
app.set('view engine', 'pug')
fccTesting(app) //For FCC testing purposes test
app.use('/public', express.static(process.cwd() + '/public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env['SESSION_SECRET'],
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  })
)
app.use(passport.initialize())
app.use(passport.session())

myDB(async (client) => {
  const myDatabase = await client.db('database').collection('users')

  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug', {
      title: 'Connected to db',
      message: 'Please login'
    })
  })

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectId(id) }, (err, doc) => {
      done(null, null)
    })
  })
}).catch((err) => {
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug', {
      title: err,
      message: 'Unable to login'
    })
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})
