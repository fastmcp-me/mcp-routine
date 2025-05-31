import { promises as fs } from 'fs'
import { createRoutine, loadRoutines, deleteRoutine, Routine } from '../src/routines'

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn()
  }
}))

describe('Routine functions', () => {
  const mockRoutine: Routine = {
    name: 'Test Routine',
    description: 'A test routine',
    steps: [
      {
        description: 'Test step',
        tool: 'test-tool',
        params: { param1: 'value1' }
      }
    ]
  }

  const testFilename = 'test-routines.json'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createRoutine', () => {
    it('should successfully create a routine when file is empty', async () => {
      // Mock file not found error
      (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' })

      await createRoutine({ routine: mockRoutine, filename: testFilename })

      expect(fs.writeFile).toHaveBeenCalledWith(
        testFilename,
        JSON.stringify([mockRoutine], null, 2)
      )
    })

    it('should append routine to existing routines', async () => {
      const existingRoutines: Routine[] = [{
        name: 'Existing Routine',
        description: 'An existing routine',
        steps: [{ description: 'Step 1', tool: 'tool-1', params: {} }]
      }]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingRoutines))

      await createRoutine({ routine: mockRoutine, filename: testFilename })

      expect(fs.writeFile).toHaveBeenCalledWith(
        testFilename,
        JSON.stringify([...existingRoutines, mockRoutine], null, 2)
      )
    })

    it('should throw error if routine name already exists', async () => {
      const existingRoutines: Routine[] = [{ ...mockRoutine }]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingRoutines))

      await expect(
        createRoutine({ routine: mockRoutine, filename: testFilename })
      ).rejects.toThrow('A routine with name "Test Routine" already exists')
    })

    it('should throw error if file content is not an array', async () => {
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({}))

      await expect(
        createRoutine({ routine: mockRoutine, filename: testFilename })
      ).rejects.toThrow('Existing file content must be an array of routines')
    })

    it('should throw error if file read fails with unexpected error', async () => {
      ;(fs.readFile as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      await expect(
        createRoutine({ routine: mockRoutine, filename: testFilename })
      ).rejects.toThrow('Failed to create routine: Permission denied')
    })

    it('should throw error if routine name is missing', async () => {
      const invalidRoutine = { ...mockRoutine, name: '' }
      await expect(
        createRoutine({ routine: invalidRoutine, filename: testFilename })
      ).rejects.toThrow('Routine must have a valid name')
    })

    it('should throw error if routine description is missing', async () => {
      const invalidRoutine = { ...mockRoutine, description: '' }
      await expect(
        createRoutine({ routine: invalidRoutine, filename: testFilename })
      ).rejects.toThrow('Routine must have a valid description')
    })

    it('should throw error if steps array is empty', async () => {
      const invalidRoutine = { ...mockRoutine, steps: [] }
      await expect(
        createRoutine({ routine: invalidRoutine, filename: testFilename })
      ).rejects.toThrow('Routine must have at least one step')
    })

    it('should throw error if step is invalid', async () => {
      const invalidRoutine = {
        ...mockRoutine,
        steps: [{ description: '', tool: 'test-tool', params: {} }]
      }
      await expect(
        createRoutine({ routine: invalidRoutine, filename: testFilename })
      ).rejects.toThrow('Each step must have a valid description')
    })
  })

  describe('loadRoutines', () => {
    it('should successfully load routines', async () => {
      const mockData = [mockRoutine]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData))

      const result = await loadRoutines(testFilename)
      expect(result).toEqual(mockData)
      expect(fs.readFile).toHaveBeenCalledWith(testFilename, 'utf-8')
    })

    it('should return empty array when file does not exist', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' })

      const result = await loadRoutines(testFilename)
      expect(result).toEqual([])
      expect(fs.readFile).toHaveBeenCalledWith(testFilename, 'utf-8')
    })

    it('should throw error if file content is not an array', async () => {
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify({}))

      await expect(loadRoutines(testFilename)).rejects.toThrow(
        'File content must be an array of routines'
      )
    })

    it('should throw error if routine in file is invalid', async () => {
      const mockData = [{ ...mockRoutine, name: '' }]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData))

      await expect(loadRoutines(testFilename)).rejects.toThrow(
        'Each routine must have a valid name'
      )
    })

    it('should throw error if file content is not valid JSON', async () => {
      ;(fs.readFile as jest.Mock).mockResolvedValue('invalid json')

      await expect(loadRoutines(testFilename)).rejects.toThrow(
        'Failed to load routines: Unexpected token'
      )
    })

    it('should throw error if file read fails', async () => {
      ;(fs.readFile as jest.Mock).mockRejectedValue(new Error('File not found'))

      await expect(loadRoutines(testFilename)).rejects.toThrow(
        'Failed to load routines: File not found'
      )
    })
  })

  describe('deleteRoutine', () => {
    it('should successfully delete a routine', async () => {
      const existingRoutines = [mockRoutine, {
        name: 'Another Routine',
        description: 'Another test routine',
        steps: [{ description: 'Step 1', tool: 'tool-1', params: {} }]
      }]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingRoutines))

      await deleteRoutine({ name: mockRoutine.name, filename: testFilename })

      expect(fs.writeFile).toHaveBeenCalledWith(
        testFilename,
        JSON.stringify([existingRoutines[1]], null, 2)
      )
    })

    it('should throw error if routine does not exist', async () => {
      const existingRoutines = [mockRoutine]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingRoutines))

      await expect(
        deleteRoutine({ name: 'Non-existent Routine', filename: testFilename })
      ).rejects.toThrow('Failed to delete routine: No routine found with name "Non-existent Routine"')
    })

    it('should throw error if file read fails', async () => {
      ;(fs.readFile as jest.Mock).mockRejectedValue(new Error('Permission denied'))

      await expect(
        deleteRoutine({ name: mockRoutine.name, filename: testFilename })
      ).rejects.toThrow('Failed to delete routine: Failed to load routines: Permission denied')
    })

    it('should throw error if file write fails', async () => {
      const existingRoutines = [mockRoutine]
      ;(fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingRoutines))
      ;(fs.writeFile as jest.Mock).mockRejectedValue(new Error('Write permission denied'))

      await expect(
        deleteRoutine({ name: mockRoutine.name, filename: testFilename })
      ).rejects.toThrow('Failed to delete routine: Write permission denied')
    })
  })
})
