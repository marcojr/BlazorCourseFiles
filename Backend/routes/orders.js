'use strict';
var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');
const { v4: uuidv4 } = require('uuid');

/* GET users listing. */
router.post('/create', function (req, res) {
    const filename = path.join(__dirname, '../data/writable', 'orders.json')
    let rawdata = fs.readFileSync(filename);
    let orders = JSON.parse(rawdata);
    let customerId = req.body.customerId;
    let items = req.body.items;
    if (!customerId || !items) {
        console.log("Missing Fields");
        console.log(req.body);
        res.send(403, 'ERR_MISSING_FIELDS')
        return;
    }
    if (customerId === "" || items.length === 0) {
        console.log(req.body);
        console.log("invalid data");
        res.send(403, 'ERR_INVALID_DATA')
        return;
    }
    // Check if the customer exists
    const customer = getCustomer(customerId)
    if (customer == null) {
        console.log(req.body);
        console.log("invalid customer");
        res.send(403, 'ERR_INVALID_CUSTOMER')
        return;
    }
    const orderId = uuidv4();
    let customerOrders = orders.filter(flt => (flt.customerId == customerId))
    const total = getOrderTotal(items)
    // check if the customer can afford
    if (parseFloat(customer.balance) < parseFloat(total)) {
        console.log(req.body);
        console.log("can't afford");
        res.send(403, 'ERR_CANT_AFFORD')
        return;
    }
    const newBalance = parseFloat(customer.balance) - parseFloat(total)
    if (customerOrders.length === 0) {
        orders.push({
            customerId: customerId,
            orders: [
                {
                    orderId,
                    total,
                    purchaseDate: new Date(),
                    items                }
            ]
        })
    }
    else {
        for (let i = 0; i < orders.length ; i++) {
            if (orders[i].customerId === customerId) {
                orders[i].orders.push({
                    orderId,
                    total,
                    purchaseDate: new Date(),
                    items
                })
            }
        }
}
    // update customer balance
    updateCustomerBalace(customerId, newBalance);
    fs.writeFileSync(filename, JSON.stringify(orders))
    res.json({
        successfully: true, orderId, total, newBalance
    });
});
router.get('/list', function (req, res) {
    const filename = path.join(__dirname, '../data/writable', 'orders.json')
    let rawdata = fs.readFileSync(filename);
    let orders = JSON.parse(rawdata);
    let customerId = req.query.customerId;
    if (!customerId) {
        res.send(403, 'ERR_MISSING_FIELDS')
        return;
    }
    if (customerId === "") {
        res.send(403, 'ERR_INVALID_DATA')
        return;
    }
    // Check if the customer exists
    if (!isValidCustomer(customerId)) {
        res.send(403, 'ERR_INVALID_CUSTOMER')
        return;
    }
    let customerOrders = orders.filter(flt => (flt.customerId == customerId))
    res.json({
        successfully: true, orders: customerOrders[0].orders, count: customerOrders[0].orders.length
    })
});

function getCustomer(id) {
    const filename = path.join(__dirname, '../data/writable', 'customers.json')
    let rawdata = fs.readFileSync(filename);
    let customers = JSON.parse(rawdata);
    let exists = customers.filter(flt => (flt.customerId == id))
    if (exists.length > 0) {
        return exists[0]
    } else {
        return null
    }
}
function updateCustomerBalace(customerId, newBalance) {
    const filename = path.join(__dirname, '../data/writable', 'customers.json')
    let rawdata = fs.readFileSync(filename);
    let customers = JSON.parse(rawdata);
    for (let i = 0; i < customers.length; i++) {
        if (customers[i].customerId === customerId) {
            customers[i].balance = newBalance;
        }
    }
    fs.writeFileSync(filename, JSON.stringify(customers))
    return null
}
function getOrderTotal(items) {
    const filename = path.join(__dirname, '../data/readOnly', 'products.json')
    let rawdata = fs.readFileSync(filename);
    let products = JSON.parse(rawdata);
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        for (let j = 0; j < products.length; j++) {
            if (products[j].productId === items[i].productId) {
                total = total + (parseFloat(products[j].price) * items[i].quantity)
            }
        }
    }
    return parseFloat(total)
}


module.exports = router;
