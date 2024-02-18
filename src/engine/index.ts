import {getCNVFile} from '../filesLoader'
import {getByType} from '../fileFormats/cnv'
import {ApplicationDefinition, callback, EpisodeDefinition, SceneDefinition} from '../fileFormats/cnv/types'
import {CNV} from '../fileFormats/cnv/parser'
import {pathJoin} from '../utils'
import {runScript} from '../interpreter/evaluator'
import {Type} from './types'
import {generateScope} from './sceneLoader'
import {Application} from 'pixi.js'

export class Engine {
    readonly app: Application

    private application: ApplicationDefinition | undefined

    private episodes = new Map<string, any>()
    private currentEpisode: EpisodeDefinition | undefined

    private scenes = new Map<string, any>()
    private currentScene: SceneDefinition | undefined

    private sceneDefinition: CNV | undefined

    scope: Record<string, any> = {}

    constructor(app: Application) {
        this.app = app
    }

    async init() {
        const applicationDef = await getCNVFile('DANE/Application.def')

        // Load application definition
        const applications = getByType<ApplicationDefinition[]>(applicationDef, 'APPLICATION')
        if (applications.length == 0) {
            throw new Error('Could not find application')
        }
        this.application = applications[0]

        // Load episodes
        this.application.EPISODES.forEach((episodeName: string) => {
            this.episodes.set(episodeName, applicationDef[episodeName])
        })

        // Find initial episode
        this.currentEpisode = this.episodes.get(this.application.STARTWITH)
        if (this.currentEpisode == null) {
            throw new Error('Could not find initial episode')
        }

        // Load scenes declarations
        this.currentEpisode.SCENES.forEach((sceneName: string) => {
            this.scenes.set(sceneName, applicationDef[sceneName])
        })

        // Find initial scene
        this.currentScene = this.scenes.get(this.currentEpisode.STARTWITH)
        if (this.currentScene == null) {
            throw new Error('Could not find initial scene')
        }

        // Load initial scene definition
        this.sceneDefinition = await getCNVFile(pathJoin('DANE', this.currentScene.PATH, this.currentEpisode.STARTWITH.toLowerCase() + '.cnv'))
        this.scope = generateScope(this, this.sceneDefinition)
        console.log(this.sceneDefinition)
        console.log(this.scope)
    }

    executeScript(code: string) {
        runScript(null, this.scope, code)
    }

    executeCallback(caller: Type<any> | null, callback: callback) {
        this.scope.THIS = caller

        if (callback.code) {
            runScript(caller, this.scope, callback.code)
        } else if (callback.behaviourReference) {
            this.scope[callback.behaviourReference].RUN()
        }
    }
}
