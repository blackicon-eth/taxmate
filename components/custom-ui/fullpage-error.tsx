import { cn } from "@/lib/utils";
import React from "react";

interface FullPageErrorProps {
  className?: string;
  errorMessage?: string;
  children?: React.ReactNode;
}

export const FullPageError = ({ className, errorMessage, children }: FullPageErrorProps) => {
  return (
    <div
      className={cn(
        "flex flex-col h-screen items-center justify-center bg-background px-5 text-center gap-2.5",
        className
      )}
    >
      {errorMessage && (
        <>
          <p className="text-white text-2xl">Unexpected Error:</p>
          <p className="text-red-500">{errorMessage}</p>
        </>
      )}
      {children}
    </div>
  );
};
