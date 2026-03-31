import { useState, useRef, useEffect } from "react"

type Message = {
  role: "user" | "bot"
  content: string
}

export default function Chatbot() {

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "มีอะไรจะสอบถามไหมครับ ?"
    }
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)

  /* auto scroll */

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  /* ---------- API CALL ---------- */

  async function askBot(question: string) {

    /* ตรงนี้เปลี่ยนเป็น API จริงทีหลัง */

    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question
      })
    })

    if (!response.ok) {
      throw new Error("API error")
    }

    const data = await response.json()

    return data.reply
  }

  /* ---------- SEND MESSAGE ---------- */

  async function sendMessage() {

    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {

      const reply = await askBot(input)

      const botMessage: Message = {
        role: "bot",
        content: reply
      }

      setMessages(prev => [...prev, botMessage])

    } catch (err) {

      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          content: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
        }
      ])

    } finally {
      setLoading(false)
    }
  }

  /* enter send */

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  return (

    <div className="chatbot-page">

      <h1>แชทสอบถามอาการต่างๆ</h1>

      <p className="chat-warning">
        บอตตอบแชทอัตโนมัติ <span>*โปรดใช้วิจารณญาณ*</span>
      </p>

      <div className="chat-container">

        <div className="chat-messages" ref={chatRef}>

          {messages.map((m, i) => (

            <div
              key={i}
              className={`message ${m.role}`}
            >

              {m.role === "bot" && (
                <div className="avatar"/>
              )}

              <div className="bubble">
                {m.content}
              </div>

              {m.role === "user" && (
                <div className="avatar"/>
              )}

            </div>

          ))}

          {loading && (
            <div className="message bot">
              <div className="avatar"/>
              <div className="bubble loading">
                กำลังตอบ...
              </div>
            </div>
          )}

        </div>

        <div className="chat-input">

          <input
            type="text"
            placeholder="ฉันมีอาการ...."
            value={input}
            disabled={loading}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={handleKey}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
          >
            ส่ง
          </button>

        </div>

      </div>

    </div>

  )
}