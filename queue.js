
// Este archivo contiene la implementación de la clase Queue para la cola de canciones.

/**
 * Clase que representa una cola (queue) de canciones.
 */
class Queue {
    /**
     * Crea una instancia de Queue.
     */
    constructor() {
        this.items = [];
    }

    /**
     * Agrega una canción a la cola.
     * @param {Object} song - La canción a agregar a la cola.
     */
    enqueue(song) {
        this.items.push(song);
    }

    /**
     * Elimina y devuelve la primera canción de la cola.
     * @returns {Object} La primera canción de la cola.
     */
    dequeue() {
        return this.items.shift();
    }

    /**
     * Muestra todas las canciones en la cola.
     * @returns {Object[]} Un arreglo con todas las canciones en la cola.
     */
    showQueue() {
        return this.items;
    }

    /**
     * Verifica si la cola está vacía.
     * @returns {boolean} `true` si la cola está vacía, `false` en caso contrario.
     */
    isEmpty() {
        return this.items.length === 0;
    }
}

// Exportar la clase Queue
export default Queue;