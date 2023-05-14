const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')//JWT
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
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

// jwt-2
const verifyZwt = (req, res, next) => {
  console.log('hitting');
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  const token = authorization.split(' ')[1];
  console.log('token inside verify jwt', token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    // 1st connect with database get data from there.

    const servicesCollection = client.db('carDoctor').collection('services');
    const checkoutCollection = client.db('carDoctor').collection('bookings')

    // JWT 1
    app.post('/jwt', (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      console.log(token);
      res.send({ token })
    })

    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // 1st connect with database get data from there.end

    // Book service 
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const options = {

        // Include only the `title` and `price` fields in the returned document
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, options)
      res.send(result)
    })
    // Book service end

    // Bookings
    app.post('/checkouts', async (req, res) => {
      console.log(req.headers);

      const booking = req.body;
      console.log(booking);
      const result = await checkoutCollection.insertOne(booking)
      res.send(result)
    })

    // delete Booking 

    app.delete('/checkouts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await checkoutCollection.deleteOne(query)
      res.send(result)
    })

    // update booking
    app.patch('/checkouts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updated = req.body;
      console.log(updated);
      const updateDoc = {
        $set: {
          status: updated.status
        }
      };
      const result = await checkoutCollection.updateOne(query, updateDoc);
      res.send(result)

    })

    // read data from db
    app.get('/checkouts',verifyZwt, async (req, res)=> {
      // jwt -3
      const decoded=req.decoded;
      console.log('came bake after verify: ',decoded);
      if(decoded.email !== req.query.email){
        return(res.status(403).send({error:1, message:'forbidden access'}))
      }
      // jwt -3 end
      // console.log(req.headers.authorization);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await checkoutCollection.find(query).toArray();
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Mongo DB default code..end


app.get('/', (req, res) => {
  res.send('CAR DOCTOR SERVER IS RUNNING...')
})
app.listen(port, () => {
  console.log(`CAR DOCTOR SERVER  RUNNING ON PORT:${port}`);
})

module.exports = app;