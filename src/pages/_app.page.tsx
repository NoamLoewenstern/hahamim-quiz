import "@total-typescript/ts-reset";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import "~/styles/App.scss";
import "~/styles/Layout.scss";
import "~/styles/Loader.scss";
import "~/styles/Mobile.scss";
import "~/styles/AddQuestion.scss";
import "~/styles/Navbar.scss";
import "~/styles/Questioneer.scss";
import Layout from "~/Componenets/Layout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
