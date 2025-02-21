
// Este archivo contiene la implementación de la clase Queue para la cola de canciones.

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(song) {
        this.items.push(song);
    }

    dequeue() {
        return this.items.shift();
    }

    showQueue() {
        return this.items;
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

export default Queue;
