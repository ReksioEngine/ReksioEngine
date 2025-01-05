import { CNV, CNVObject } from '../fileFormats/cnv/parser'
import { Engine } from './index'
import { Integer } from './types/integer'
import { Animo } from './types/animo'
import { Music } from './types/music'
import { Timer } from './types/timer'
import { Behaviour } from './types/behaviour'
import { Image } from './types/image'
import { Mouse } from './types/mouse'
import { Keyboard } from './types/keyboard'
import { CNVLoader } from './types/cnvloader'
import { CanvasObserver } from './types/canvasObserver'
import { Condition } from './types/condition'
import { Episode } from './types/episode'
import { Application } from './types/application'
import { Scene } from './types/scene'
import { Sound } from './types/sound'
import { String as StringType } from './types/string'
import { Bool } from './types/bool'
import { ArrayObject } from './types/array'
import { Button } from './types/button'
import { Sequence } from './types/sequence'
import { Group } from './types/group'
import { Text } from './types/text'
import { DisplayType, Type } from './types'
import { Font } from './types/font'
import { ComplexCondition } from './types/complexCondition'
import { Rand } from './types/rand'
import { Double } from './types/double'
import { Expression } from './types/expression'
import { Vector } from './types/vector'
import { StaticFilter } from './types/staticFilter'
import { Filter } from './types/filter'
import { MultiArray } from './types/multiArray'

const createTypeInstance = (engine: Engine, parent: Type<any> | null, definition: any) => {
    switch (definition.TYPE) {
        case 'ANIMO':
            return new Animo(engine, parent, definition)
        case 'APPLICATION':
            return new Application(engine, parent, definition)
        case 'ARRAY':
            return new ArrayObject(engine, parent, definition)
        case 'BEHAVIOUR':
            return new Behaviour(engine, parent, definition)
        case 'BOOL':
            return new Bool(engine, parent, definition)
        case 'BUTTON':
            return new Button(engine, parent, definition)
        case 'CANVAS_OBSERVER':
            return new CanvasObserver(engine, parent, definition)
        case 'CANVASOBSERVER':
            return new CanvasObserver(engine, parent, definition)
        case 'CNVLOADER':
            return new CNVLoader(engine, parent, definition)
        case 'CONDITION':
            return new Condition(engine, parent, definition)
        case 'COMPLEXCONDITION':
            return new ComplexCondition(engine, parent, definition)
        case 'DOUBLE':
            return new Double(engine, parent, definition)
        case 'EPISODE':
            return new Episode(engine, parent, definition)
        case 'EXPRESSION':
            return new Expression(engine, parent, definition)
        case 'FILTER':
            return new Filter(engine, parent, definition)
        case 'FONT':
            return new Font(engine, parent, definition)
        case 'GROUP':
            return new Group(engine, parent, definition)
        case 'IMAGE':
            return new Image(engine, parent, definition)
        case 'INTEGER':
            return new Integer(engine, parent, definition)
        case 'KEYBOARD':
            return new Keyboard(engine, parent, definition)
        case 'MOUSE':
            return new Mouse(engine, parent, definition)
        case 'MULTIARRAY':
            return new MultiArray(engine, parent, definition)
        case 'MUSIC':
            return new Music(engine, parent, definition)
        case 'RAND':
            return new Rand(engine, parent, definition)
        case 'SCENE':
            return new Scene(engine, parent, definition)
        case 'SEQUENCE':
            return new Sequence(engine, parent, definition)
        case 'SOUND':
            return new Sound(engine, parent, definition)
        case 'STATICFILTER':
            return new StaticFilter(engine, parent, definition)
        case 'STRING':
            return new StringType(engine, parent, definition)
        case 'TEXT':
            return new Text(engine, parent, definition)
        case 'TIMER':
            return new Timer(engine, parent, definition)
        case 'VECTOR':
            return new Vector(engine, parent, definition)
        default:
            console.error(definition)
            throw new Error(`Unknown object type '${definition.TYPE}'`)
    }
}

const initializationPriorities = [
    ['BEHAVIOUR'],
    ['INTEGER', 'STRING', 'BOOL', 'DOUBLE'],
    ['ARRAY', 'CONDITION'],
    ['ANIMO', 'IMAGE', 'SOUND', 'VECTOR'],
    ['TIMER', 'SEQUENCE', 'GROUP', 'BUTTON'],
].reduce((acc: Map<string, number>, currentValue, currentIndex) => {
    currentValue.forEach((entry) => acc.set(entry, currentIndex))
    return acc
}, new Map())

export const loadDefinition = async (
    engine: Engine,
    scope: Record<string, any>,
    definition: CNV,
    parent: Type<any> | null
) => {
    engine.app.ticker.stop()

    const entries = []
    for (const [key, value] of Object.entries(definition)) {
        const instance = createTypeInstance(engine, parent, value)
        scope[key] = instance

        entries.push(instance)

        if (instance instanceof DisplayType) {
            engine.displayObjectsInDefinitionOrder.push(instance)
        }
    }

    const orderedScope = entries.sort((a: Type<any>, b: Type<any>) => {
        const aPriority = a.name === '__INIT__' ? 99999 : (initializationPriorities.get(a.definition.TYPE) ?? 9999)
        const bPriority = b.name === '__INIT__' ? 99999 : (initializationPriorities.get(b.definition.TYPE) ?? 9999)
        return aPriority - bPriority
    })

    const promisesResults = await Promise.allSettled(orderedScope.map((entry) => entry.init()))
    const failedObjects: Type<any>[] = []
    for (let i = 0; i < promisesResults.length; i++) {
        const result = promisesResults[i]
        const object = orderedScope[i]

        if (result.status === 'rejected') {
            delete scope[object.name]
            failedObjects.push(object)

            console.error(`Failed to initialize object ${object.name}`, result.reason)
        }
    }

    orderedScope.filter((entry) => !failedObjects.includes(entry)).forEach((entry) => {
        entry.isReady = true
        entry.ready()
    })

    engine.app.ticker.start()
}

export const createObject = async (engine: Engine, definition: CNVObject, parent: Type<any> | null) => {
    engine.app.ticker.stop()

    const instance = createTypeInstance(engine, parent, definition)
    engine.scope[definition.NAME] = instance

    if (instance instanceof DisplayType) {
        engine.displayObjectsInDefinitionOrder.push(instance)
    }

    await instance.init()
    instance.isReady = true
    instance.ready()
    engine.app.ticker.start()

    return instance
}
