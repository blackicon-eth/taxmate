import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  index?: number;
  isLoading?: boolean;
}

export const AnimatedButton = ({
  children,
  onClick,
  className,
  index = 0,
  isLoading = false,
}: AnimatedButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.25 * index }}
      whileHover={{ scale: isLoading ? 1 : 1.03 }}
      whileTap={{ scale: isLoading ? 1 : 0.97 }}
      className={cn(
        "flex justify-center items-center bg-primary text-secondary h-[64px] w-[166px] text-2xl font-bold cursor-pointer rounded-full",
        isLoading && "bg-primary/50",
        className
      )}
      onClick={() => !isLoading && onClick()}
    >
      {isLoading ? (
        <Loader2 className={cn("w-7 h-7 animate-spin", isLoading && "opacity-50")} />
      ) : (
        children
      )}
    </motion.button>
  );
};
