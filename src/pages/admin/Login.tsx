import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "~/firebase/config";
import { LoadingSpinnerModal, useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import useUser from "~/hooks/useUser";
import { useState } from "react";
import Navigate from "~/Componenets/Navigate";

export function Login() {
  const { user, isAdmin, isLoadingUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<Error | null>(null);
  const { open, close } = useGlobalLoadingSpinner();

  const handleLogin = async (e) => {
    e.preventDefault();
    open();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      setError(null);
    } catch (error) {
      setError(error as Error);
    } finally {
      close();
    }
  };
  if (isLoadingUser) return <LoadingSpinnerModal />;
  if (user && isAdmin) {
    return <Navigate to="/admin" />;
  }
  return (
    <form
      className="mt-8 flex h-screen flex-col items-center justify-start p-4"
      onSubmit={handleLogin}
    >
      <div className="flex w-1/2 flex-col">
        <h1 className="self-center text-2xl font-bold">התחברות לאדמין</h1>
        <input
          className="text-box"
          type="text"
          value={email}
          placeholder="שם משתמש"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="text-box"
          type="password"
          value={password}
          placeholder="סיסמא"
          onChange={(e) => setPassword(e.target.value)}
        />
        <input type="submit" className="btn mt-4" value="התחבר" />

        {error && <p className="text-red-500">שגיאה בהתחברות. בדוק אימייל וסיסמה</p>}
      </div>
    </form>
  );
}
