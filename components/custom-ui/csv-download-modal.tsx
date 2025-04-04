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
import { Download } from "lucide-react";
import { DatePickerWithRange } from "../shadcn-ui/date-picker";
import { AnimatedButton } from "./animated-button";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { formatDateToDatabase } from "@/lib/utils";

interface CsvDownloadModalProps {
  children: ReactNode;
  transactions: Transaction[];
}

const csvHeaders = [
  "N",
  "Date",
  "Wallet Address",
  "Token Symbol",
  "Protocol",
  "Amount USD",
  "Amount EUR",
  "24h Change % (eur)",
  "Daily Profit (EUR)",
  "USD/EUR Rate",
  "Chain",
];

export const CsvDownloadModal = ({ children, transactions }: CsvDownloadModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 2, 4),
    to: addDays(new Date(2025, 2, 4), 30),
  });

  const handleDownload = () => {
    if (!date?.from || !date?.to) return;
    const filteredTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate >= date.from! && txDate <= date.to!;
    });

    const csvContent = [
      csvHeaders.join(","),
      ...filteredTransactions.map((tx) =>
        [
          tx.id,
          formatDateToDatabase(tx.createdAt),
          tx.walletAddress,
          tx.tokenSymbol,
          tx.protocol,
          tx.amountUSD,
          tx.amountEUR,
          tx.change24h,
          tx.eurDailyProfit,
          tx.usdToEurRate,
          tx.chain,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `report_${formatDateToDatabase(date.from.toISOString())}_to_${formatDateToDatabase(
        date.to.toISOString()
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="flex flex-col justify-center items-center bg-card w-[420px]">
        <DialogHeader className="flex flex-row justify-center items-center w-full gap-4">
          <div className="flex flex-row justify-between items-center w-[90%]">
            <Download className="size-22 text-primary" />
            <div className="flex flex-col justify-center items-center gap-0.5">
              <DialogTitle className="text-2xl font-bold">Select Time Period</DialogTitle>
              <DialogDescription className="text-center">
                Select the time span you want to download the transactions for.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col justify-center items-center w-full mt-1">
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="flex justify-center items-center w-[90%]"
          />
          <AnimatedButton
            className="w-[90%] mt-2 rounded-md text-sm h-[30px]"
            onClick={handleDownload}
            disabled={!date?.from || !date?.to}
          >
            Download
          </AnimatedButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
