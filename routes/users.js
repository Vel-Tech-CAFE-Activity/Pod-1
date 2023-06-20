var express = require('express');
var router = express.Router();
var { GRAPH_ME_ENDPOINT } = require('../AzureAuthcomp/authConfig');

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); 
    }

    next();
};

module.exports = router;