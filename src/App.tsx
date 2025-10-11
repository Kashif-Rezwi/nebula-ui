import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';

function App() {
  const [conversationId, setConversationId] = useState<string>('1');

  const handleNewChat = () => {
    setConversationId(Date.now().toString());
  };

  return (
    <div className="flex h-screen">
      <Sidebar onNewChat={handleNewChat} />
      <ChatArea key={conversationId} />
    </div>
  );
}

export default App;