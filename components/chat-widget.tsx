"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, X, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  content: string
  sender: "user" | "admin"
  timestamp: Date
  isRead: boolean
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can we help you with your dog hotel reservation?",
      sender: "admin",
      timestamp: new Date(),
      isRead: true,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      // Mark messages as read when chat is open
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      isRead: true,
    }
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    // Simulate admin response after a delay
    setTimeout(() => {
      const adminMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Thank you for your message! Our team will get back to you shortly. If you have any questions about your reservation, feel free to ask.",
        sender: "admin",
        timestamp: new Date(),
        isRead: isOpen,
      }
      setMessages((prev) => [...prev, adminMessage])
      setIsLoading(false)
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1)
      }
    }, 1500)
  }

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-orange-600 hover:bg-orange-700"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white h-6 w-6 flex items-center justify-center p-0 rounded-full">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 shadow-xl border-orange-200 z-50">
          <CardHeader className="bg-orange-600 text-white py-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Dog Hotel" />
                  <AvatarFallback>DH</AvatarFallback>
                </Avatar>
                Dog Hotel Support
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-white hover:bg-orange-700 rounded-full"
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(24rem-6rem)] px-4 py-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.sender === "user" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-gray-100 text-gray-800">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <p className="text-sm">Typing...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-2 border-t">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="bg-orange-600 hover:bg-orange-700">
                <Send size={16} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
