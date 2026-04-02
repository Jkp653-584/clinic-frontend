import { useState, useRef, useEffect } from "react"
import { useChatbotApi } from "../../api"
import uploadIcon from "../../assets/image-.png"

type Message = {
  role: "user" | "bot"
  content: string
  image?: string
}

export default function Chatbot() {

  const { sendMessage: sendApi, getHistory } = useChatbotApi()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)

  const chatRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  /* session */
  const [sessionId] = useState(() => {
    const existing = localStorage.getItem("chat_session")
    if (existing) return existing

    const newSession = crypto.randomUUID()
    localStorage.setItem("chat_session", newSession)
    return newSession
  })

  /* auto scroll */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages])

  /* load history */
  useEffect(() => {
    fetchHistory()
  }, [])

  async function fetchHistory() {
    try {
      const data = await getHistory(sessionId)

      if (!data || data.length === 0) {
        setMessages(prev => [
          ...prev,
          { role: "bot", content: "มีอะไรจะสอบถามไหมครับ ?" }
        ])
        return
      }

      const mapped: Message[] = data.map((item: any) => ({
        role: item.sender === "patient" ? "user" : "bot",
        content: item.message,
        image: item.image_url || undefined
      }))

      // 🔥 merge history ใหม่โดยไม่ลบข้อความที่เพิ่งส่งไป
      setMessages(prev => {
        // เอาเฉพาะ history ใหม่ที่ยังไม่มีใน state
        const existingContents = new Set(prev.map(m => m.content))
        const newMessages = mapped.filter(m => !existingContents.has(m.content))
        return [...prev, ...newMessages]
      })

    } catch (err) {
      console.error(err)
    }
  }

  async function sendMessage() {
    if ((!input.trim() && !image) || loading) return

    let previewUrl: string | undefined
    if (image) previewUrl = URL.createObjectURL(image)

    // 🔹 show user message ทันที
    setMessages(prev => [
      ...prev,
      { role: "user", content: input, image: previewUrl }
    ])

    const currentInput = input
    setInput("")
    setLoading(true)

    try {
      // 🔹 ส่งข้อความไป API
      const response = await sendApi({
        session_id: sessionId,
        message: currentInput,
        image: image || undefined
      })

      // 🔹 เอา reply จาก API มาโชว์ทันที
      if (response?.success && response?.reply) {
        setMessages(prev => [
          ...prev,
          {
            role: "bot",
            content: response.reply,
            image: response.has_image ? "url_image_if_any" : undefined
          }
        ])
      }

      // 🔹 เรียก fetchHistory() ทุกครั้งหลังส่ง เพื่อให้ source of truth update
      fetchHistory().catch(err => console.error(err))

    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev,
        { role: "bot", content: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" }
      ])
    } finally {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setImage(null)
      if (fileRef.current) fileRef.current.value = ""
      setLoading(false)
    }
  }

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
            <div key={i} className={`message ${m.role}`}>

              {m.role === "bot" && <div className="avatar bot-avatar" />}

              <div className="bubble">

                {/* 🔥 รูปขึ้นก่อน */}
                {m.image && (
                  <img src={m.image} className="chat-image" />
                )}

                {/* 🔥 เว้นบรรทัดอัตโนมัติ */}
                {m.image && m.content && <div style={{ height: 6 }} />}

                <div>
                  {m.content}
                </div>

              </div>

              {m.role === "user" && <div className="avatar user-avatar" />}

            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="avatar bot-avatar" />
              <div className="bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

        </div>

        <div className="chat-input">
          {/* 🔹 row ของ input + import + send */}
          <div className="input-row">
            <input
              type="text"
              placeholder="ฉันมีอาการ...."
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />

            {!image && (
              <label className="upload-btn">
                <img src={uploadIcon} className="upload-icon" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
            )}

            <button className="send-btn" onClick={sendMessage} disabled={loading}>
              ส่ง
            </button>
          </div>

          {/* 🔹 row ของ file preview */}
          {image && (
            <div className="file-preview">
              <span>{image.name}</span>
              <button
                onClick={() => {
                  setImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}