import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { promises as fs } from 'fs'
import { join } from 'path'

import {
  type Routine,
  createRoutine,
} from "./routine"

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
})

server.tool(
  "create-routine",
  "Create a custom routine from recently run actions. Inspect recently run tools ",
  {
    name: z.string().describe("Name of the custom tool to be created"),
    description: z.string().describe("Description of the tool, provide as much context as possible so that when user calls the tool again the LLM can follow the instruction to complete the task with different set of inputs"),
    steps: z.array(
      z.object({
        description: z.string().describe("Description of the step to help the LLM understand the purpose of the tool call"),
        tool: z.string().describe("The tool used with name, input schema used"),
        params: z.object({}).passthrough().describe("Parameters used to call the tool, based on the context some of these should be swapped out with dynamic values"),
      }).strict().describe("Each step of the routine is a tool call that will get executed and returned the result to feed into the next step")
    ),
  },
  async ({ name, description, steps }) => {
    const filename = process.env.TOOL_FILENAME ?? join(process.cwd(), "routines.json")
    await createRoutine({
      filename,
      routine: { name, description, steps },
    })

    return {
      content: [
        {
          type: "text",
          text: `Successfully created routine "${name}" with ${steps.length} steps`
        }
      ]
    }
  }
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  console.info("MCP routine server is running on stdio")
}

main().catch((error) => {
  console.error("Fatal error in main():", error)
  process.exit(1)
})
