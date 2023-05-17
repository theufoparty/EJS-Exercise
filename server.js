import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("brukshundsklubben");
const membersCollection = db.collection("members");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("static"));
app.use(express.urlencoded());

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/members/create", (req, res) => {
	res.render("create");
});

app.post("/members/create", async (req, res) => {
	await membersCollection.insertOne(req.body);
	res.redirect("/members");
});

app.get("/members", async (req, res) => {
	const members = await membersCollection.find().toArray();
	res.render("members", { members });
});

app.get("/member/:id", async (req, res) => {
	const temp = new ObjectId(req.params.id);
	const member = await membersCollection.findOne({ _id: temp });
	res.render("member", {
		name: member.name,
		email: member.email,
		phoneNumber: member.phoneNumber,
		date: member.date,
		dogName: member.dogName,
	});
});

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
