const  uploadFile  = require('../controllers/upload');

const Router = require('express').Router;

const route = Router();


route.post('/file', uploadFile)

module.exports = route;
