import { Authenticated, GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import routerBindings, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import authProvider from "./authProvider";
import { supabaseClient } from "./utility";
import Account from "./components/account";
import Auth from "./components/auth";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          routerProvider={routerBindings}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
          <Route
            element={
              <Authenticated
                  fallback={<CatchAllNavigate to="/login" />}
              >
                  <Outlet />
              </Authenticated>
            }
          >
            <Route index element={<Account />} />
          </Route>
          <Route
            element={
              <Authenticated
                fallback={<Outlet />}
              />
            }
          >
            <Route path="/login" element={<Auth />} />
          </Route>
          </Routes>
          <RefineKbar />
          <UnsavedChangesNotifier />
        </Refine>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
