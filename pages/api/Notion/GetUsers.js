//secret_CCsBUPbQzTK353NnSctN90pcr6mNXwCd4rGt8bKiGBg "4a7b06d9f6fe450686e29f9d9fe504ee"
import Notion from "../../../lib/notion/notion";
import client from "../../../lib/discord/bot";
import DiscordUser from "../../../lib/discord_users.json";
export default async function handler(req, res) {
  let { key } = req.body;
  if (key === undefined) return res.status(400).json({ error: "Bad request" });
  let query = await Notion.users.list();
  console.log(query);
  res.status(200).json({ successful: true });
}
