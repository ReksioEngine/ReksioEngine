import { Scope, ScopeManager } from './scope'
import { Type } from './types'
import { Application } from './types/application'

describe('ScopeManager', () => {
    const makeObject = (name: string, type: string) =>
        ({ name, definition: { NAME: name, TYPE: type } }) as unknown as Type<any>

    test('newScope adds the scope to the list and returns it', () => {
        const manager = new ScopeManager()
        const scope = manager.newScope('scene')

        expect(scope.type).toBe('scene')
        expect(manager.scopes).toStrictEqual([scope])
    })

    test('removeScope removes only the given scope', () => {
        const manager = new ScopeManager()
        const root = manager.newScope('root')
        const scene = manager.newScope('scene')

        manager.removeScope(root)
        expect(manager.scopes).toStrictEqual([scene])
    })

    test('findByName searches from the newest scope', () => {
        const manager = new ScopeManager()
        const root = manager.newScope('root')
        const scene = manager.newScope('scene')
        const rootObject = makeObject('A', 'INTEGER')
        const sceneObject = makeObject('A', 'INTEGER')

        root.set('A', rootObject)
        scene.set('A', sceneObject)

        expect(manager.findByName('A')).toBe(sceneObject)
    })

    test('findByName stops at the parent scope', () => {
        const manager = new ScopeManager()
        const root = manager.newScope('root')
        const scene = manager.newScope('scene')
        const rootObject = makeObject('A', 'INTEGER')
        const sceneObject = makeObject('A', 'INTEGER')

        root.set('A', rootObject)
        scene.set('A', sceneObject)

        expect(manager.findByName('A', scene)).toBe(sceneObject)
        expect(manager.findByName('A', root)).toBe(rootObject)
    })

    test('findByName ignores an unknown parent scope', () => {
        const manager = new ScopeManager()
        const scope = manager.newScope('scene')
        const object = makeObject('A', 'INTEGER')
        scope.set('A', object)

        expect(manager.findByName('A', new Scope('detached'))).toBe(object)
    })

    test('local scopes take precedence over regular scopes', () => {
        const manager = new ScopeManager()
        const scope = manager.newScope('scene')
        const sceneObject = makeObject('THIS', 'INTEGER')
        const localObject = makeObject('THIS', 'INTEGER')

        scope.set('THIS', sceneObject)
        manager.pushLocalScope(new Scope('local', new Map([['THIS', localObject]])))

        expect(manager.findByName('THIS')).toBe(localObject)

        manager.popLocalScope()

        expect(manager.findByName('THIS')).toBe(sceneObject)
    })

    test('findByName returns null when the object is missing', () => {
        const manager = new ScopeManager()
        manager.newScope('scene')

        expect(manager.findByName('MISSING')).toBeNull()
    })

    test('findByType finds an object by its TYPE', () => {
        const manager = new ScopeManager()
        const scope = manager.newScope('scene')
        const integer = makeObject('A', 'INTEGER')

        scope.set('A', integer)

        expect(manager.findByType('INTEGER')).toBe(integer)
        expect(manager.findByType('DOUBLE')).toBeNull()
    })

    test('find uses the given callback and scope list', () => {
        const manager = new ScopeManager()
        const root = manager.newScope('root')
        const scene = manager.newScope('scene')
        const object = makeObject('B', 'INTEGER')

        root.set('A', object)
        scene.set('B', object)

        expect(manager.find((key) => key === 'A')).toBe(object)
        expect(manager.find((key) => key === 'A', [root])).toBe(object)
        expect(manager.find((key) => key === 'B', [root])).toBeNull()
    })

    test('APPLICATION returns the application object', () => {
        const manager = new ScopeManager()
        const scope = manager.newScope('root')
        const application = makeObject('APP', 'APPLICATION') as Application

        scope.set('APP', application)

        expect(manager.APPLICATION).toBe(application)
    })

    test('APPLICATION throws when there is no application', () => {
        const manager = new ScopeManager()
        manager.newScope('root')

        expect(() => manager.APPLICATION).toThrow()
    })
})

describe('Scope', () => {
    const makeObject = (name: string, type: string) =>
        ({ name, definition: { NAME: name, TYPE: type } }) as unknown as Type<any>

    test('set and get an object', () => {
        const scope = new Scope('scene')
        const object = makeObject('A', 'INTEGER')

        scope.set('A', object)

        expect(scope.get('A')).toBe(object)
    })

    test('get returns null for a missing object', () => {
        expect(new Scope('scene').get('MISSING')).toBeNull()
    })

    test('remove deletes an object', () => {
        const scope = new Scope('scene')
        scope.set('A', makeObject('A', 'INTEGER'))

        scope.remove('A')

        expect(scope.get('A')).toBeNull()
    })

    test('remove of a missing object is ignored', () => {
        const scope = new Scope('scene')

        expect(() => scope.remove('MISSING')).not.toThrow()
    })

    test('find returns the first matching object', () => {
        const scope = new Scope('scene')
        const first = makeObject('A', 'INTEGER')
        const second = makeObject('B', 'INTEGER')

        scope.set('A', first)
        scope.set('B', second)

        expect(scope.find((key) => key === 'A')).toBe(first)
        expect(scope.find((key, object) => object.definition.TYPE === 'INTEGER')).toBe(first)
        expect(scope.find((key) => key === 'MISSING')).toBeNull()
    })

    test('objects returns all values', () => {
        const scope = new Scope('scene')
        const first = makeObject('A', 'INTEGER')
        const second = makeObject('B', 'INTEGER')

        scope.set('A', first)
        scope.set('B', second)

        expect(scope.objects).toStrictEqual([first, second])
    })

    test('content can be provided up front', () => {
        const object = makeObject('THIS', 'INTEGER')
        const scope = new Scope('local', new Map([['THIS', object]]))

        expect(scope.get('THIS')).toBe(object)
    })
})
