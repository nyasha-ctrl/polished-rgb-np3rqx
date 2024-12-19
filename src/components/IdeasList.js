import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const fetchIdeas = async (userId) => {
  const ideasRef = ref(db, `users/${userId}/ideas`);
  const snapshot = await get(ideasRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }
  return [];
};

function IdeasList() {
  const { user } = useAuth();
  const {
    data: ideas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ideas", user.uid],
    queryFn: () => fetchIdeas(user.uid),
  });

  const [sortBy, setSortBy] = useState("createdAt");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === "importance") {
      return b.importance - a.importance;
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="ideas-list">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Ideas</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="createdAt">Date Created</option>
          <option value="importance">Importance</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedIdeas.map((idea) => (
          <div
            key={idea.id}
            className="border rounded-lg p-4"
            style={{ backgroundColor: idea.color }}
          >
            <h2 className="text-xl font-semibold mb-2">{idea.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
            <p className="text-xs text-gray-500">Status: {idea.status}</p>
            <p className="text-xs text-gray-500">
              Importance: {idea.importance}
            </p>
            <p className="text-xs text-gray-500">
              Created: {new Date(idea.createdAt).toLocaleDateString()}
            </p>
            <Link
              to={`/idea/${idea.id}`}
              className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IdeasList;
