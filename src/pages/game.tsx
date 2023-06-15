import { type NextPage } from "next";
import Head from "next/head";
import Questioneer from "~/routes/Questioneer/Questioneer";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>חידון חכמים</title>
        <meta property="og:image" content="/images/public.jpg" />
        <meta name="description" content="חידון חכמים" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Questioneer />
      </main>
    </>
  );
};

export default Home;
