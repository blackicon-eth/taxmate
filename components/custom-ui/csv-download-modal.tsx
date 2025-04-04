import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { ReactNode, useState } from "react";
import { Transaction } from "@/lib/db/schemas/db.schema";

interface CsvDownloadModalProps {
  children: ReactNode;
  transactions: Transaction[];
}

export const CsvDownloadModal = ({ children, transactions }: CsvDownloadModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col bg-card w-[876px]">
        <DialogHeader className="flex flex-row justify-start items-center gap-2.5">
          <img src="/images/brian-logo.png" alt="Brian" className="size-14" />
          <div className="flex flex-col justify-center items-start gap-0.5">
            <DialogTitle className="text-2xl font-bold">
              Ask{" "}
              <a
                href="https://www.brianknows.org/"
                className="text-primary underline"
                target="_blank"
              >
                Brian
              </a>
            </DialogTitle>
            <DialogDescription>Ask Brian about anything web3 related!</DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
