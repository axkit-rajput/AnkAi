import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"

export const searchAgent = async (state) => {
    try {
        await checkAgentLimit(state.userId, "search")
        await deductCredits(state.userId, "search")

        const results = await searchTool.invoke({
            query: state.prompt
        })

        return agentSuccess(state, {
            searchResults: results,
            images: Array.isArray(results?.images) ? results.images : []
        })
    } catch (error) {
        return agentFailure(state, error, "Web search failed.", {
            searchResults: null,
            images: []
        })
    }
}