import { getContactMessages } from "@/lib/actions/admin";
import { MessagesManager } from "@/components/admin/MessagesManager";

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();
  return <MessagesManager initial={messages} />;
}
