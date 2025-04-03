"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRegisteredUser } from "../providers/user-provider";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
export const Header = () => {
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
        <img
          src={
            dbUser?.pfp ||
            "https://imgs.search.brave.com/cJOZft-Yy2ofV4ZUdOr2EbwB2Gb-kCf3ULkPIBq85O8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAzLzQ2LzkzLzYx/LzM2MF9GXzM0Njkz/NjExNF9SYXhFNk9R/b2dlYmdBV1RhbEUx/bXlzZVkxSGJiNXFQ/TS5qcGc"
          }
          alt="pfp"
          width={48}
          height={48}
          className="rounded-full object-cover w-[48px] h-[48px]"
        />
      </div>
    </motion.header>
  );
};

export default Header;
