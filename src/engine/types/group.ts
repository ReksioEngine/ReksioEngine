import { Type } from './index'
import { GroupDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'

export class Group extends Type<GroupDefinition> {
    private objects: any[] = []

    async ready() {
        await this.callbacks.run('ONINIT')
    }

    @method()
    ADD(...objectsNames: string[]) {
        objectsNames.forEach((objectName) => {
            const object = this.engine.getObject(objectName)
            if (object === null) {
                console.warn(`Script was trying to add non-existing object "${objectName}" to a group "${this.name}"`)
            } else {
                this.objects.push(object)
            }
        })
    }

    @method()
    REMOVE(...objectsNames: string[]) {
        this.objects = this.objects.filter((object) => !objectsNames.includes(object.name))
    }

    async __call(methodName: string, args: any[]) {
        for (const object of this.objects) {
            if (methodName in object) {
                await object[methodName](...args)
            } else {
                const argumentsString = args?.map((arg) => typeof arg).join(', ')
                throw new Error(
                    `Method '${methodName}(${argumentsString ?? ''})' does not exist in ${object.constructor.name}`
                )
            }
        }
    }
}
