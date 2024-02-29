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

const createTypeInstance = (engine: Engine, definition: any) => {
    switch (definition.TYPE) {
    case 'ANIMO':
        return new Animo(engine, definition)
    case 'APPLICATION':
        return new Application(engine, definition)
    case 'BEHAVIOUR':
        return new Behaviour(engine, definition)
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
    case 'TIMER':
        return new Timer(engine, definition)
    default:
        throw new Error(`Unknown object type '${definition.TYPE}'`)
    }
}

export const loadScene = (engine: Engine, sceneDefinition: CNV) => {
    const orderedScope = []

    for (const [key, value] of Object.entries(sceneDefinition)) {
        engine.scope[key] = createTypeInstance(engine, value)
        orderedScope.push(engine.scope[key])
    }

    for (const entry of orderedScope) {
        entry.init()
    }
}
