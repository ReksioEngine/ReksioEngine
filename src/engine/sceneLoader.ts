import {CNV} from '../fileFormats/cnv/parser'
import {Engine} from './index'
import {Integer} from './types/integer'
import {Animo} from './types/animo'
import {Music} from './types/music'
import {Timer} from './types/timer'
import {Behaviour} from './types/behaviour'
import {Image} from './types/image'
import {Mouse} from './types/mouse'
import {Keyboard} from './types/keyboard'
import {CNVLoader} from './types/cnvloader'
import {CanvasObserver} from './types/canvasObserver'
import {Condition} from './types/condition'
import {Episode} from './types/episode'
import {Application} from './types/application'
import {Scene} from './types/scene'
import {Sound} from './types/sound'
import {String as StringType} from './types/string'
import {Bool} from './types/bool'
import {Array as ArrayType} from './types/array'
import {Button} from './types/button'

const createTypeInstance = (engine: Engine, definition: any) => {
    switch (definition.TYPE) {
    case 'ANIMO':
        return new Animo(engine, definition)
    case 'APPLICATION':
        return new Application(engine, definition)
    case 'ARRAY':
        return new ArrayType(engine, definition)
    case 'BEHAVIOUR':
        return new Behaviour(engine, definition)
    case 'BOOL':
        return new Bool(engine, definition)
    case 'BUTTON':
        return new Button(engine, definition)
    case 'CANVAS_OBSERVER':
        return new CanvasObserver(engine, definition)
    case 'CNVLOADER':
        return new CNVLoader(engine, definition)
    case 'CONDITION':
        return new Condition(engine, definition)
    case 'EPISODE':
        return new Episode(engine, definition)
    case 'IMAGE':
        return new Image(engine, definition)
    case 'INTEGER':
        return new Integer(engine, definition)
    case 'KEYBOARD':
        return new Keyboard(engine, definition)
    case 'MOUSE':
        return new Mouse(engine, definition)
    case 'MUSIC':
        return new Music(engine, definition)
    case 'SCENE':
        return new Scene(engine, definition)
    case 'SOUND':
        return new Sound(engine, definition)
    case 'STRING':
        return new StringType(engine, definition)
    case 'TIMER':
        return new Timer(engine, definition)
    default:
        console.error(definition)
        throw new Error(`Unknown object type '${definition.TYPE}'`)
    }
}

export const loadScene = async (engine: Engine, sceneDefinition: CNV) => {
    const orderedScope = []

    for (const [key, value] of Object.entries(sceneDefinition)) {
        const instance = createTypeInstance(engine, value)
        engine.scope[key] = instance
        orderedScope.push(instance)
    }

    await Promise.all(orderedScope.map(entry => entry.init()))
    orderedScope.forEach(entry => {
        entry.isReady = true
        entry.ready()
    })

    console.debug('Scene loaded')
}
