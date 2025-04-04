"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { FullPageLoader } from "../custom-ui/fullpage-loader";
import { DbUser } from "@/lib/db/schemas/db.schema";
import ky from "ky";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { FullPageError } from "../custom-ui/fullpage-error";

const UserProviderContext = createContext<
  | {
      dbUser: DbUser | undefined;
      refetchUser: () => void;
    }
  | undefined
>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const useRegisteredUser = () => {
  const context = useContext(UserProviderContext);
  if (!context) {
    throw new Error("useRegisteredUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const { ready, authenticated } = usePrivy();
  const [isPrivyReady, setIsPrivyReady] = useState(false);

  // Loading effect but it also gives time to fetch the user from the database
  useEffect(() => {
    if (ready) {
      setTimeout(() => {
        setIsPrivyReady(true);
      }, 1000);
    }
  }, [ready]);

  const {
    data: dbUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => ky.get<DbUser>("/api/user/sign-in").json(),
    retry: false,
    enabled: !!ready && !!authenticated,
  });

  // Error state
  //if (userError) return <FullPageError errorMessage={userError.message} />;

  // Loading state
  if (!isPrivyReady) return <FullPageLoader />;

  return (
    <UserProviderContext.Provider
      value={{
        dbUser,
        refetchUser,
      }}
    >
      {children}
    </UserProviderContext.Provider>
  );
};
