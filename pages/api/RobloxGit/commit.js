import { connectToDatabase } from "../../../lib/mongodb/mongodb";
import client from "../../../lib/discord/bot";
import NextCors from "nextjs-cors";
import Users from "../../../lib/users";
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

  try {
    let { key, data } = req.body;
    if (key === undefined)
      return res.status(400).json({ error: "Bad request" });
    let { db } = await connectToDatabase();
    let collection = await getCollection(db, "apikeys");
    let keyExists = await checkKey(collection, key);

    if (!keyExists)
      return res.status(403).json({ error: "Unauthorized request" });

    const { message, commit } = parseData(data);
    const bot = await client;
    const channel = await bot.channels.fetch("980161368923713536");
    await channel.send(message);
    await db.collection("commits").insertOne(commit);
    let queryLength = await db.collection("commits").count({});
    notion.pages.create(notionCommit(queryLength + 1, commit));
    return res.json({ status: 200, message: "Successful" });
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
    time: new Date().getTime(),
    note: note,
    game: {
      name: gameName,
      id: gameId,
    },
  };
  return { message: message, commit: commit };
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
  if (user.userPicture) {
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
