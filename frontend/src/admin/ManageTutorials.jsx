import { useEffect, useState } from "react";
import { fetchAllTutorials, deleteTutorial } from "../api/admin.js";

export default function ManageTutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDeleteSlug, setPendingDeleteSlug] = useState(null);
  const [deletingSlug, setDeletingSlug] = useState(null);

  function load() {
    setLoading(true);
    fetchAllTutorials()
      .then(setTutorials)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirmDelete(tutorial) {
    setDeletingSlug(tutorial.slug);
    try {
      await deleteTutorial(tutorial.productSlug, tutorial.slug);
      setTutorials((prev) => prev.filter((t) => t.id !== tutorial.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingSlug(null);
      setPendingDeleteSlug(null);
    }
  }

  const byProduct = tutorials.reduce((acc, t) => {
    (acc[t.productName] ||= []).push(t);
    return acc;
  }, {});

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>Manage tutorials</h1>
        <p>Everything published so far. Deleting a tutorial removes it for customers immediately.</p>
      </header>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p className="admin-hint">Loading…</p>}

      {!loading && tutorials.length === 0 && !error && (
        <div className="admin-card">
          <p className="admin-hint">No tutorials published yet.</p>
        </div>
      )}

      {Object.entries(byProduct).map(([productName, group]) => (
        <div key={productName} className="admin-card">
          <h3>{productName}</h3>
          <ul className="tutorial-list">
            {group.map((t) => (
              <li key={t.id} className="tutorial-row">
                <span>{t.title}</span>

                {pendingDeleteSlug === t.slug ? (
                  <span className="confirm-row">
                    <span className="confirm-text">Delete this tutorial?</span>
                    <button
                      className="btn-danger"
                      onClick={() => confirmDelete(t)}
                      disabled={deletingSlug === t.slug}
                    >
                      {deletingSlug === t.slug ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button className="btn-ghost-outline" onClick={() => setPendingDeleteSlug(null)}>
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button className="btn-danger-outline" onClick={() => setPendingDeleteSlug(t.slug)}>
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
