import { useChatbot } from "@/hooks/useChatbot";
import ChatLauncher from "./ChatLauncher";
import ChatWidget from "./ChatWidget";

const Chatbot = () => {
  const {
    isOpen,
    toggle,
    close,
    messages,
    isTyping,
    hasUnread,
    sendMessage,
    newChat,
    pathname,
  } = useChatbot();

  const isOnboardingRoute = pathname.startsWith("/onboarding");
  if (isOnboardingRoute) return null;

  return (
    <>
      <ChatWidget
        isOpen={isOpen}
        messages={messages}
        isTyping={isTyping}
        onClose={close}
        onMinimize={close}
        onNewChat={newChat}
        onSend={sendMessage}
        pathname={pathname}
      />
      <ChatLauncher isOpen={isOpen} hasUnread={hasUnread} onClick={toggle} />
    </>
  );
};

export default Chatbot;
