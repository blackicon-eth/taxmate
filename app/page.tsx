"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { login, logout, ready } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full gap-4">
      <button
        onClick={login}
        className="bg-blue-500 text-black py-2 px-4 rounded-md cursor-pointer"
      >
        Login
      </button>
      <button
        onClick={logout}
        className="bg-red-500 text-white py-2 px-4 rounded-md cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}
