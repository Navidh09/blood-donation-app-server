const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
var morgan = require("morgan");
const { ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7n3bd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("vital-drops").collection("users");
    const donationRequestsCollection = client
      .db("vital-drops")
      .collection("donationRequests");

    // users related apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const { district, upazila, bloodGroup } = req.query;

      const query = {
        role: "Donor",
      };

      if (district) query.district = district;
      if (upazila) query.upazila = upazila;
      if (bloodGroup) query.bloodGroup = bloodGroup;

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // donation-requests related apis
    app.post("/donation-requests", async (req, res) => {
      const request = req.body;
      request.status = request.status || "pending";
      const result = await donationRequestsCollection.insertOne(request);
      res.send(result);
    });

    app.get("/donation-requests", async (req, res) => {
      const { status } = req.query;

      const query = {};
      if (status) query.status = status;

      const result = await donationRequestsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestsCollection.findOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    app.get("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const result = await donationRequestsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.patch("/donation-requests/:id", async (req, res) => {
      const id = req.params.id;
      const { status, donorName, donorEmail } = req.body;

      const updateDoc = {
        $set: {
          status,
          donorName,
          donorEmail,
        },
      };

      const result = await donationRequestsCollection.updateOne(
        { _id: new ObjectId(id) },
        updateDoc
      );

      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running successfully");
});

app.listen(port, () => {
  console.log(`Blog Website is running at: ${port}`);
});
