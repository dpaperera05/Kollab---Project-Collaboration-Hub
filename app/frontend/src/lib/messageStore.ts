export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  messages: Message[];
}

const conversations: Conversation[] = [];

const randomId = () => crypto.randomUUID();

export const getConversationsForUser = (userId: string): Conversation[] =>
  conversations.filter((c) => c.participants.includes(userId));

export const getConversation = (id: string): Conversation | null =>
  conversations.find((c) => c.id === id) || null;

export const createConversation = (
  userId: string,
  userName: string,
  recipientName: string
): Conversation => {
  const convo: Conversation = {
    id: randomId(),
    participants: [userId, `user-${recipientName.toLowerCase().replace(/\s+/g, "-")}`],
    participantNames: [userName, recipientName],
    messages: [],
  };
  conversations.unshift(convo);
  return convo;
};

export const sendMessage = (conversationId: string, senderId: string, text: string): void => {
  const convo = conversations.find((c) => c.id === conversationId);
  if (!convo) return;
  convo.messages.push({ id: randomId(), senderId, text, timestamp: Date.now() });
};
