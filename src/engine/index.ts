import {getCNVFile} from '../filesLoader'
import {getByType} from '../fileFormats/cnv'
import {Application, callback, Episode, Scene} from '../fileFormats/cnv/types'
import {CNV} from '../fileFormats/cnv/parser'
import {pathJoin} from '../utils'
import {runScript} from '../interpreter/evaluator'
import {INTEGER} from './types/integer'
import {Type} from './types'

export class Engine {
    private application: Application | undefined

    private episodes = new Map<string, any>()
    private currentEpisode: Episode | undefined

    private scenes = new Map<string, any>()
    private currentScene: Scene | undefined

    private sceneDefinition: CNV | undefined

    private scope: Record<string, any> = {
        'X': {
            PRINT: (arg: any) => console.log(arg)
        },
        'TEST': new INTEGER(this, {
            VALUE: 1,
            TOINI: false,
            ONCHANGED: {
                2: {
                    code: 'X^PRINT("1234");'
                }
            }
        })
    }

    async init() {
        const applicationDef = await getCNVFile('DANE/Application.def')

        // Load application definition
        const applications = getByType<Application[]>(applicationDef, 'APPLICATION')
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
        console.log(this.sceneDefinition)
    }

    executeScript(code: string) {
        runScript(null, this.scope, code)
    }

    executeCallback(caller: Type | null, callback: callback) {
        if (callback.code) {
            runScript(caller, this.scope, callback.code)
        } else if (callback.behaviourReference) {
            this.scope[callback.behaviourReference].eval({
                ...this.scope,
                THIS: caller
            })
        }
    }
}
