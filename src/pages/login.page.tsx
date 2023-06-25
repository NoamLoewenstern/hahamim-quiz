import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { type Session } from "next-auth";

export const getServerSideProps: GetServerSideProps<{ adminUser: Session["user"] }> = async ({
  req,
  res,
}) => {
  const session = await getServerAuthSession({ req, res });

  if (session?.user) {
    const isAdmin = session.user.role === "ADMIN";
    return {
      redirect: {
        destination: isAdmin ? "/admin" : "/",
        permanent: false,
      },
      props: {},
    };
  }
  return {
    redirect: {
      destination: "api/auth/signin",
      permanent: false,
    },
    props: {},
  };
};
export default function Login() {
  // redirect to /api/auth/signin by getServerSideProps
}
