# tarantool-queue
Simple wrapper for Tarantool Queue for NodeJS (ES6).
It accepts Tarantool connection from [tarantool/node-tarantool-driver](https://github.com/tarantool/node-tarantool-driver "tarantool/node-tarantool-driver")

Module [Queue](https://github.com/tarantool/queue "Queue") for Tarantool is required (if you use [Official Tarantool Docker image](https://hub.docker.com/r/tarantool/tarantool "Official Tarantool Docker image") you already have it, if you do not please install the Queue module - [here is described how](https://www.tarantool.io/en/doc/2.1/book/app_server/installing_module/ "here is described how"))
To check if you have the Queue module installed run in your **Tarantool console**:
```lua
queue = require('queue')
```

Sample usage (worker):
```javascript
import Tarantool from 'tarantool-driver';
import TarantoolQueue from 'stepdi/tarantool-queue';

async function worker() {
    let conn = new Tarantool({ port: 3301 });
    let q = new TarantoolQueue(conn, 'myQueue');
    
    async function processTask(t) {
        return new Promise((resolve, reject) => {
                q.ack(t[0][0]).then(resolve).catch(reject);
        });
    }
    
    try {
        let task;
        while (task = await q.take()) {
            await processTask(task);
        }
    } catch (err) {
        console.log('Error:', err);
    }
}

worker();
```

Functions supported (please refer to Tarantool Queue module documentation using links in the list). Every function returns a Promise object.
- [create_tube](https://github.com/tarantool/queue#creating-a-new-queue "create_tube")(type = 'fifo', temporary = true)
- [drop](https://github.com/tarantool/queue#dropping-a-queue "drop")()
- [put](https://github.com/tarantool/queue#putting-a-task-in-a-queue "put")(taskData, options)
- [take](https://github.com/tarantool/queue#taking-a-task-from-the-queue-consuming "take")(timeout)
- [touch](https://github.com/tarantool/queue#increasing-ttr-andor-ttl-for-tasks "touch")(taskId, increment)
- [ack](https://github.com/tarantool/queue#acknowledging-the-completion-of-a-task "ack")(taskId)
- [release](https://github.com/tarantool/queue#releasing-a-task "release")(taskId, options)
- [peek](https://github.com/tarantool/queue#peeking-at-a-task "peek")(taskId)
- [bury](https://github.com/tarantool/queue#burying-a-task "bury")(taskId)
- [kick](https://github.com/tarantool/queue#kicking-a-number-of-tasks "kick")(count)
- [delete](https://github.com/tarantool/queue#deleting-a-task "delete")(taskId)
- [statistics](https://github.com/tarantool/queue#getting-statistics "statistics")()

and extra function: 
- getAll() – select all items from queue