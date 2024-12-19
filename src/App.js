import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import IdeasList from "./components/IdeasList";
import IdeaDetail from "./components/IdeaDetail";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <nav className="bg-blue-600 p-4 text-white">
            <ul className="flex justify-between items-center">
              <li>
                <Link to="/" className="text-xl font-bold">
                  IdeaTracker
                </Link>
              </li>
              <div className="flex space-x-4">
                {user ? (
                  <>
                    <li>
                      <Link to="/new" className="hover:text-blue-200">
                        New Idea
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="hover:text-blue-200"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className="hover:text-blue-200">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link to="/signup" className="hover:text-blue-200">
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </div>
            </ul>
          </nav>

          <main className="container mx-auto mt-4 p-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <IdeasList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/idea/:id"
                element={
                  <PrivateRoute>
                    <IdeaDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/new"
                element={
                  <PrivateRoute>
                    <IdeaDetail />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWithAuth;
