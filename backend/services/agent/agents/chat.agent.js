import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import { getMemory } from "../config/memory.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"

export const chatAgent = async (state) => {

    /* search -> chat is an unconditional edge. If search already failed, keep
       its reason instead of quietly answering without the results the user
       asked for. */
    if (state.failed) return state

    try {

        await checkAgentLimit(state.userId, "chat")

        /* Reserve credits before spending a model call. */
        await deductCredits(state.userId, "chat")

        const llm = await getModel("chat")

        const history = await getMemory(state.conversationId)

        const searchContext = state.searchResults ? `
   Web Search Results:

${JSON.stringify(state.searchResults)}

Answer the user using only the above search results.
` : ""


    const systemPrompt = `
    You are AnkAI, an intelligent AI assistant.

 
    ${searchContext}

    If searchContext exists:

- Use search results to answer.
- Do not mention internal tools.


    Rules:

- For simple questions, greetings, and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.


 Formatting:

- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content on the same line.
- Never generate large walls of text.
`
    const messages = [
        new SystemMessage(systemPrompt)
    ]

    /* Redis memory can hold an entry with no content (older writes). Skip
       those - the providers reject empty message parts. */
    history.forEach(msg => {
        if (!msg?.content) return

        if (msg.role === "user") {
            messages.push(new HumanMessage(msg.content))
        }
        if (msg.role === "assistant") {
            messages.push(new AIMessage(msg.content))
        }
    });

    messages.push(new HumanMessage(state.prompt))

    const response = await llm.invoke(messages)

    return agentSuccess(state, {
        aiResponse: response.content
    })
    } catch (error) {
        return agentFailure(state, error, "Failed to generate a reply.")
    }

}