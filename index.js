const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const taxConfig = require('./taxConfig');

app.use(bodyParser.json());


app.post('/price/cal', (req, res) => {
    let lists = req.body.list;
    let taxAmount = 0;
    let totalTaxPer = 0;
    let totalPrice = 0;
    for (list of lists) {
        let eachItemTotalPrice = list.quantity * list.price;
        taxPer = calculateTax(list.itemCategory, eachItemTotalPrice)
        list.tax = taxPer;
        list.totalAmount = eachItemTotalPrice;
        totalPrice += eachItemTotalPrice;
        taxAmount += (eachItemTotalPrice * taxPer) / 100;
        totalTaxPer += taxPer;
    };
    let discount = (totalPrice + taxAmount <= 2000) ? 0 : ((totalPrice + taxAmount) * 5) / 100;
    let afterTaxDedution = totalPrice - taxAmount;

    let output = {
        dateOfPurchage: Date.now(),
        ListOfItems: sortItems(lists, 'item'),
        totalTaxPercentage: totalTaxPer,
        totalPrice: totalPrice,
        taxAmount: taxAmount,
        afterTaxDedution: afterTaxDedution,
        discount: discount,
        finalPrice: afterTaxDedution - discount

    }
    res.send({
        status: 200,
        message: 'Request processed succesfully',
        data: output
    })
})

app.listen(port, (err) => {
    if (err) console.log('Error while staring the server', err);
    else console.log(`Server running on the port ${port}`)
});

function sortItems(lists, item) {
    return lists.sort(function(a, b) {
        var keyA = a[item].toLowerCase(),
            keyB = b[item].toLowerCase();
        if (keyA > keyB) return 1;
        if (keyA < keyB) return -1;
        return 0;
    })
}

function calculateTax(item, amount) {
    console.log('Item++', item);
    let requiredTaxItem = taxConfig[item];
    console.log('requiredTaxItem+++', requiredTaxItem)
    if (!requiredTaxItem) return 0;
    if (typeof requiredTaxItem == "number") return requiredTaxItem;
    let tax = 0;
    requiredTaxItem.forEach((each) => {
        if (!each.lte) {
            tax = (each.gte < amount) ? each.per : 0;
            return tax;
        }
        if (each.lte >= amount && each.gte <= amount) {
            return each.per;
        }
    });
    return tax;
}