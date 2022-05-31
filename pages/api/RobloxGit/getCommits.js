import NextCors from "nextjs-cors";
import { connectToDatabase } from "../../../lib/mongodb/mongodb";
let dbCache = null;
export default async function handler(req, res) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  try {
    console.log(req.body);
    let { key } = req.body;
    if (key === undefined)
      return res.status(400).json({ error: "Bad request" });
    let { db } = await connectToDatabase();
    let collection = await getCollection(db, "apikeys");
    let keyExists = await checkKey(collection, key);
    if (!keyExists) {
      return res.status(403).json({ error: "Unauthorized request" });
    } else {
      collection = await getCollection(db, "commits");
      let queryResults = await collection.find({}).toArray();
      if (queryResults.length !== 0) {
        return res
          .status(200)
          .json({ status: 200, message: "Successful", data: queryResults });
      } else {
        return res
          .status(200)
          .json({ status: 200, message: "Successful. No data" });
      }
    }
  } catch (error) {
    console.log("error");
    return res.status(500).json({ status: 500, message: "error" });
  }
}
async function getCollection(db, collectionName) {
  try {
    dbCache = db;
    let collection = await db.collection(collectionName);
    return collection;
  } catch (error) {
    return nil;
  }
}
async function checkKey(collection, key) {
  try {
    let queryResults = await collection.find({ key: key }).limit(1).toArray();
    let keyExists =
      queryResults.length !== 0 && queryResults[0].key !== undefined;
    return keyExists;
  } catch (error) {
    return nil;
  }
}
function parseData({ itemName, delta }) {
  return { itemName, delta };
}
