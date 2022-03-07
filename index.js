const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config()
const port = 5000
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7oely.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const appointmentsCollections = client.db("doctorsPortal").collection("appointments");
    // const ordersCollections = client.db("emaJhonDB").collection("orders");

    app.post('/addAppointments', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentsCollections.insertOne(appointment)
            .then(result => {
                console.log(result);
                res.send(result.acknowledged)
            })
    })

    // app.get('/products', (req, res) => {
    //     const search=req.query.search;
    //     console.log(search);
    //     productsCollections.find({name:  RegExp(search)}).limit(20)
    //         .toArray((err, documents) => {
    //             res.send(documents)
    //         })
    // })

    //  //to show products on ReviewItem.js
    // app.get('/product/:key', (req, res) => {
    //     productsCollections.find({ key: req.params.key })
    //         .toArray((err, documents) => {
    //             res.send(documents[0])
    //         })
    // })
    //  //to show products on Review.js and Shop.js
    // app.post('/productsByKey', (req, res) => {
    //     const productKeys = req.body;
    //     productsCollections.find({ key: { $in: productKeys } })
    //         .toArray((err, documents) => {
    //             res.send(documents);
    //         })
    // })
    //  //to process product order on Shipment.js
    // app.post('/addOrder', (req, res) => {
    //     const order = req.body;
    //     ordersCollections.insertOne(order)
    //         .then(result => {
    //             console.log(result);
    //             res.send(result.acknowledged)
    //         })
    // })

    console.log('db connected');
});


app.get('/', (req, res) => {
    res.send("Hlw NODE JS");
})

// app.listen(port);
app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})