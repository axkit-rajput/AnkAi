import { Annotation } from "@langchain/langgraph";


export const agentState=Annotation.Root({
    prompt:Annotation(),
    aiResponse:Annotation(),
    agent:Annotation(),
    conversationId:Annotation(),
    searchResults:Annotation(),
    images:Annotation(),
    artifacts:Annotation(),
    userId:Annotation(),
    file:Annotation(),
    /* Set by an agent when the run did not produce a real answer (rate limit,
       out of credits, provider error). The controller uses it to avoid writing
       the error text into conversation history. */
    failed:Annotation(),
    failedStatus:Annotation()
})
