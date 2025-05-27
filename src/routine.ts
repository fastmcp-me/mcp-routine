import { promises as fs } from 'fs'

type ToolStep = {
  description: string
  tool: string
  params: unknown
}

export type Routine = {
  name: string
  description: string
  steps: ToolStep[]
}

export async function createRoutine(args: { routine: Routine, filename: string }) {
  const { routine, filename } = args

  // Validate routine structure
  if (!routine.name || typeof routine.name !== 'string') {
    throw new Error('Routine must have a valid name')
  }
  if (!routine.description || typeof routine.description !== 'string') {
    throw new Error('Routine must have a valid description')
  }
  if (!Array.isArray(routine.steps) || routine.steps.length === 0) {
    throw new Error('Routine must have at least one step')
  }

  // Validate each step
  for (const step of routine.steps) {
    if (!step.description || typeof step.description !== 'string') {
      throw new Error('Each step must have a valid description')
    }
    if (!step.tool || typeof step.tool !== 'string') {
      throw new Error('Each step must have a valid tool name')
    }
    if (!step.params || typeof step.params !== 'object') {
      throw new Error('Each step must have valid parameters')
    }
  }

  // Write the routine to file
  await fs.writeFile(filename, JSON.stringify(routine, null, 2))
}
