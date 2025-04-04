import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  index?: number;
  isLoading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  loaderSize?: number;
}

export const AnimatedButton = ({
  children,
  onClick,
  className,
  index = 0,
  disabled = false,
  isLoading = false,
  type = "button",
  loaderSize = 28,
}: AnimatedButtonProps) => {
  const isDisabled = disabled || isLoading;
  return (
    <motion.button
      type={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.25 * index }}
      whileHover={{ scale: isDisabled ? 1 : 1.03, opacity: isDisabled ? 1 : 0.9 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className={cn(
        "flex justify-center items-center bg-primary text-white h-[64px] w-[166px] text-2xl font-bold cursor-pointer rounded-full",
        isDisabled && "bg-primary/50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", isDisabled && "opacity-50")} size={loaderSize} />
      ) : (
        children
      )}
    </motion.button>
  );
};
