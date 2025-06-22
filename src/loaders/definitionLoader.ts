import { CNV, CNVObject } from '../fileFormats/cnv/parser'
import { Engine } from '../engine'
import { Integer } from '../engine/types/integer'
import { Animo } from '../engine/types/animo'
import { Music } from '../engine/types/music'
import { Timer } from '../engine/types/timer'
import { Behaviour } from '../engine/types/behaviour'
import { Image } from '../engine/types/image'
import { Mouse } from '../engine/types/mouse'
import { Keyboard } from '../engine/types/keyboard'
import { CNVLoader } from '../engine/types/cnvloader'
import { CanvasObserver } from '../engine/types/canvasObserver'
import { Condition } from '../engine/types/condition'
import { Episode } from '../engine/types/episode'
import { Application } from '../engine/types/application'
import { Scene } from '../engine/types/scene'
import { Sound } from '../engine/types/sound'
import { String as StringType } from '../engine/types/string'
import { Bool } from '../engine/types/bool'
import { ArrayObject } from '../engine/types/array'
import { Button } from '../engine/types/button'
import { Sequence } from '../engine/types/sequence'
import { Group } from '../engine/types/group'
import { Text } from '../engine/types/text'
import { DisplayType, Type } from '../engine/types'
import { Font } from '../engine/types/font'
import { ComplexCondition } from '../engine/types/complexCondition'
import { Rand } from '../engine/types/rand'
import { Double } from '../engine/types/double'
import { Expression } from '../engine/types/expression'
import { Vector } from '../engine/types/vector'
import { StaticFilter } from '../engine/types/staticFilter'
import { Filter } from '../engine/types/filter'
import { MultiArray } from '../engine/types/multiArray'
import { System } from '../engine/types/system'
import { Scope } from '../engine/scope'
import { StackFrame, stackTrace } from '../interpreter/script/stacktrace'

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
        case 'SYSTEM':
            return new System(engine, parent, definition)
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

const sortByPriority = (entries: Type<any>[]) => {
    return entries.sort((a: Type<any>, b: Type<any>) => {
        const aPriority = a.name === '__INIT__' ? 99999 : (initializationPriorities.get(a.definition.TYPE) ?? 9999)
        const bPriority = b.name === '__INIT__' ? 99999 : (initializationPriorities.get(b.definition.TYPE) ?? 9999)
        return aPriority - bPriority
    })
}

export const loadDefinition = async (engine: Engine, scope: Scope, definition: CNV, parent: Type<any> | null) => {
    const entries = []
    for (const [key, value] of Object.entries(definition)) {
        const instance = createTypeInstance(engine, parent, value)
        scope.set(key, instance)
        entries.push(instance)

        if (instance instanceof DisplayType) {
            engine.rendering.displayObjectsInDefinitionOrder.push(instance)
        }
    }

    const orderedScope = sortByPriority(entries)
    const promisesResults = await Promise.allSettled(
        orderedScope.map((entry) => {
            try {
                stackTrace.push(StackFrame.builder().type('stage').object(entry).method('init').build())
                return entry.init()
            } finally {
                stackTrace.pop()
            }
        })
    )
    const failedObjects: Type<any>[] = []
    for (let i = 0; i < promisesResults.length; i++) {
        const result = promisesResults[i]
        const object = orderedScope[i]

        if (result.status === 'rejected') {
            scope.remove(object.name)
            failedObjects.push(object)

            console.error(`Failed to initialize object ${object.name}`, result.reason)
        }
    }

    const goodObjects = orderedScope.filter((entry) => !failedObjects.includes(entry))
    goodObjects.forEach((entry) => {
        try {
            stackTrace.push(StackFrame.builder().type('stage').object(entry).method('applyDefaults').build())
            entry.applyDefaults()
        } finally {
            stackTrace.pop()
        }
    })
}

export const doReady = (scope: Scope) => {
    sortByPriority(scope.objects).forEach((entry) => {
        entry.isReady = true

        try {
            stackTrace.push(StackFrame.builder().type('stage').object(entry).method('ready').build())
            entry.ready()
        } finally {
            stackTrace.pop()
        }
    })
}

export const createObject = async (engine: Engine, definition: CNVObject, parent: Type<any> | null) => {
    engine.app.ticker.stop()

    const instance = createTypeInstance(engine, parent, definition)
    engine.scopeManager.getScope('scene')?.set(definition.NAME, instance)

    if (instance instanceof DisplayType) {
        engine.rendering.displayObjectsInDefinitionOrder.push(instance)
    }

    await instance.init()
    instance.applyDefaults()
    instance.isReady = true
    instance.ready()
    engine.app.ticker.start()

    return instance
}
