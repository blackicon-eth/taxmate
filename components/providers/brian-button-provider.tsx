"use client";
import { ReactNode, useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcn-ui/dialog";
import { Input } from "../shadcn-ui/input";
import { AnimatedButton } from "@/components/custom-ui/animated-button";
import { ScrollArea } from "../shadcn-ui/scroll-area";
import ky from "ky";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatState {
  chat: Message[];
  setChat: (chat: Message[]) => void;
  clearChat: () => void;
}

export const useBrianChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chat: [],
      setChat: (chat) => set({ chat }),
      clearChat: () => set({ chat: [] }),
    }),
    {
      name: "brian-chat-storage",
    }
  )
);

interface BrianButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BrianButton = ({ onClick, className }: BrianButtonProps) => {
  return (
    <motion.button
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick ?? (() => {})}
      className={cn(
        "flex relative justify-center items-center size-24 bg-secondary text-black rounded-full z-50 cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col justify-center items-center size-[86px] bg-white rounded-full z-50">
        <img src="/images/brian-logo.png" alt="Brian" className="size-12 -mt-2" />
        <span className="text-[11px] -mt-1">Ask Brian!</span>
      </div>
      <div className="absolute bottom-[0px] right-[15px] w-11 overflow-hidden inline-block">
        <div className="h-8 bg-secondary -rotate-45 transform origin-top-right" />
      </div>
    </motion.button>
  );
};

interface BrianButtonProviderProps {
  children: ReactNode;
}

interface BrianModalProps {
  children: ReactNode;
}

export const BrianModal = ({ children }: BrianModalProps) => {
  const { chat, setChat } = useBrianChatStore();
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chat, isLoading]);

  const handleSendMessage = async (message: string) => {
    setMessage("");
    const updatedChat = [
      ...chat,
      { role: "user" as const, content: message, timestamp: Date.now() },
    ];
    setChat(updatedChat);

    setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await ky
          .post<string>("/api/brian", {
            json: {
              message,
            },
          })
          .json();
        setChat([
          ...updatedChat,
          { role: "assistant" as const, content: response, timestamp: Date.now() },
        ]);
      } catch (error) {
        toast.error("Something went wrong, please try again later.");
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };

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
        <div className="flex flex-col justify-start items-center size-full">
          <ScrollArea
            viewportRef={viewportRef}
            className="w-full h-[500px] border rounded-md mb-2 p-3"
          >
            <div className="flex flex-col justify-center items-center size-full p-2 gap-2">
              {chat.length === 0 ? (
                <p className="text-3xl pt-24 text-center">
                  No messages yet... 🤔
                  <br />
                  <span className="text-lg text-foreground/50">
                    Send a first message to Brian and he will help you out!
                  </span>
                </p>
              ) : (
                chat.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex flex-col items-start max-w-[60%] min-w-[20%] rounded-md py-1.5 px-2",
                      message.role === "user"
                        ? "bg-primary self-end"
                        : "bg-secondary self-start text-black"
                    )}
                  >
                    <div className="text-md leading-5 pr-2 pb-1">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div
                      className={cn(
                        "flex w-full justify-end text-[11px]",
                        message.role === "user" && "text-white"
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </motion.div>
                ))
              )}
              {isLoading && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-start max-w-[55%] rounded-md pb-3.5 px-3.5 bg-secondary self-start text-black"
                  >
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="text-4xl leading-5 text-black"
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="text-4xl leading-5 text-black"
                      >
                        .
                      </motion.span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="text-4xl leading-5 text-black"
                      >
                        .
                      </motion.span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-center items-center w-full gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message) {
                  handleSendMessage(message);
                }
              }}
              className="flex justify-center items-center size-full gap-2"
            >
              <Input
                className="w-full"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Brian..."
              />
              <AnimatedButton
                type="submit"
                className="w-1/6 h-[34px] text-sm rounded-md text-white bg-primary cursor-pointer"
                disabled={!message}
                isLoading={isLoading}
                loaderSize={20}
              >
                SEND
              </AnimatedButton>
              <AnimatedButton
                type="button"
                onClick={() => setChat([])}
                className="w-1/6 h-[34px] text-sm rounded-md text-black cursor-pointer bg-secondary"
              >
                Clear
              </AnimatedButton>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const BrianButtonProvider = ({ children }: BrianButtonProviderProps) => {
  return <>{children}</>;
};
