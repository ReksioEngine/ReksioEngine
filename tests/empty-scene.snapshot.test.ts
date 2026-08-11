import { createTestPlayer } from './engine/testEngine'

describe('createTestPlayer', () => {
    test('load and run empty scene', async () => {
        const testPlayer = await createTestPlayer('empty-scene')
        await testPlayer.start()
        expect(testPlayer.currentScene).toBe('TESTSCENE')
    })
})