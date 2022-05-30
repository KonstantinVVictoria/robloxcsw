import { connectToDatabase } from "../../../lib/mongodb/mongodb";
import client from "../../../lib/discord/bot";
import NextCors from "nextjs-cors";
let dbCache = null;
export default async function handler(req, res) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  try {
    let { key, data } = req.body;
    if (key === undefined) res.status(400).json({ error: "Bad request" });
    let { db } = await connectToDatabase();
    let collection = await getCollection(db, "apikeys");
    let keyExists = await checkKey(collection, key);

    if (!keyExists) res.status(403).json({ error: "Unauthorized request" });
    console.log(data);
    const { message, commit } = parseData(data);
    const bot = await client;
    const channel = await bot.channels.fetch("980161368923713536");
    await channel.send(message);
    await db.collection("commits").insertOne(commit);
    return res.status(200).json({ status: 200, message: "Successful" });
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
}

async function getCollection(db, collectionName) {
  dbCache = db;
  return db.collection(collectionName);
}
async function checkKey(collection, key) {
  let queryResults = await collection.find({ key: key }).limit(1).toArray();
  let keyExists =
    queryResults.length !== 0 && queryResults[0].key !== undefined;
  return keyExists;
}

function parseData({
  gameName,
  gameId,
  user,
  userId,
  userPicture,
  currentTime,
  note,
}) {
  const message = `**New commit to ${gameName} by: **\n${user}\n${userPicture}\nDone at ${currentTime}\n**Notes**:\n${note}`;
  const commit = {
    user: {
      name: user,
      userPicture: userPicture,
      id: userId,
    },
    timeStamp: currentTime,
    note: note,
    game: {
      name: gameName,
      id: gameId,
    },
  };
  return { message: message, commit: commit };
}
