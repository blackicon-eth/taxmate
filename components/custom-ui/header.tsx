"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRegisteredUser } from "../providers/user-provider";
import { usePathname } from "next/navigation";
import { cn, truncateAddress } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu";
import { AnimatedButton } from "./animated-button";
import { usePrivy } from "@privy-io/react-auth";
export const Header = () => {
  const { logout } = usePrivy();
  const { dbUser } = useRegisteredUser();
  const pathname = usePathname();

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
              <h1
                className={cn(
                  "text-xl font-bold text-secondary hover:text-primary",
                  pathname === "/simple" && "text-primary"
                )}
              >
                Simple
              </h1>
            </Link>
            <Link href="/vault">
              <h1
                className={cn(
                  "text-xl font-bold text-secondary hover:text-primary",
                  pathname === "/vault" && "text-primary"
                )}
              >
                Vault
              </h1>
            </Link>
          </div>
        </div>
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
              <p className="text-sm text-primary">
                {truncateAddress(dbUser?.walletAddress ?? "", 7)}
              </p>
            </DropdownMenuLabel>
            <div className="flex justify-center items-center mt-2 mb-3">
              <AnimatedButton
                className="bg-destructive h-[30px] w-[100px] text-sm"
                onClick={logout}
              >
                LOGOUT
              </AnimatedButton>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};

export default Header;
