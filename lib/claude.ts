import { Anthropic } from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeDuplicates(csvData: string): Promise<any> {
  const message = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    messages: [
      {
        role: "user",
        content: `Analyze these transactions for duplicate payments:\n\n${csvData}`,
      },
    ],
  })

  return message
}
