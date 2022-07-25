'use strict';
var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');

/* GET users listing. */
router.get('/', function (req, res) {
    let rawdata = fs.readFileSync(path.join(__dirname, '../data/readOnly','products.json'));
    let products = JSON.parse(rawdata);
    if (req.query.category) {
        const rawdataCat = fs.readFileSync(path.join(__dirname, '../data/readOnly', 'categories.json'));
        const categories = JSON.parse(rawdataCat);
        const cat = categories.filter(flt => (flt.categoryId === parseInt(req.query.category) || flt.key === req.query.category))
        if (cat.length === 0) {
            res.send(403, 'ERR_INVALID_CATEGORY')
            return;
        }
        const catId = cat[0].categoryId
        const prods = products.filter(flt => (flt.categoryId == catId));
        res.json(
            {
                categoryId: cat[0].categoryId,
                key: cat[0].key,
                name: cat[0].name,
                products: prods
            }
        )
    } else {
        res.json(products);
    }
});
router.get('/get/:productId', function (req, res) {
    let rawdata = fs.readFileSync(path.join(__dirname, '../data/readOnly', 'products.json'));
    let products = JSON.parse(rawdata);
    const prod = products.filter(flt => (flt.key == req.params.productId || flt.productId == req.params.productId));
    if (prod.length === 0) {
        res.send(404);
    } else {
        res.json(prod[0]);
    }
});
router.get('/home', function (req, res) {
    let rawdata = fs.readFileSync(path.join(__dirname, '../data/readOnly', 'products.json'));
    let products = JSON.parse(rawdata);
    res.json(products.filter(flt => flt.showOnHome == true));
});

module.exports = router;
