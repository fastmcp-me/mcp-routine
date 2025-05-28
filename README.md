# Routine

🌅🍳☕️📰🚗💼 Routine is an MCP server that lets you create custom tools on the fly. It stitches actions executed by multiple MCP tools into a reusable routine.

### Installation

Copy the following into your MCP client's JSON file

```javascript
{
  "mcpServers": {
    "myRoutines": {
      "command": "npx",
      "args": ["-y", "mcp-routine"],
      "env": {
        "ROUTINE_FILENAME": "/path/to/your/routines.json"
      }
    }
  }
}
```

### Example

```
**User**: "add an Onboarding page to the Getting started page

**AI**: I'll help you add an "Onboarding" page to the Getting Started page. First, I'll need to find the Getting Started page ID.

Let me search for it:
Great, I found the Getting Started page. Now I'll create a new "Onboarding" page under it:

I've successfully created a new page titled "Onboarding" under the Getting Started page. The page has been created with a basic title, and you can now access it at the URL provided in the response. Would you like me to add any specific content to this new Onboarding page?

**User**:Yes, add some placeholder information for a standard onboarding experience

**AI**: I'll add some structured placeholder content to the Onboarding page to outline a standard onboarding experience.

**User**: now convert all these steps into a route to insert a page into a parent page

**AI**: I'll create a routine that captures the steps we just performed to insert a page into a parent page with structured content. This will make it reusable for future similar tasks.

I've created a routine called insert_structured_page that captures the workflow we used. The routine has three main steps:
1. Search for the parent page using its title to get the page ID
2. Create a new page under the found parent page
3. Add structured content to the new page with sections and bullet points

The routine is parameterized so you can customize:
- parent_page_title: The title of the parent page to search for
- new_page_title: The title for the new page
- welcome_message: Introduction text for the page
- section1_title: Title for the first section (can add more sections as needed)
- bullet_point1, bullet_point2, bullet_point3: Bullet points under sections
- help_message: The help/support message at the bottom

To use this routine, you would just need to provide these parameters with your desired content, and it will create a structured page with consistent formatting.
```

### Development

Build

```
npm run build
```

Execute

```
npx -y --prefix /path/to/local/mcp-routine routine
```

Publish

```
npm publish --access public
```