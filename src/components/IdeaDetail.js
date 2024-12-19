import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ref, get, set } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const fetchIdea = async (userId, id) => {
  const ideaRef = ref(db, `users/${userId}/ideas/${id}`);
  const snapshot = await get(ideaRef);
  if (snapshot.exists()) {
    return { id, ...snapshot.val() };
  }
  throw new Error("Idea not found");
};

const saveIdea = async ({ userId, idea }) => {
  const ideaRef = ref(db, `users/${userId}/ideas/${idea.id}`);
  await set(ideaRef, idea);
  return idea;
};

function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [importance, setImportance] = useState(1);
  const [status, setStatus] = useState("New");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#FFFFFF");

  const {
    data: idea,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["idea", user.uid, id],
    queryFn: () => fetchIdea(user.uid, id),
    enabled: !!id,
    onSuccess: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setImportance(data.importance || 1);
      setStatus(data.status || "New");
      setNotes(data.notes || "");
      setColor(data.color || "#FFFFFF");
    },
  });

  const mutation = useMutation({
    mutationFn: saveIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideas", user.uid] });
      navigate("/");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const ideaData = {
      id: id || Date.now().toString(),
      title,
      description,
      importance,
      status,
      notes,
      color,
      createdAt: idea?.createdAt || new Date().toISOString(),
    };
    mutation.mutate({ userId: user.uid, idea: ideaData });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        {id ? "Edit Idea" : "New Idea"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title:
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="importance"
            className="block text-sm font-medium text-gray-700"
          >
            Importance:
          </label>
          <select
            id="importance"
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status:
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Notes:
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700"
          >
            Card Color:
          </label>
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default IdeaDetail;
