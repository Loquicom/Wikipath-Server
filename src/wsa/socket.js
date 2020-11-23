// Socket class
class Socket {

    // Private field
    #server;
    #ws;
    #action;

    constructor(server, ws, action = null) {
        this.#server = server;
        this.#ws = ws;
        this.#action = action;
    }

    respond(data = {}) {
        if (this.#action === null) {
            return false;
        }
        this.send(this.#action, data);
    }

    send(action, data = {}) {
        this.#ws.send(JSON.stringify({action: action, data: data}));
    }

    broadcast(action, data) {
        this.#server.broadcast(action, data);
    }

    broadcastOther(action, data) {
        this.#server.broadcast(action, data, this.#ws);
    }

    close(callback = null) {
        // Close connection
        this.#ws.close();
        // Callback
        if (typeof callback === 'function') {
            callback(this.#ws.clientId);
        }
    }

    getId() {
        return this.#ws.clientId;
    }

}

module.exports = Socket;