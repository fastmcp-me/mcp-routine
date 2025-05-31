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

function validateRoutine(routine: Routine, context: 'write' | 'read' = 'write') {
  const prefix = context === 'write' ? 'Routine' : 'Each routine'
  
  // Validate routine structure
  if (!routine.name || typeof routine.name !== 'string') {
    throw new Error(`${prefix} must have a valid name`)
  }
  if (!routine.description || typeof routine.description !== 'string') {
    throw new Error(`${prefix} must have a valid description`)
  }
  if (!Array.isArray(routine.steps) || routine.steps.length === 0) {
    throw new Error(`${prefix} must have at least one step`)
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

async function findRoutineIndex(name: string, routines: Routine[]): Promise<number> {
  const index = routines.findIndex(r => r.name === name)
  if (index === -1) {
    throw new Error(`No routine found with name "${name}"`)
  }
  return index
}

export async function createRoutine(args: { routine: Routine, filename: string }) {
  const { routine, filename } = args

  // Validate routine
  validateRoutine(routine, 'write')

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
    try {
      // Read and parse the JSON file
      const fileContent = await fs.readFile(filename, 'utf-8')
      const data = JSON.parse(fileContent)

      // Ensure the data is an array
      if (!Array.isArray(data)) {
        throw new Error('File content must be an array of routines')
      }

      // Type check each routine before validation
      for (const item of data) {
        if (typeof item !== 'object' || item === null) {
          throw new Error('Each item in the array must be an object')
        }
      }

      // Now validate each routine's structure
      for (const routine of data) {
        validateRoutine(routine, 'read')
      }

      return data as Routine[]
    } catch (error) {
      // If file doesn't exist, return empty array
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []
      }
      throw error
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load routines: ${error.message}`)
    }
    throw new Error('Failed to load routines: Unknown error')
  }
}

export async function deleteRoutine(args: { name: string, filename: string }): Promise<void> {
  const { name, filename } = args

  try {
    // Load existing routines
    let routines = await loadRoutines(filename)

    // Find and remove the routine
    const routineIndex = await findRoutineIndex(name, routines)
    routines.splice(routineIndex, 1)

    // Write back to file
    await fs.writeFile(filename, JSON.stringify(routines, null, 2))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to delete routine: ${error.message}`)
    }
    throw new Error('Failed to delete routine: Unknown error')
  }
}

export async function updateRoutine(args: { routine: Routine, filename: string }): Promise<void> {
  const { routine, filename } = args

  // Validate routine
  validateRoutine(routine, 'write')

  try {
    // Load existing routines
    let routines = await loadRoutines(filename)

    // Find and update the routine
    const routineIndex = await findRoutineIndex(routine.name, routines)
    routines[routineIndex] = routine

    // Write back to file
    await fs.writeFile(filename, JSON.stringify(routines, null, 2))
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to update routine: ${error.message}`)
    }
    throw new Error('Failed to update routine: Unknown error')
  }
}
