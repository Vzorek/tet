import { QuickJSContext, QuickJSHandle, VmFunctionImplementation } from 'quickjs-emscripten';

abstract class BaseBuilder {
    constructor(readonly vm: QuickJSContext, readonly handle: QuickJSHandle) { }

    dispose(): void {
        this.handle.dispose();
    }

    [Symbol.dispose]() {
        this.dispose();
    }
}

class UndefinedBuilder extends BaseBuilder {
    constructor(vm: QuickJSContext) {
        super(vm, vm.undefined);
    }
}

class NullBuilder extends BaseBuilder {
    constructor(vm: QuickJSContext) {
        super(vm, vm.null);
    }
}

class NumberBuilder extends BaseBuilder {
    constructor(vm: QuickJSContext, initialValue: number = 0) {
        super(vm, vm.newNumber(initialValue));
    }
}

class StringBuilder extends BaseBuilder {
    constructor(vm: QuickJSContext, initialValue: string = '') {
        super(vm, vm.newString(initialValue));
    }
}

type FunctionBuilderData = VmFunctionImplementation<QuickJSHandle>;

class FunctionBuilder extends BaseBuilder {
    readonly callable: VmFunctionImplementation<QuickJSHandle>;

    static fromJS(vm: QuickJSContext, fn: CallableFunction): VmFunctionImplementation<QuickJSHandle> {
        return (...args: QuickJSHandle[]) => {
            const nativeArgs = args.map(vm.dump);
            const nativeResult = fn(...nativeArgs);
            return PropertyBuilder.fromJS(vm, nativeResult).handle;
        };

    }

    constructor(vm: QuickJSContext, name: string, data: FunctionBuilderData) {
        const callable = FunctionBuilder.fromJS(vm, data);
        super(vm, vm.newFunction(name, callable));
        this.callable = callable;
    }
}

type ObjectBuilderData = Map<string, BaseBuilder> | QuickJSHandle;

class ObjectBuilder extends BaseBuilder {
    private _children: Map<string, BaseBuilder> = new Map();

    get children() { return this._children; }

    static fromJS(vm: QuickJSContext, obj: object): ObjectBuilder {
        const builder = new ObjectBuilder(vm);
        for (const [key, value] of Object.entries(obj)) {
            builder.add(key, PropertyBuilder.fromJS(vm, value));
        }
        return builder;
    }

    constructor(vm: QuickJSContext, data?: ObjectBuilderData) {
        if (!data || data instanceof Map)
            super(vm, vm.newObject());
        else
            super(vm, vm.newObject(data));
        if (data instanceof Map)
            data.forEach((value, key) => this.add(key, value));
    }

    add(key: string, child: BaseBuilder): this {
        this.children.set(key, child);
        this.vm.setProp(this.handle, key, child.handle);
        return this;
    }

    number(name: string, value?: number): this {
        return this.add(name, new NumberBuilder(this.vm, value));
    }

    string(name: string, value?: string): this {
        return this.add(name, new StringBuilder(this.vm, value));
    }

    function(name: string, callable: VmFunctionImplementation<QuickJSHandle>): this {
        return this.add(name, new FunctionBuilder(this.vm, name, callable));
    }

    object(name: string, data?: ObjectBuilderData): ObjectBuilder {
        const builder = new ObjectBuilder(this.vm, data);
        this.add(name, builder);
        return builder;
    }

    array(name: string, data?: BaseBuilder[]): ArrayBuilder {
        const builder = new ArrayBuilder(this.vm, data);
        this.add(name, builder);
        return builder;
    }

    override dispose(): void {
        for (const child of this.children.values()) {
            child.dispose();
        }
        super.dispose();
    }
}

class ArrayBuilder extends BaseBuilder {
    private _children: BaseBuilder[] = [];

    get children() { return this._children; }

    static fromJS(vm: QuickJSContext, arr: unknown[]): ArrayBuilder {
        const builder = new ArrayBuilder(vm);
        for (const value of arr) {
            builder.push(PropertyBuilder.fromJS(vm, value));
        }
        return builder;
    }

    constructor(vm: QuickJSContext, data: BaseBuilder[] = []) {
        super(vm, vm.newArray());
        data.forEach(child => this.push(child));
    }

    push(child: BaseBuilder): this {
        this.children.push(child);
        this.vm.setProp(this.handle, this.children.length - 1, child.handle);
        return this;
    }

    number(value: number = 0): this {
        return this.push(new NumberBuilder(this.vm, value));
    }

    string(value: string = ''): this {
        return this.push(new StringBuilder(this.vm, value));
    }

    function(name: string, callable: VmFunctionImplementation<QuickJSHandle>): this {
        return this.push(new FunctionBuilder(this.vm, name, callable));
    }

    object(data?: ObjectBuilderData): ObjectBuilder {
        const builder = new ObjectBuilder(this.vm, data);
        this.push(builder);
        return builder;
    }

    array(data?: BaseBuilder[]): ArrayBuilder {
        const builder = new ArrayBuilder(this.vm, data);
        this.push(builder);
        return builder;
    }

    override dispose(): void {
        for (const child of this.children.values()) {
            child.dispose();
        }
        super.dispose();
    }
}

export class PropertyBuilder {
    private _children: Map<string, BaseBuilder>;

    get children() { return this._children; }

    static fromJS(vm: QuickJSContext, orig: unknown): BaseBuilder {
        switch (typeof orig) {
        case 'number':
            return new NumberBuilder(vm, orig);
        case 'string':
            return new StringBuilder(vm, orig);
        case 'object':
            if (orig === null) {
                return new NullBuilder(vm);
            }
            if (Array.isArray(orig)) {
                const arr = new ArrayBuilder(vm);
                for (const value of orig) {
                    arr.push(value);
                }
            }
            const obj = new ObjectBuilder(vm);
            for (const [key, value] of Object.entries(obj)) {
                obj.add(key, vm.dump(value));
            }
            return obj;
        default:
            return new UndefinedBuilder(vm);
        }

    }

    constructor(private readonly vm: QuickJSContext) {
        this._children = new Map();
    }

    add(key: string, child: BaseBuilder): this {
        this.children.set(key, child);
        return this;
    }

    number(name: string, value?: number): this {
        return this.add(name, new NumberBuilder(this.vm, value));
    }

    string(name: string, value?: string): this {
        return this.add(name, new StringBuilder(this.vm, value));
    }

    function(name: string, callable: VmFunctionImplementation<QuickJSHandle>): this {
        return this.add(name, new FunctionBuilder(this.vm, name, callable));
    }

    object(name: string, data?: ObjectBuilderData): ObjectBuilder {
        const builder = new ObjectBuilder(this.vm, data);
        this.add(name, builder);
        return builder;
    }

    array(name: string, data?: BaseBuilder[]): ArrayBuilder {
        const builder = new ArrayBuilder(this.vm, data);
        this.add(name, builder);
        return builder;
    }

    apply(parent?: QuickJSHandle): this {
        for (const [key, child] of this.children.entries()) {
            this.vm.setProp(parent || this.vm.global, key, child.handle);
        }
        return this;
    }

    dispose(): void {
        for (const child of this.children.values()) {
            child.dispose();
        }
    }

    [Symbol.dispose]() {
        this.dispose();
    }
}
