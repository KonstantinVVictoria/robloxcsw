//secret_CCsBUPbQzTK353NnSctN90pcr6mNXwCd4rGt8bKiGBg "4a7b06d9f6fe450686e29f9d9fe504ee"
import Notion from "../../../lib/notion/notion";
import client from "../../../lib/discord/bot";
import DiscordUser from "../../../lib/discord_users.json";
export default async function handler(req, res) {
  let { key } = req.body;
  if (key === undefined) return res.status(400).json({ error: "Bad request" });
  let query = await Notion.databases.query({
    database_id: "e2f4bfd735104292b1298ea27b3f938e",
    filter: {
      property: "Informed",
      checkbox: {
        equals: false,
      },
    },
  });
  // const response = await notion.pages.update({
  //   page_id: pageId,
  //   properties: {
  //     "In stock": {
  //       checkbox: true,
  //     },
  //   },
  // });
  let Tasks = query?.results;
  if (Tasks.length) {
    const bot = await client;
    Tasks.forEach(async ({ properties, id }) => {
      await Notion.pages.update({
        page_id: id,
        properties: {
          Informed: {
            checkbox: true,
          },
        },
      });
      let mailing_list = [];
      let task_name = properties.Name.title[0].plain_text;
      let due_date = new Date(properties.Deadline.date.start);
      let month = due_date.toLocaleString("default", { month: "long" });
      let day = due_date.getDate();
      let year = due_date.getFullYear();
      due_date = `${month} ${day}, ${year}`;
      let Task = properties.Notes.rich_text[0].plain_text;
      let TeamLeads = "";
      for (let i = 0; i < properties.Lead.people.length; i++) {
        let member_name = properties.Lead.people[i].name;
        let member_id = properties.Lead.people[i].id;
        let Discord_id = DiscordUser[member_id];
        TeamLeads += member_name + " ";
        if (Discord_id) mailing_list[Discord_id] = {};
      }
      let Peers = "";
      for (let i = 0; i < properties.Team.people.length; i++) {
        let member_name = properties.Team.people[i].name;
        let member_id = properties.Team.people[i].id;
        let Discord_id = DiscordUser[member_id];
        Peers += member_name + " ";

        if (Discord_id) mailing_list[Discord_id] = {};
      }
      let message = `**New Task: ${
        task_name ? task_name : ""
      }**\nYour team leads are: **${
        TeamLeads ? TeamLeads : ""
      }**\nYou will be working with: ***${
        Peers ? Peers : ""
      }***\nDue around **${due_date ? due_date : ""}**\n**Task**\n> ${Task}`;
      await new Promise((resolve, reject) =>
        Object.keys(mailing_list).forEach((DiscordUser) => {
          bot.users.fetch(DiscordUser).then((user) => {
            user.send(message);
            resolve();
          });
        })
      );
    });
  }
  res.status(200).json({ successful: true });
}
