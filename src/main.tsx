import React from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import { Provider as JotaiProvider } from "jotai";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Layout from "./routes/Layout/Layout";
import Questioneer from "./routes/Questioneer/Questioneer";
import About from "./routes/About/About";
import Admin from "./routes/Admin/Admin";
import Records from "./routes/Records/Records";
import AddQuestion from "./routes/AddQuestion/AddQuestion";
import { MantineProvider } from "@mantine/core";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Questioneer />,
      },
      {
        path: "/records",
        element: <Records />,
      },
      {
        path: "/add-question",
        element: <AddQuestion />,
      },
      {
        path: "/",
        element: <Questioneer />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <JotaiProvider>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </JotaiProvider>
  </React.StrictMode>
);
