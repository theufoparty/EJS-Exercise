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
	const dateAdded = new Date();
	await membersCollection.insertOne({ ...req.body, date: dateAdded });
	res.redirect("/members");
});

app.get("/members", async (req, res) => {
	const sort = req.query.sort;
	let result = membersCollection.find();
	if (sort === "ascending") {
		result = result.sort({ name: 1 });
	} else if (sort === "decending") {
		result = result.sort({ name: -1 });
	}
	const members = await result.toArray();
	res.render("members", { members });
});

app.get("/member/:id", async (req, res) => {
	const temp = new ObjectId(req.params.id);
	const member = await membersCollection.findOne({ _id: temp });

	const dateString = member.date.toLocaleDateString("sv-SE");

	res.render("member", {
		name: member.name,
		email: member.email,
		phoneNumber: member.phoneNumber,
		date: dateString,
		dogName: member.dogName,
		id: member._id,
	});
});

app.get("/member/edit/:id", async (req, res) => {
	console.log("HEJ");
	const temp = new ObjectId(req.params.id);
	const member = await membersCollection.findOne({ _id: temp });
	res.render("edit", {
		name: member.name,
		email: member.email,
		phoneNumber: member.phoneNumber,
		date: member.date,
		dogName: member.dogName,
		id: member._id,
	});
});

app.get("/member/delete/:id", async (req, res) => {
	const temp = new ObjectId(req.params.id);
	await membersCollection.deleteOne({
		_id: temp,
	});
	res.redirect("/members");
});

app.post("/member/edit/:id", async (req, res) => {
	const temp = new ObjectId(req.params.id);
	await membersCollection.updateOne({ _id: temp }, { $set: req.body });
	res.redirect("/members");
});

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
