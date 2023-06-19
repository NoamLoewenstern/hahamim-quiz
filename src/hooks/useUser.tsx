import { useSession } from "next-auth/react";

export default function useUser() {
  const { data: session, status } = useSession();
  const isLoadingUser = status === "loading";
  if (!session) return { user: null, isAdmin: false, isLoadingUser };
  const user = session.user;
  const isAdmin = user.role === "ADMIN";
  return { user, isAdmin, isLoadingUser };
}
