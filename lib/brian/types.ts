export interface BrianChatMetadata {
  description: string;
  language: string;
  source: string;
  title: string;
}

export interface BrianChatContext {
  pageContent: string;
  metadata: BrianChatMetadata;
}

export interface BrianChatResult {
  input: string;
  chat_history: string[];
  context: BrianChatContext[];
  answer: string;
}

export interface BrianChatResponse {
  result: BrianChatResult;
}
