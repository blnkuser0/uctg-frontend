export interface Mention {
  _id: string;
  source: "task" | "chat";
  authorName: string;
  message: string;
  createdAt: string;
  link: string;
}
