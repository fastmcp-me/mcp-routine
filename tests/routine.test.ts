import {
  createRoutine
} from "../src/routine"
import { promises as fs } from 'fs';
import path from 'path';

describe("createRoutine", () => {
  const testFilePath = "tests/tmp.json";
  
  // Clean up test file after tests
  afterEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it("creates a routine file with the correct structure", async () => {
    const routine = {
      "name": "create_subpage_in_getting_started",
      "description": "Creates a new page under the Getting Started page. This routine first searches for the Getting Started page to get its ID, then creates a new page with the specified title as a subpage. The routine demonstrates how to create a hierarchical page structure.",
      "steps": [
        {
          "tool": "mcp_Api_API-post-search",
          "params": {
            "query": "Getting started"
          },
          "description": "Search for the Getting Started page to obtain its page ID"
        },
        {
          "tool": "mcp_Api_API-post-page",
          "params": {
            "parent": {
              "page_id": "264eee3b-b5a1-4c45-9ef3-194a7d48988c"
            },
            "properties": {
              "title": [
                {
                  "text": {
                    "content": "First day"
                  }
                }
              ]
            }
          },
          "description": "Create a new subpage titled 'First day' under the Getting Started page using the parent page ID"
        }
      ]
    };

    await createRoutine({ routine, filename: testFilePath });

    // Verify the file was created and check its contents
    const fileContent = await fs.readFile(testFilePath, 'utf-8');
    const parsedContent = JSON.parse(fileContent);
    expect(parsedContent).toEqual(routine);
  });

  it("throws an error when routine is invalid", async () => {
    const invalidRoutine = {
      name: "invalid_routine",
      // Missing required fields like description and steps
    };

    // The function should validate the routine structure
    await expect(async () => {
      await createRoutine({ 
        routine: invalidRoutine as any, 
        filename: testFilePath 
      });
    }).rejects.toThrow();
  });
})
