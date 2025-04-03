import { cn } from "@/lib/utils";
import { HashLoader } from "react-spinners";

interface FullPageLoaderProps {
  customLoader?: React.ReactNode;
  className?: string;
}

export const FullPageLoader = ({ customLoader, className }: FullPageLoaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col h-screen items-center justify-center bg-background text-white",
        className
      )}
    >
      {customLoader || <HashLoader size={56} color="#01a38c" speedMultiplier={1} />}
    </div>
  );
};
