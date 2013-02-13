fs = require("fs");
chat = {

  clients: [],

  guest_id: 1,

  history: "",

  initialize: function(callback) {
    var WebSocketServer = require('ws').Server;

    this.wss = new WebSocketServer({
      port: 5000,
      host: '0.0.0.0'
    });

    this.wss.on('connection', function(ws) {
      chat.onConnection(ws);
    });
  },

  onMessage: function(ws, message) {
    if(typeof message != "string") return false;
    if(message.length > 1024) return false;
    if(!message) return false;

    message = message.replace("<", "&lt;");

    if(message[0] === "*") {
      this.send(ws, "use of * is restricted for server");
      return false;
    }

    if(message[0] === "/") {
      var args = message.substr(1).split(" ");
      switch(args[0]) {
        case "nick":
        if(!args[1]) return false;
          if(args[1].length > 16) this.send(ws, "* nick too long max:16");
          for(var i = 0; i < this.clients.length; i++) {
            if(this.clients[i].name === args[1]) {
              this.send(ws, "* sorry this name is already taken");
              return;
            }
          }
          this.emit("* " + ws.name + " is now known as " + args[1]);
          ws.name = args[1];
        break;
      }
    } else {
      this.history += ws.name + ": " + message + "\n";
      if(this.history.length > 1024 * 16) {
        fs.writeFile("history" + Date.now() + ".txt", this.history);
        this.history = "";
      }
      if(ws.name) this.emit(ws.name + ": " + message);      
    }
  },

  onConnection: function(ws) {

    ws.name = "guest-" + (this.guest_id++);
    this.emit("* " + ws.name + " has entered the room");

    this.clients.push(ws);

    this.send(ws, "* there are " + this.clients.length + " people online");

    ws.on('message', function(message) {
      chat.onMessage(this, message);
    });

    ws.on('close', function() {
      chat.emit("* " + this.name + " has left the room");
      this.remove = true;
      cleanArray(chat.clients, "remove");
    });
  },

  send: function(ws, data) {
    if(ws.remove) return false;

    try {
      ws.send(data);
    } catch(e) {
      console.log("error on send", e);
      ws.remove = true;
      ws.terminate();
    }
  },

  emit: function(data) {
    for(var i = 0; i < this.clients.length; i++) {
      this.send(this.clients[i], data);
    }
  },

}


chat.initialize();

function cleanArray(array, property) {

  var lastArgument = arguments[arguments.length - 1];
  var isLastArgumentFunction = typeof lastArgument === "function";

  for(var i = 0, len = array.length; i < len; i++) {
    if(array[i] === null || (property && array[i][property])) {
      if(isLastArgumentFunction) {
        lastArgument(array[i]);
      }
      array.splice(i--, 1);
      len--;
    }
  }
};