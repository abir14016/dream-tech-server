const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//connect with mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boat8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("dream-tech").collection("products");

        //all products get API
        app.get("/product", async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });


        // Get random sample of 6 products
        app.get("/randomProduct", async (req, res) => {
            const pipeline = [
                { $sample: { size: 6 } } // Get a random sample of size 6
            ];

            const cursor = productCollection.aggregate(pipeline);
            const randomProducts = await cursor.toArray();
            res.send(randomProducts);
        });


        //category based products get API
        app.get("/productByCategory", async (req, res) => {
            const { category } = req.query
            const query = { category };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get a single product by ID
        app.get("/product/:id", async (req, res) => {
            const productId = req.params.id;
            console.log(productId);

            try {
                const query = { _id: new ObjectId(productId) };
                const product = await productCollection.findOne(query);
                //checking if the product with this id exist or not
                if (!product) {
                    return res.status(404).send("Product not found.");
                }

                res.send(product);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


//root rout
app.get('/', (req, res) => {
    res.send('Hello From dream tech!')
})
//root rout

app.listen(port, () => {
    console.log(`Dream tech server listening on port ${port}`)
})