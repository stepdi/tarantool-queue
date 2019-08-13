class TarantoolQueue {
    constructor(conn, queueName, debug = false) {
        this.conn = conn;
        this.queueName = queueName;
        this.debug = debug;

        this.conn.eval('queue = require("queue")');
    }

    async _call(expression, ...parameters) {
        try {
            let paramsPrepared = parameters.map(p => {
                if (typeof p == 'object' || typeof p == 'array') 
                    return JSON.stringify(p)
                        .replace(/\"([^(\")"]+)\":/g,"$1:") // removing quotes from JSON properties
                        .replace(/:"/g, '="');
                if (typeof p == 'string') return '"' + p + '"';
                return p; 
            });
            let query = 'return ' + expression + '(' + paramsPrepared.filter(p => p !== undefined).join(', ') + ')';
            if (this.debug) console.log(query);
            return await this.conn.eval(query);
        } catch (err) {
            if (/a nil value/.test(err.message))
                throw 'Queue "' + this.queueName + '" does not exist';
            if (/unsupported Lua type/.test(err.message))
                return; // not an error @see https://github.com/tarantool/doc/commit/5d477de2103fa132a40cec9361c374a2191a5130#diff-e1a06d4e0ab9d28d02604cadea51b835
            throw err.message;
        }
    }

    _callForQueue (method, ...parameters) {
        return this._call("queue.tube['" + this.queueName + "']:" + method, ...parameters);
    }

    getAll() {
        return this._call("box.space['" + this.queueName + "']:select" );
    }

    create_tube(type = 'fifo', temporary = true) {
        return this._call('queue.create_tube', this.queueName, type, { temporary });
    }
    drop() { return this._callForQueue('drop'); }

    put(taskData, options) { return this._callForQueue('put', taskData, options); }
    take(timeout) { return this._callForQueue('take', timeout); }
    touch(taskId, increment) { return this._callForQueue('touch', taskId, increment); }    
    ack(taskId) { return this._callForQueue('ack', taskId); }
    release(taskId, options) { return this._callForQueue('release', taskId, options); }
    peek(taskId) { return this._callForQueue('peek', taskId); }
    bury(taskId) { return this._callForQueue('bury', taskId); }
    kick(count) { return this._callForQueue('kick', count); }
    delete(taskId) { return this._callForQueue('delete', taskId); }

    statistics() {
        return this._call('queue.statistics', this.queueName);
    }
}

module.exports = TarantoolQueue;