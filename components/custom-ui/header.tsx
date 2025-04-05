"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRegisteredUser } from "../providers/user-provider";
import { usePathname } from "next/navigation";
import { cn, truncateAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { AnimatedButton } from "./animated-button";
import { useFundWallet, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { Copy, Loader2, Check, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const { logout, user } = usePrivy();
  const { dbUser } = useRegisteredUser();
  const pathname = usePathname();
  const [isCopying, setIsCopying] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { fundWallet } = useFundWallet();

  const handleCopy = (address: string) => {
    setIsCopying(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => {
      setIsCopying(false);
      setShowCheck(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setShowCheck(false), 1500);
    }, 500);
  };

  const handleFundWallet = () => {
    if (user?.wallet?.address) {
      fundWallet(user.wallet.address);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout();
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 3000);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 flex flex-col w-full px-2 bg-gradient-to-r from-primary/5 to-background text-black border-b-[1px] border-[#323232] z-50 gap-1"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex justify-between items-center px-5 py-3">
        <div className="flex justify-start items-center gap-12">
          <Link href="/simple">
            <h1 className="text-4xl font-bold text-secondary">
              Tax<span className="text-primary">Mate</span>
            </h1>
          </Link>
          <div className="flex items-center gap-5 mt-[5px]">
            <Link href="/simple">
              <motion.h1
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-xl font-bold text-secondary hover:text-primary",
                  pathname === "/simple" && "text-primary"
                )}
              >
                Simple Earn
              </motion.h1>
            </Link>
            <Link href="/vault">
              <motion.h1
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "text-xl font-bold text-secondary hover:text-primary",
                  pathname === "/vault" && "text-primary"
                )}
              >
                Advanced Vault
              </motion.h1>
            </Link>
            {/* Fund Wallet Button with Glowing Effect */}
            <motion.div
              className="relative group ml-5 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={handleFundWallet}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-60 group-hover:opacity-90 transition duration-500 cursor-pointer"></div>
              <button className="relative flex items-center gap-2 px-2 py-0 bg-transparent rounded-lg text-secondary/80 font-bold cursor-pointer text-xl">
                <Wallet size={20} />
                Fund Wallet
              </button>
            </motion.div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-4">
          {/* TODO: Add wallet balance */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <img
                src={
                  dbUser?.pfp ||
                  "https://imgs.search.brave.com/cJOZft-Yy2ofV4ZUdOr2EbwB2Gb-kCf3ULkPIBq85O8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzkzLzYx/LzM2MF9GXzM0Njkz/NjExNF9SYXhFNk9R/b2dlYmdBV1RhbEUx/bXlzZVkxSGJiNXFQ/TS5qcGc"
                }
                alt="pfp"
                width={48}
                height={48}
                className="rounded-full object-cover w-[48px] h-[48px] cursor-pointer border-[1px] border-secondary"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-6 mt-1 w-[160px]">
              <DropdownMenuLabel>Your Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex flex-col gap-0.5 w-full text-start pt-1">
                <label className="text-sm text-secondary">Logged in as:</label>
                <button
                  className="flex justify-start items-center gap-1 cursor-pointer"
                  onClick={() => handleCopy(dbUser?.walletAddress ?? "")}
                >
                  <p className="text-sm text-primary underline">
                    {truncateAddress(dbUser?.walletAddress ?? "", 7)}
                  </p>
                  {isCopying ? (
                    <Loader2 className="animate-spin" />
                  ) : showCheck ? (
                    <Check className="text-green-500" />
                  ) : (
                    <Copy />
                  )}
                </button>
              </DropdownMenuLabel>
              <div className="flex justify-center items-center mt-2 mb-3">
                <AnimatedButton
                  className="bg-destructive h-[30px] w-[100px] text-sm"
                  onClick={handleLogout}
                  isLoading={isLoggingOut}
                  loaderSize={18}
                >
                  LOGOUT
                </AnimatedButton>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
