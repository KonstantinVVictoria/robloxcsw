import NextCors from "nextjs-cors";
import { connectToDatabase } from "../../../lib/mongodb/mongodb";
import Users from "../../../lib/users.json";
let dbCache = null;
const { Client } = require("@notionhq/client");

const notion = new Client({
  auth: "secret_piNp5dWeI49VRMVdhTiiUmV3BLNzVdeaVgo07k3VkCV",
});

export default async function handler(req, res) {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  let commitObject;
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
        queryResults.forEach(async (entry, i) => {
          await notion.pages.create(notionCommit(i + 1, entry));
        });

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
    console.log(error);
    return res.status(500).json({ status: 500, message: commitObject });
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

function notionCommit(i, { user, timeStamp, note, game, time }) {
  let NotionUser = Users[`${user.id}`];
  let NotionDate = null;
  let NotionGameVersion = game.name;
  let NotionGameId = game.id;
  let NotionRobloxUser = user.name;
  let title = "Commit #" + i;
  if (time) {
    let date = new Date(time);
    let month = date.toLocaleString("default", { month: "long" });
    let day = date.getDate();
    let year = date.getFullYear();
    NotionDate = new Date(`${month} ${day}, ${year}`).toISOString();
  } else {
    let string = timeStamp;
    string = string.split(",")[1].split(" ");
    let month = string[1];
    let day = parseInt(string[2]);
    NotionDate = new Date(`${month} ${day}, 2022`).toISOString();
  }
  let icon = {};
  if (user.UserPicture) {
    icon = {
      type: "external",
      url: user.Picture,
    };
  } else {
    icon = {
      type: "emoji",
      emoji: "🤖",
    };
  }
  return {
    parent: {
      database_id: "0f8adddc7a4d4f21a751352546a94d3e",
    },
    icon: icon,
    properties: {
      Name: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      "Roblox Username": {
        select: {
          name: NotionRobloxUser,
        },
      },
      "Team Member": {
        people: NotionUser
          ? [
              {
                object: "user",
                id: NotionUser,
              },
            ]
          : [],
      },
      "Game Name": {
        rich_text: [
          {
            type: "text",
            text: {
              content: NotionGameVersion,
            },
          },
        ],
      },
      "Game Id": {
        number: NotionGameId,
      },
      Date: {
        date: {
          start: NotionDate,
        },
      },
    },
    children: [
      {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: note,
              },
            },
          ],
        },
      },
    ],
  };
}
function parseData({ itemName, delta }) {
  return { itemName, delta };
}

/*
"Roblox Username": {
        select: {
          name: NotionRobloxUser,
        },
      },
      "Team Member": {
        people: [
          {
            object: "user",
            id: "3e01cdb8-6131-4a85-8d83-67102c0fb98c",
          },
        ],
      },
      "Game Name": {
        rich_text: [
          {
            type: "text",
            text: {
              content: NotionGameVersion,
            },
          },
        ],
      },
      "Game Id": {
        number: NotionGameId,
      },
      Date: {
        date: {
          start: NotionDate,
        },
      },
      archived: false,
    
*/
