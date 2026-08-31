import { useState } from "react";
import TutorialBuilder from "./TutorialBuilder.jsx";
import ManageTutorials from "./ManageTutorials.jsx";

export default function AdminApp() {
  const [tab, setTab] = useState("create"); // "create" | "manage"

  return (
    <div className="admin-page">
      <nav className="admin-tabs">
        <button className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>
          Create tutorial
        </button>
        <button className={tab === "manage" ? "active" : ""} onClick={() => setTab("manage")}>
          Manage tutorials
        </button>
      </nav>

      {tab === "create" ? <TutorialBuilder /> : <ManageTutorials />}
    </div>
  );
}
