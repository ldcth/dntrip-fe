import { authSelector } from "@/redux/reducers";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { user } = useSelector(authSelector);

  useEffect(() => {
    if (user?.role !== 2) {
      router.push("/");
    }
  }, [user]);

  if (user?.role === 2) {
    return <>{children}</>;
  }
};

export default AuthGuard;
