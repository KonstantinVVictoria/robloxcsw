import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";

export default function Home() {
  const [dataStats, setDataStates] = useState([]);
  const [commits, setCommits] = useState([]);
  const DataStatsComponents = dataStats.map((data, i) => (
    <DataPiece key={i + "data"} {...data} />
  ));
  const CommitComponents = commits.map((commit, i) => {
    {
      return <Commit key={i + "commit"} {...commit} />;
    }
  });

  // fetch(
  //   "https://api.notion.com/v1/databases/4a7b06d9f6fe450686e29f9d9fe504ee",
  //   {
  //     headers: {
  //       Authorization:
  //         "Bearer secret_CCsBUPbQzTK353NnSctN90pcr6mNXwCd4rGt8bKiGBg",
  //       "Content-Type": "application/json",
  //       "Notion-Version": "2022-02-22",
  //     },
  //     data: {
  //       title: [
  //         {
  //           text: {
  //             content: "Today'''s grocery list",
  //           },
  //         },
  //       ],
  //       properties: { created_time: "June 2, 2022 5:41 PM" },
  //     },
  //   }
  // );
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {commits.length ? <CommitPanel>{CommitComponents}</CommitPanel> : null}
        {dataStats.length ? (
          <>
            <h1>Data Stats</h1>
            <div style={{ border: "1px solid black", padding: "1rem" }}>
              {DataStatsComponents}
            </div>
          </>
        ) : null}
        <div>
          <p>API Key</p>
          <input id="apikey" />
        </div>
        <div id="DataStores" style={{ display: "flex" }}></div>
        <button
          onClick={async () => {
            const key = document.getElementById("apikey").value;
            const { data } = await fetch("api/RobloxStore/getDataStats", {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: key,
              }),
              method: "POST",
            }).then((resp) => resp.json());
            setCommits([]);
            setDataStates(data ? data : []);
          }}
        >
          Get Data Stats
        </button>
        <button
          onClick={async () => {
            const key = document.getElementById("apikey").value;
            await fetch("api/Notion/SendTasks", {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: key,
              }),
              method: "POST",
            });
          }}
        >
          SendTasks
        </button>
        <button
          onClick={async () => {
            const key = document.getElementById("apikey").value;
            const { data } = await fetch("api/RobloxGit/getCommits", {
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                key: key,
              }),
              method: "POST",
            }).then((resp) => resp.json());
            setDataStates([]);
            setCommits(data ? data : []);
          }}
        >
          Get Commits
        </button>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
const DataPiece = ({ itemName, stat }) => {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <p>
        <b>Item: </b> {itemName}
      </p>
      <p>
        <b>Quantity: </b> {stat}
      </p>
    </div>
  );
};

const CommitPanel = ({ children }) => {
  return (
    <>
      <h1>Commit History</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {children}
      </div>
    </>
  );
};

const Commit = ({ game, note, user, timeStamp }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid black",
        padding: "1rem",
        borderRadius: "15px",
      }}
    >
      <h2 style={{ margin: "0.8rem" }}>
        <b>User: </b>
        {user.name}
      </h2>
      <img src={user.userPicture} />
      <p style={{ margin: "0.8rem" }}>
        <b>Game: </b>
        {game.name}
      </p>
      <p style={{ margin: "0.8rem" }}>
        <b>Time: </b>
        {timeStamp}
      </p>
      <h2 style={{ margin: "0.2rem" }}>Note</h2>
      <p style={{ maxWidth: "10rem", fontSize: "0.7rem" }}>{note}</p>
    </div>
  );
};
