const express = require("express");
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

// Middleware ---------
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojkvx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    const database = client.db("ema_jhon");
    const productCollection = database.collection("products");

    // Get Produdcts Api 
    try {
        app.get('/products', async (req, res) => {
            await client.connect();
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productCollection.find({});

            const count = await cursor.count();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send({
                products,
                count
            });
        })
    }
    finally {
        await client.close();
    }

    // User post to get data by keys 
    try {
        app.post('/products/bykeys', async (req, res) => {
            await client.connect();
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();

            res.json(products);

        })
    }
    finally {
        await client.close();
    }

}
run().catch(console.dir)




// Default ---------------------------------
app.get('/', (req, res) => {
    res.send('ema jhon server is running...')
})

app.listen(port, () => {
    console.log('listening to port ', port)
})