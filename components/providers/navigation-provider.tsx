import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "../custom-ui/header";

const disabledPaths: string[] = ["/"];

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  if (disabledPaths.includes(pathname)) return <div className="h-full">{children}</div>;

  // The padding top is hardcoded here because the header is fixed
  return (
    <div className="pt-[72px] h-full bg-background text-white transition-all duration-300">
      <Header />
      <div className="p-8 h-full">{children}</div>
    </div>
  );
};
