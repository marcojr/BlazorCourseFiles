'use strict';
var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');

/* GET users listing. */
router.get('/', function (req, res) {
    let rawdata = fs.readFileSync(path.join(__dirname, '../data/readOnly', 'categories.json'));
    let categories = JSON.parse(rawdata);
    res.json(categories);
});

module.exports = router;
