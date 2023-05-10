const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app=express();
require('dotenv').config()
const port =process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());


// Mongo DB default code..
const uri = `mongodb+srv://${process.env.S3_BUCKET}:${process.env.SECRET_KEY}@cluster0.f75tpn0.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// Mongo DB default code..end


app.get('/',(req,res)=>{
    res.send('CAR DOCTOR SERVER IS RUNNING...')
})
app.listen(port, ()=>{
    console.log(`CAR DOCTOR SERVER  RUNNING ON PORT:${port}`);
})