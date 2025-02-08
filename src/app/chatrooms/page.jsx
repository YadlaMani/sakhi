"use client";
import React, { useEffect, useState } from "react";
import {
  fetchUserRooms,
  sendMessage,
  fetchMessages,
  getRoomDetails,
} from "../../../actions/chatRoomActions";
import { toast } from "sonner";
import { getUser } from "../../../actions/userActions";
import { MessageCircle, Send, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ChatRooms = () => {
  const [userRooms, setUserRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);

  async function fetchRooms() {
    try {
      const response = await fetchUserRooms(localStorage.getItem("token"));
      setUserRooms(response);
    } catch (error) {
      toast.error("Failed to fetch user rooms");
    }
  }

  async function fetchRoomMessages(roomId) {
    const response = await fetchMessages(roomId);
    setMessages(response);
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      const response = await sendMessage(
        selectedRoom,
        newMessage,
        localStorage.getItem("token")
      );
      if (response.success) {
        toast.success("Message sent");
        setNewMessage("");
        fetchRoomMessages(selectedRoom);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  }

  async function fetchUser() {
    const response = await getUser(localStorage.getItem("token"));
    setUser(response.user);
  }

  async function fetchRoomDetails() {
    try {
      const response = await getRoomDetails(selectedRoom);
      if (response.success) {
        setRoomDetails(response.room);
      }
    } catch (err) {
      toast.error("Failed to fetch room details");
    }
  }

  useEffect(() => {
    fetchRooms();
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchRoomMessages(selectedRoom);
      fetchRoomDetails();
      const interval = setInterval(() => fetchRoomMessages(selectedRoom), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Chat Rooms
            </h2>
            <Badge variant="secondary" className="h-6">
              {userRooms.length}
            </Badge>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="space-y-2 pr-4">
              {userRooms.map((room) => (
                <button
                  key={room.roomId}
                  onClick={() => setSelectedRoom(room.roomId)}
                  className={`w-full p-3 flex items-center justify-between rounded-lg transition-all duration-200 hover:bg-accent group ${
                    selectedRoom === room.roomId
                      ? "bg-primary/5 hover:bg-primary/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${room.roomId}.png`}
                      />
                      <AvatarFallback>
                        {room.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-sm">{room.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.participantCount} participants
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col mb-3">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 bg-card">
              <div className="flex items-center justify-between">
                {/* Room Title and Participant Count */}
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold">
                    {roomDetails?.title || "Chat"}
                  </h2>
                  {roomDetails && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Users className="h-3 w-3" />
                      {roomDetails.participants.length}
                    </Badge>
                  )}
                </div>

                {/* Participant List with Names */}
                {roomDetails && (
                  <TooltipProvider>
                    <div className="flex gap-3 flex-wrap">
                      {roomDetails.participants.map((participant) => (
                        <Tooltip key={participant.userId}>
                          <TooltipTrigger>
                            <Avatar className="border-2 border-background h-8 w-8">
                              <AvatarImage
                                src="/participant.png"
                                alt={participant.username}
                              />
                              <AvatarFallback>
                                {participant.username
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="text-sm font-medium">
                              {participant.username}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === user?._id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-2 max-w-[70%] ${
                        msg.sender === user?._id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${msg.sender}.png`}
                          alt={msg.username}
                        />
                        <AvatarFallback>
                          {msg.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`space-y-1 ${
                          msg.sender === user?._id ? "items-end" : "items-start"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground">
                          {msg.username}
                        </p>
                        <div
                          className={`rounded-lg p-3 ${
                            msg.sender === user?._id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t p-4 bg-card">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold text-lg">No Chat Selected</h3>
              <p className="text-sm text-muted-foreground">
                Choose a chat room to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRooms;
