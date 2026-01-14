import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ apiBase, children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | unauthed
  const location = useLocation();

  useEffect(() => {
    setStatus("loading");
    const abortController = new AbortController();
    
    (async () => {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          credentials: "include",
          signal: abortController.signal
        });

        setStatus(res.ok ? "authed" : "unauthed");
      } catch (err) {
        if (err.name !== 'AbortError') {
          setStatus("unauthed");
        }
      }
    })();

    return () => abortController.abort();
  }, [apiBase, location]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthed") return <Navigate to="/login" replace />;

  // Explicitly return children only when authed
  if (status === "authed") return children;
}
