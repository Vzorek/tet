export type Node = string;

export class Game {
    state: Map<Node, boolean> = new Map();
    bindings: Map<Node, Node[]> = new Map();
    private nodes: Node[]

    constructor(nodes: Node[]) {
        this.nodes = nodes;
        for (const node of nodes) {
            this.state.set(node, true);
            this.bindings.set(node, []);
        }
        console.log('nodes generated');
        this._generateEdges();
        console.log('edges generated');
        this._generateState();
        console.log('state generated');
    }

    private getRandomNode(): Node {
        return this.nodes[Math.floor(Math.random() * this.nodes.length)];
    }

    private _generateEdges(): void {
        const nodeCount = this.nodes.length;

        // Ensure every node has at least one connection
        for (const i of this.nodes) {
            let target: Node;
            do {
                target = this.getRandomNode();
            } while (target === i);

            this.addEdge(i, target);
        }

        console.log('minimal edges generated');

        // Add additional random connections
        const additionalEdgesCount = Math.max(0, Math.floor(Math.random() * (nodeCount - 1)) + 1);
        for (let i = 0; i < additionalEdgesCount; i++) {
            let source: Node, target: Node;
            do {
                source = this.getRandomNode();
                target = this.getRandomNode();
            } while (source === target);

            this.addEdge(source, target);
        }
    }

    private _toggle(node: Node): void {
        this.state.set(node, !this.state.get(node)!);
    }

    private _generateState(): void {
        const iterations = Math.max(0, Math.floor(Math.random() * 10) + 1);
        for (let i = 0; i < iterations; i++) {
            this.toggle(this.getRandomNode());
        }

        while (true) {
            for (const s of this.state.values())
                if (!s)
                    return;
            this.toggle(this.getRandomNode());
        }
    }

    addEdge(from: Node, to: Node): void {
        this.bindings.get(from)!.push(to);
        this.bindings.get(to)!.push(from);
    }

    removeEdge(from: Node, to: Node): void {
        this.bindings.set(from, this.bindings.get(from)!.filter(node => node !== to));
        this.bindings.set(to, this.bindings.get(to)!.filter(node => node !== from));
    }

    toggle(node: Node): void {
        this._toggle(node);
        for (const other of this.bindings.get(node)!) {
            this._toggle(other);
        }
    }
}
