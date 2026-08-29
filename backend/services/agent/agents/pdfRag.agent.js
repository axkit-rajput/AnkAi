import fs from "fs"
import {PDFParse} from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { vectorStore } from "../config/vectorDb.js"
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
import { agentFailure, agentSuccess } from "../utils/agentFailure.js"

export const pdfRag=async (state)=>{
   try {
    if(!state.file?.path){
      const error=new Error("No PDF was uploaded.")
      error.status=400
      error.data={message:"Attach a PDF to ask questions about it."}
      throw error
    }

    await checkAgentLimit(state.userId,"pdf")
    await deductCredits(state.userId,"pdf")

      const buffer=fs.readFileSync(state.file.path)
      const pdf=new PDFParse({
        data:buffer
      })

      const result=await pdf.getText()
      const text=result.text

      if(!text?.trim()){
        const error=new Error("PDF contained no extractable text.")
        error.status=422
        error.data={
          message:"No readable text was found in that PDF. It may be a scan."
        }
        throw error
      }

      const spilliter=new RecursiveCharacterTextSplitter({
        chunkSize:1000,
        chunkOverlap:200
      })

      const docs=await spilliter.createDocuments([text])
      const collectionName=`pdf-${Date.now()}`;
      const store=await vectorStore(docs,collectionName)

      const relevantDocs=await store.similaritySearch(state.prompt,5)
      
      const context=relevantDocs.map(d=>d.pageContent).join("\n\n")
      
      const llm=await getModel("pdf-rag")

       const messages=[
        new SystemMessage(`You are AnkAI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.

- Never make up information.

- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.
`),

new HumanMessage(`
    Context:${context}
     Question:${state.prompt}
    `)
       ]


      const response=await llm.invoke(messages)

      return agentSuccess(state,{
        aiResponse:response.content
      })

   } catch (error) {
    /* The controller removes the upload in its own finally block. Doing an
       unguarded unlinkSync here threw on a missing file and masked the real
       error. */
    return agentFailure(state,error,"Failed to analyze the PDF.")
   }
}