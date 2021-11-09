const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8ub5n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("travel_planner_eu");
    const serviceCollection = database.collection("allServices");
    const bookingCollection = database.collection("bookings");

    // GET API
    app.get("/allServices", async (req, res) => {
      const cursor = serviceCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // POST API
    app.post("/addServices", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    // SINGLE SERVICE
    app.get("/singleService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.json(service);
    });

    // CONFIRM BOOKING
    app.post("/confirmedBooking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log(result);
      res.json(result);
    });

    // MY BOOKINGS
    app.get("/myBookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Travel Planner server is running.");
});

app.listen(port, () => {
  console.log("Travel Planner server is running on port: ", port);
});
