import { useState } from "react";
import TutorialBuilder from "./TutorialBuilder.jsx";
import ManageTutorials from "./ManageTutorials.jsx";

export default function AdminApp() {
  const [tab, setTab] = useState("create");
  const [editingTutorial, setEditingTutorial] = useState(null);

  function startCreate() {
    setEditingTutorial(null);
    setTab("create");
  }

  function startEdit(tutorial) {
    setEditingTutorial(tutorial);
    setTab("create");
  }

  function finishEdit() {
    setEditingTutorial(null);
    setTab("manage");
  }

  return (
    <div className="admin-page">
      <nav className="admin-tabs">
        <button className={tab === "create" ? "active" : ""} onClick={startCreate}>Create tutorial</button>
        <button className={tab === "manage" ? "active" : ""} onClick={() => setTab("manage")}>Manage tutorials</button>
      </nav>
      {tab === "create" ? (
        <TutorialBuilder
          editTutorial={editingTutorial}
          onCancelEdit={editingTutorial ? finishEdit : undefined}
          onSaved={editingTutorial ? finishEdit : undefined}
        />
      ) : (
        <ManageTutorials onEdit={startEdit} />
      )}
    </div>
  );
}
