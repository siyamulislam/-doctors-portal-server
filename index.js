const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const { MongoClient, ObjectId } = require('mongodb');
const { contentType } = require('express/lib/response');
require('dotenv').config()
const port = 5000
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('doctors'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7oely.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



client.connect(err => {
    const appointmentsCollections = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");

    app.post('/addAppointments', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentsCollections.insertOne(appointment)
            .then(result => {
                console.log(result);
                res.send(result.acknowledged)
            })
    })
    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body.selectedDate;
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                console.log(doctors);
                const filter = { date: date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentsCollections.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents)
                    })
            })
    })
    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const filePath = `${__dirname}/doctors/${file.name}`
        console.log(file);
        file.mv(filePath, err => {
            if (err) {
                console.log(error);
                return res.status(500).send({ mess: 'failed to upload image to Server' })
            }
            const newImage = fs.readFileSync(filePath);
            const encImage = newImage.toString('base64');
            var image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer(encImage, 'base64')
            }
            doctorCollection.insertOne({ name, email, phone, image })
                .then(result => {
                    fs.remove(filePath, err => {
                        if (err) { console.log(err);
                            res.status(500).send({ mess: 'failed to upload image to Server' })
                        }
                        res.send(result.acknowledged);
                    })

                })
            // return res.send({name:file.name,path:`/${file.name}`})
        })
    })


    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors)
            })
    })

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