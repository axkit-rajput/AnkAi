import mongoose from "mongoose"
import Conversation from "../models/coversation.model.js"
import Message from "../models/message.model.js"

const TITLE_MAX_LENGTH = 40

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

export const createConversation = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]

    /* Without this the conversation is created with userId undefined, and
       get-conversations (which filters on userId) can never return it. */
    if (!userId) {
      return res.status(401).json({ message: "unauthorized" })
    }

    const conversation = await Conversation.create({ userId })

    return res.status(200).json(conversation)
  } catch (error) {
    console.error("create conversation error:", error)
    return res.status(500).json({ message: "create conversation failed" })
  }
}

export const getConversations = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]

    /* Mongoose strips undefined from a filter, so find({userId: undefined})
       returned every conversation in the database. */
    if (!userId) {
      return res.status(401).json({ message: "unauthorized" })
    }

    const conversations = await Conversation.find({ userId }).sort({
      updatedAt: -1
    })

    return res.status(200).json(conversations)
  } catch (error) {
    console.error("get conversations error:", error)
    return res.status(500).json({ message: "get conversations failed" })
  }
}

export const updateConversation = async (req, res) => {
  try {
    const { id, title } = req.body
    const userId = req.headers["x-user-id"]

    if (!userId) {
      return res.status(401).json({ message: "unauthorized" })
    }

    if (!isValidId(id)) {
      return res.status(400).json({ message: "valid conversation id required" })
    }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "title is required" })
    }

    /* Scoping the update to the owner stops one account renaming another's
       conversation by id. `new: true` so the caller gets the saved title
       instead of the pre-update document. */
    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      { title: title.trim().slice(0, TITLE_MAX_LENGTH) },
      { new: true }
    )

    if (!conversation) {
      return res.status(404).json({ message: "conversation not found" })
    }

    return res.status(200).json(conversation)
  } catch (error) {
    console.error("update conversation error:", error)
    return res.status(500).json({ message: "update conversation failed" })
  }
}

export const saveMessage = async (req, res) => {
  try {
    const { conversationId, role, content, images, artifacts } = req.body

    if (!isValidId(conversationId)) {
      return res.status(400).json({ message: "valid conversationId required" })
    }

    if (role !== "user" && role !== "assistant") {
      return res.status(400).json({ message: "role must be user or assistant" })
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ message: "content is required" })
    }

    const message = await Message.create({
      conversationId,
      content,
      role,
      images: Array.isArray(images) ? images : [],
      artifacts: Array.isArray(artifacts) ? artifacts : []
    })

    /* Touch the parent so the sidebar's updatedAt ordering reflects real
       activity - writing a message did not previously update it. */
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { updatedAt: new Date() } },
      { timestamps: false }
    )

    return res.status(200).json(message)
  } catch (error) {
    console.error("save message error:", error)
    return res.status(500).json({ message: "save message failed" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params

    if (!isValidId(conversationId)) {
      return res.status(400).json({ message: "valid conversationId required" })
    }

    /* Requests routed through the gateway always carry x-user-id; only then can
       ownership be checked. Service-to-service calls (agent memory warm-up)
       reach this service directly and carry no header. */
    const userId = req.headers["x-user-id"]

    if (userId) {
      const conversation = await Conversation.findById(conversationId).select(
        "userId"
      )

      if (!conversation) {
        return res.status(404).json({ message: "conversation not found" })
      }

      if (String(conversation.userId) !== String(userId)) {
        return res.status(403).json({ message: "forbidden" })
      }
    }

    /* Explicit sort - insertion order is not guaranteed, and an out of order
       thread reads as if the assistant replied before the question. */
    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
      _id: 1
    })

    return res.status(200).json(messages)
  } catch (error) {
    console.error("get messages error:", error)
    return res.status(500).json({ message: "get messages failed" })
  }
}
