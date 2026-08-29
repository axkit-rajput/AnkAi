import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";

import getCurrentUser from "./features/getCurrentUser";
import { setAuthChecked, setUserdata } from "./redux/userSlice";

/* Split per route: the marketing page ships a large motion-driven scene and the
   dashboard ships the chat client. Neither should be downloaded to view the
   other. */
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

/* A bare tinted panel rather than a spinner: it matches the page background, so
   a fast chunk load reads as an instant paint instead of a flash. */
const RouteFallback = () => (
  <div className="ankai-app-shell w-full bg-[var(--ankai-bg)]" />
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        dispatch(setUserdata(data));
      } catch (error) {
        console.error("Failed to load current user:", error);
        /* Without this the whole app would sit behind the "checking session"
           state forever if the probe ever threw. */
        dispatch(setAuthChecked(true));
      }
    };

    loadUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>

          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<Login />} />

          <Route path="/app" element={<Dashboard />} />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
