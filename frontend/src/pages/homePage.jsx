import ChatContainer from "../components/chatContainer";
import NoChatSelected from "../components/noChatSelected";
import SideBar from "../components/sideBar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen w-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          {/* Desktop View */}
          <div className="hidden md:flex h-full rounded-lg overflow-hidden">
            <SideBar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>

          {/* Mobile View */}
          <div className="block md:hidden h-full rounded-lg overflow-hidden">
            {!selectedUser ? <SideBar /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
