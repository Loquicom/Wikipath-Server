// Import
const WebSocket = require('ws');
const Socket = require('./socket');

// Server class
class Server {

    // Private field
    #clients = [];
    #nextId = 1;
    #port;
    #wss = null;
    #event = {};
    #action = {};
    #interval = {};

    constructor(port = 8080) {
        this.#port = port;
    }

    on(event, callback) {
        if (typeof callback === 'function') {
            this.#event[event] = callback;
        }
    }

    action(action, callback) {
        if (typeof callback === 'function') {
            this.#action[action] = callback;
        }
    }

    start(callback = null) {
        this.#wss = new WebSocket.Server({ port: this.#port });
        // Handle error
        this.#wss.on('error', (err) => {
            if (typeof this.#event.error === 'function') {
                this.#event.error(err);
            }
        });
        // Connection
        this.#wss.on('connection', (ws) => {
            // Add id
            const clientId = this.#nextId++;
            this.#clients.push(clientId);
            ws.clientId = clientId;
            // Add variable to detect broken connection
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });
            // Handle message receive from client
            ws.on('message', (msg) => {
                // Parse message
                const data = this._jsonParse(msg);
                if (!data) return;
                // Use correct action
                const action = this.#action[data.action] ? this.#action[data.action] : this.#action.default;
                if (typeof action === 'function') {
                    action(data.data, new Socket(this, ws, data.action));
                }
            });
            // Event connection
            if (typeof this.#event.connection === 'function') {
                this.#event.connection(new Socket(this, ws));
            }
        });
        // Clear interval when server close
        this.#wss.on('close', () => {
            for(const interval in this.#interval) {
                clearInterval(this.#interval[interval]);
            }
        })
        // Check disconnection
        this._disconnectedClient();
        // Check broken connection
        this._brokenClient();
        // Callback
        if (typeof callback === 'function') {
            callback(this.#port);
        }
    }

    broadcast(action, data, exclude = null) {
        this._isStarted();
        // Send to each client
        this.#wss.clients.forEach(function each(client) {
            if (client !== exclude && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({action: action, data: data}));
            }
        });
    }

    clientDisconnect(clientId) {
        const index = this.#clients.indexOf(clientId);
        if (index === -1) {
            return false;
        }
        this.#clients.splice(index, 1);
        return true;
    }

    stop(callback = null) {
        this._isStarted();
        // Close server
        this.#wss.close();
        // Callback
        if (typeof callback === 'function') {
            callback(this.#port);
        }
    }

    getNumberOfClients() {
        return this.#clients.length;
    }

    _disconnectedClient() {
        // 10s interval to find disconneted clients
        this.#interval.disconnected = setInterval(() => {
            // Check if the number of client is different between WebSocketServer and cache
            if (this.#clients.length <= this.#wss.clients.size) {
                return false;
            }
            // Find who is disconnected
            const clients = [...this.#clients];
            this.#wss.clients.forEach(clt => {
                clients.splice(clients.indexOf(clt.clientId), 1);
            });
            // For each disconnected client
            for(const id of clients) {
                // Call disconnection for the client
                if (typeof this.#event.disconnection === 'function') {
                    this.#event.disconnection(id);
                }
                // Remove clients
                this.#clients.splice(this.#clients.indexOf(id), 1);
            }
        }, 10000);
    }

    _brokenClient() { 
        // Ping to check if client is still alive
        this.#interval.broken = setInterval(() => {
            // Check all client
            this.#wss.clients.forEach((ws) => {
                // The connection is broken
                if (!ws.isAlive) {
                    ws.terminate();
                    // Call broken for the client
                    if (typeof this.#event.broken === 'function') {
                        this.#event.broken(ws.clientId);
                    }
                    return;
                }
                // Set isAlive to false and wait the ping response
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    _jsonParse(data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return false;
        }
    }

    _isStarted() {
        if (this.#wss === null) {
            throw 'Server not started';
        }
    }

}

module.exports = Server;