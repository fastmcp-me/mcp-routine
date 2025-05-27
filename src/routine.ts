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

  try {
    // Try to read existing routines
    let routines: Routine[] = []
    try {
      const content = await fs.readFile(filename, 'utf-8')
      routines = JSON.parse(content)
      
      // Validate that the loaded content is an array
      if (!Array.isArray(routines)) {
        throw new Error('Existing file content must be an array of routines')
      }
    } catch (error) {
      // If file doesn't exist or is empty, start with empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        routines = []
      } else {
        throw error
      }
    }

    // Check for duplicate routine name
    if (routines.some(r => r.name === routine.name)) {
      throw new Error(`A routine with name "${routine.name}" already exists`)
    }

    // Append the new routine and write back to file
    routines.push(routine)
    await fs.writeFile(filename, JSON.stringify(routines, null, 2))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to create routine: ${error.message}`)
    }
    throw new Error('Failed to create routine: Unknown error')
  }
}

export async function loadRoutines(filename: string): Promise<Routine[]> {
  try {
    // Read and parse the JSON file
    const fileContent = await fs.readFile(filename, 'utf-8')
    const data = JSON.parse(fileContent)

    // Ensure the data is an array
    if (!Array.isArray(data)) {
      throw new Error('File content must be an array of routines')
    }

    // Validate each routine
    for (const routine of data) {
      if (!routine.name || typeof routine.name !== 'string') {
        throw new Error('Each routine must have a valid name')
      }
      if (!routine.description || typeof routine.description !== 'string') {
        throw new Error('Each routine must have a valid description')
      }
      if (!Array.isArray(routine.steps) || routine.steps.length === 0) {
        throw new Error('Each routine must have at least one step')
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
    }

    return data as Routine[]
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load routines: ${error.message}`)
    }
    throw new Error('Failed to load routines: Unknown error')
  }
}
