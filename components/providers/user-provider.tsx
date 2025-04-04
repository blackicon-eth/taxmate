"use client";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { FullPageLoader } from "../custom-ui/fullpage-loader";
import { DbUser, Transaction } from "@/lib/db/schemas/db.schema";
import ky from "ky";
import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { FullPageError } from "../custom-ui/fullpage-error";
import { Address } from "viem";

const UserProviderContext = createContext<
  | {
      dbUser: DbUser | undefined;
      refetchUser: () => void;
      userTransactions: {
        aave: Transaction[] | undefined;
        vault: Transaction[] | undefined;
        all: Transaction[] | undefined;
      };
      refetchTransactions: () => void;
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
  const { ready, authenticated, user } = usePrivy();
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

  const {
    data: transactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await ky.get<Transaction[]>("/api/transactions").json();
      const sortedTransactions = [...response].sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      return sortedTransactions;
    },
    enabled: !!ready && !!authenticated,
  });

  const userAAVETransactions = useMemo(
    () => transactions?.filter((transaction) => transaction.protocol === "AAVE"),
    [transactions]
  );

  const userVaultTransactions = useMemo(
    () => transactions?.filter((transaction) => transaction.protocol === "VAULT"),
    [transactions]
  );

  // Error state
  if (userError || transactionsError)
    return <FullPageError errorMessage={userError?.message || transactionsError?.message} />;

  // Loading state
  if (!isPrivyReady) return <FullPageLoader />;

  return (
    <UserProviderContext.Provider
      value={{
        dbUser,
        userTransactions: {
          aave: userAAVETransactions,
          vault: userVaultTransactions,
          all: transactions,
        },
        refetchUser,
        refetchTransactions,
      }}
    >
      {children}
    </UserProviderContext.Provider>
  );
};
