'use strict';
var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
const { v4: uuidv4 } = require('uuid');

/* GET users listing. */
router.post('/signUp', function (req, res) {
    const filename = path.join(__dirname, '../data/writable', 'customers.json')
    let rawdata = fs.readFileSync(filename);
    let customers = JSON.parse(rawdata);
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email.toLowerCase();
    let age = req.body.age;
    let balance = 30000;
    if (!password || !name || !email || !age) {
        res.send(403, 'ERR_MISSING_FIELDS')
        return;
    }
    if (password === "" || email === "" || name === "") {
        res.send(403, 'ERR_INVALID_DATA')
        return;
    }
    let exists = customers.filter(flt => flt.email == email).length > 0
    if (exists) {
        res.send(403, 'ERR_DUPLICATED_USER')
    } else {
        const customerId = uuidv4();
        customers.push({ customerId, name, age, email, password, balance })
        fs.writeFileSync(filename, JSON.stringify(customers))
        let data = {
            customerId, name, email,balance
        }
        res.json({
            successfully: true, data
        });
    }
});
router.post('/signin', function (req, res) {
    const filename = path.join(__dirname, '../data/writable', 'customers.json')
    let rawdata = fs.readFileSync(filename);
    let customers = JSON.parse(rawdata);
    let password = req.body.password;
    let email = req.body.email.toLowerCase();
    if (!password || !email) {
        res.send(403, 'ERR_MISSING_FIELDS')
        return;
    }
    if (password === "" || email === "") {
        res.send(403, 'ERR_INVALID_DATA')
        return;
    }
    let exists = customers.filter(flt => (flt.email == email && flt.password == password))
    if (exists.length ===0) {
        res.send(403, 'ERR_INVALID_CREDENTIALS')
    } else {
        const data = { customerId: exists[0].customerId, name: exists[0].name, age: exists[0].age, email: exists[0].email, balance: exists[0].balance };
        res.json({
            successfully: true, data
        });
    }
});

module.exports = router;
