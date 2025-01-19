import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarLoading from "./loaders/sidebarLoading";
import { CirclePlus, MessageSquare, Users, X } from "lucide-react";
import { useAuthenticationStore } from "../store/useAuthenticationStore";

const SideBar = () => {
  const [chatsVisible, setChatsVisible] = useState(true);
  const {
    users,
    getUsers,
    chats,
    getChats,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthenticationStore();

  useEffect(() => {
    getUsers();
    getChats();
  }, [getUsers, getChats]);

  const handleChatVisibility = () => {
    setChatsVisible(!chatsVisible);
  };

  if (isUsersLoading) return <SidebarLoading />;

  return (
    <aside className="h-full sm:w-full md:w-72 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5 flex justify-between">
        <button className="flex items-center gap-2">
          {chatsVisible ? (
            <>
              <MessageSquare className="size-6" />
              <span className="font-medium block">Your Chats</span>
            </>
          ) : (
            <>
              <Users className="size-6" />
              <span className="font-medium block">All Users</span>
            </>
          )}
        </button>
        <button className="btn rounded-full " onClick={handleChatVisibility}>
          {chatsVisible ? <CirclePlus /> : <X />}
        </button>
      </div>
      {chatsVisible ? (
        <div className="overflow-y-auto w-full py-3">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedUser(chat)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors text-left ${
                selectedUser?._id === chat._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.profilePicture || "avatar.png"}
                  alt={chat.name}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(chat._id) && (
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                  />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{chat.fullName}</div>
                <div className="text-sm text-zinc-400">{chat.email}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-y-auto w-full py-3">
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors text-left ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
            >
              <div className="relative">
                <img
                  src={user.profilePicture || "avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">{user.email}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};

export default SideBar;
