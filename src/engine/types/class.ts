import { ParentType, Type } from './index'
import { ClassDefinition } from '../../fileFormats/cnv/types'
import { method } from '../../common/types'
import { Scope } from '../scope'
import { doReady, loadDefinition } from '../../filesystem/definitionLoader'
import { CNV } from '../../fileFormats/cnv/parser'
import { assert } from '../../common/errors'
import { TypeDefinition } from '../../fileFormats/common'
import { Engine } from '../index'
import { Behaviour } from './behaviour'

export class Class extends Type<ClassDefinition> {
    public innerDefinition: CNV | null = null
    public instances: ClassInstance[] = []

    async init() {
        this.innerDefinition = await this.engine.filesystem.getCNVFile(
            await this.engine.resolvePath(this.definition.DEF, 'common/classes')
        )
    }

    destroy() {
        this.instances.forEach(instance => instance.destroy())
    }

    async tick(elapsedMS: number) {
        for (const instance of this.instances) {
            await instance.tick(elapsedMS)
        }
    }

    @method()
    async NEW(name: string, ...args: any[]) {
        assert(this.innerDefinition !== null)

        const instance = new ClassInstance(this.engine, this, name, args)
        await instance.init()
        this.instances.push(instance)
        this.parentScope?.set(name, instance)
    }
}

export class ClassInstance extends ParentType<TypeDefinition>{
    private class: Class
    public scope: Scope = new Scope('class_instance')
    public args: any[] = []

    constructor(engine: Engine, classObject: Class, name: string, args: any[]) {
        super(engine, classObject.parent, {
            TYPE: 'CLASS_INSTANCE',
            NAME: name,
        })
        this.class = classObject
        this.args = args
    }

    async init() {
        assert(this.class.innerDefinition !== null)
        await loadDefinition(this.engine, this.scope, this.class.innerDefinition, this)
        await doReady(this.scope)
        console.log(`Initialized class instance ${this.name} of ${this.class.name}`)
    }

    destroy() {
        this.scope.objects.forEach(object => object.destroy())
    }

    async tick(elapsedMS: number) {
        for (const object of this.scope.objects.filter((object) => object.isReady)) {
            await object.tick(elapsedMS)
        }
    }

    async __call(methodName: string, args: any[]) {
        const object = this.engine.getObject(methodName, this.scope)
        if (object === null || !(object instanceof Behaviour)) {
            return
        }

        await object.RUNC(...args)
    }
}
