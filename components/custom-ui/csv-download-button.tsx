import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

interface CsvDownloadButtonProps {
  className?: string;
  label?: string;
  iconClassName?: string;
}

export const CsvDownloadButton = ({ className, label, iconClassName }: CsvDownloadButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex items-center justify-center gap-2 cursor-pointer pr-3", className)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {label && <span className="text-white text-sm">{label}</span>}
      <Download className={cn("text-primary", iconClassName)} size={36} />
    </motion.button>
  );
};
