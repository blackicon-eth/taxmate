import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface CsvDownloadButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  label?: string;
  iconClassName?: string;
}

export const CsvDownloadButton = forwardRef<HTMLButtonElement, CsvDownloadButtonProps>(
  ({ className, label, iconClassName, ...props }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <button
          ref={ref}
          className={cn("flex items-center justify-center gap-2 cursor-pointer pr-3", className)}
          type="button"
          {...props}
        >
          {label && <span className="text-white text-sm">{label}</span>}
          <Download className={cn("text-primary", iconClassName)} size={36} />
        </button>
      </motion.div>
    );
  }
);

CsvDownloadButton.displayName = "CsvDownloadButton";
