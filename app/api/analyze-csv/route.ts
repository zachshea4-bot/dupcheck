import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { Anthropic } from "@anthropic-ai/sdk"
import { createClient } from "@supabase/supabase-js"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const filename = formData.get("filename") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split("\n").filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain at least a header and one data row" },
        { status: 400 }
      )
    }

    const headers = lines[0]
      .toLowerCase()
      .split(",")
      .map((h) => h.trim())
    const dataRows = lines.slice(1)

    const requiredFields = ["date", "vendor", "amount"]
    const hasRequiredFields = requiredFields.every((field) =>
      headers.some((h) => h.includes(field))
    )

    if (!hasRequiredFields) {
      return NextResponse.json(
        {
          error: `CSV must contain columns: ${requiredFields.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const transactions = dataRows
      .map((row) => {
        const values = row.split(",").map((v) => v.trim())
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index]
        })
        return obj
      })
      .filter((obj) => obj.date && obj.vendor && obj.amount)

    const csvContent = `
Analyze these transactions for duplicate payments. Look for:
1. Same vendor and same amount paid multiple times
2. Similar amounts (within 1% variance) from same vendor
3. Dates within 30 days of each other
4. Same invoice numbers appearing twice

Format response as JSON with this structure:
{
  "duplicates": [
    {
      "group": [transaction1, transaction2],
      "total_amount": number,
      "confidence": "high" | "medium",
      "reason": "string"
    }
  ]
}

Transactions:
${JSON.stringify(transactions, null, 2)}
`

    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: csvContent,
        },
      ],
    })

    // The response can contain thinking blocks before the text, so pick the
    // text blocks explicitly rather than assuming content[0] is text.
    const responseText = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")

    let duplicates: any[] = []
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        duplicates = parsed.duplicates || []
      }
    } catch (e) {
      console.error("Failed to parse Claude response")
    }

    const { data: uploadData } = await supabase
      .from("uploads")
      .insert([
        {
          user_id: userId,
          filename: filename,
          csv_data: csvText,
          duplicates_found: duplicates.length,
          total_transactions: transactions.length,
          created_at: new Date(),
        },
      ])
      .select()
      .single()

    if (uploadData && duplicates.length > 0) {
      const duplicateRecords = duplicates.map((dup: any) => ({
        upload_id: uploadData.id,
        vendor: dup.group?.[0]?.vendor || "Unknown",
        amount: parseFloat(dup.total_amount || 0),
        confidence_score: dup.confidence === "high" ? 0.9 : 0.6,
        details: JSON.stringify(dup),
        created_at: new Date(),
      }))

      await supabase.from("duplicates").insert(duplicateRecords)
    }

    return NextResponse.json({
      success: true,
      duplicates_found: duplicates.length,
      total_amount: duplicates.reduce(
        (sum: number, d: any) => sum + (d.total_amount || 0),
        0
      ),
      duplicates: duplicates,
      upload_id: uploadData?.id,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Failed to analyze CSV" },
      { status: 500 }
    )
  }
}
