/* file: script/app.js */

  APP = new GAMY.Application({
    onPreload: function() {

    },

    onReady: function() {
      
    }

  });



    var APP = {

      activeRegion: null,
      lockedRegion: null,

      regions: [],

      setLockedRegion: function(index) {
        if(this.lockedRegion === index) index = null;

        this.$list.children("[region=" + this.lockedRegion + "]").toggleClass("locked", false);
        this.$list.children("[region=" + index + "]").toggleClass("locked", true);

        this.lockedRegion = index;
        this.refresh();
      },

      setActiveRegion: function(index) {
        this.$list.children("[region=" + this.activeRegion + "]").toggleClass("active", false);
        this.$list.children("[region=" + index + "]").toggleClass("active", true);

        this.activeRegion = index;
        this.refresh();
      },

      setMode: function(mode) {
        this.mode = mode;
        localStorage.setItem("mode", mode);
        if(this.regions.length) listRegions();
      },

      refresh: function() {

        this.$hud.ctx.clearRect(0, 0, this.spritesheetWidth, this.spritesheetHeight);
        this.$hud.ctx.save();
        this.$hud.ctx.scale(APP.scale, APP.scale);

        if(this.activeRegion !== null) {
          var region = this.regions[this.activeRegion];
          this.$hud.ctx.lineWidth = 3;
          this.$hud.ctx.strokeStyle = "#fff";
          this.$hud.ctx.strokeRect(region[0], region[1], region[2] - region[0] + 1, region[3] - region[1] + 1);
        }

        if(this.lockedRegion !== null) {
          var region = this.regions[this.lockedRegion];
          this.$hud.ctx.lineWidth = 3;
          this.$hud.ctx.globalAlpha = 0.5;
          this.$hud.ctx.fillStyle = "#fa0";
          this.$hud.ctx.fillRect(region[0], region[1], region[2] - region[0] + 1, region[3] - region[1] + 1);
          this.$hud.ctx.globalAlpha = 1.0;
        }

        this.$hud.ctx.restore();
      }

    };

    APP.setMode(localStorage.getItem("mode") || "canvas");

    /* create some shorthands for DOM elements */

    $("[id]").each(function() {
      APP["$" + $(this).attr("id")] = $(this);
    });

    /* create checkboard background */

    var grid = 32;
    var canvas = document.createElement("Canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = canvas.height = grid * 2;

    ctx.fillStyle = "#aaa";
    ctx.fillRect(0, 0, grid, grid);
    ctx.fillRect(grid, grid, grid, grid);
    ctx.fillStyle = "#bbb";
    ctx.fillRect(grid, 0, grid, grid);
    ctx.fillRect(0, grid, grid, grid);

    $("body").css("background", "url(" + canvas.toDataURL("image/png") + ")");

    /* drawing context */

    APP.$preview.ctx = APP.$preview[0].getContext("2d");
    APP.$hud.ctx = APP.$hud[0].getContext("2d");

    /* bind events */

    $(function() {
      $(document).on('drop', function(e) {
        return onDrop(e);
      });
      $(document).on("dragover", function(e) {
        e.preventDefault();
      })
      $("#demo").on('click', demo);
      $("#editor").on('mousemove', onMouseMove);
      $("#editor").on('mousedown', onMouseDown);

      APP.$modeCSS.on("click", function() {
        APP.setMode("css");
      });
      APP.$modeCanvas.on("click", function() {
        APP.setMode("canvas");
      });


      APP.$preview.on("mousedown", function(e) {
        e.pageX -= $(this).offset().left;
        e.pageY -= $(this).offset().top;

        var b = determineBoundaries(e.pageX, e.pageY);
      });
    });

    /* methods */

    function printf() {
      if(typeof arguments[1] === "object") var args = arguments[1];
      else var args = arguments;

      return arguments[0].replace(/\{(.*?)\}/g, function(str, key) {
        return args[key];
      });
    }

    function pointInRect(x, y, rx, ry, rw, rh) {
      return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }

    function onMouseDown(e) {
      e.pageX -= $(this).offset().left;
      e.pageY -= $(this).offset().top;

      for(var i = 0; i < APP.regions.length; i++) {
        var region = APP.regions[i];

        if(pointInRect(e.pageX * 1 / APP.scale, e.pageY * 1 / APP.scale, region[0], region[1], region[2] - region[0], region[3] - region[1])) {
          APP.setLockedRegion(i);
          break;
        }
      }
    }

    function onMouseMove(e) {
      e.pageX -= $(this).offset().left;
      e.pageY -= $(this).offset().top;

      for(var i = 0; i < APP.regions.length; i++) {
        var region = APP.regions[i];

        if(pointInRect(e.pageX * 1 / APP.scale, e.pageY * 1 / APP.scale, region[0], region[1], region[2] - region[0], region[3] - region[1])) {
          APP.setActiveRegion(i);
          break;
        }
      }

    }

    function demo(e) {

      var image = new Image();
      image.onload = function() {
        console.log("LOADED");
        onImageChange.call(this);
      };
      image.src = "http://spritecutie.com/img/demo.png";

      APP.$csf.show();

      return true;
    }

    function onDrop(e) {

      e.stopPropagation();
      e.preventDefault();

      var file = e.originalEvent.dataTransfer.files[0];

      /* break if file is not image */

      if(!(/image/i).test(file.type)) return false;

      /* load file data and convert it into HTMLImage */

      var reader = new FileReader();

      reader.onload = function(e) {
        var image = new Image;
        image.onload = function() {
          onImageChange.call(this);
        };
        image.src = e.target.result;
      };

      reader.readAsDataURL(file);

      return false;
    }

    /* translate between index and coordinates */

    function pos() {

      /* support array as an argument */

      var args = typeof arguments[0] === "number" ? arguments : arguments[0];

      /* convert index to coords */

      if(args.length === 1) return [args[0] % APP.spritesheetWidth, args[0] / APP.spritesheetWidth | 0];

      /* convert coords to index */

      else {
        if(args[0] < 0 || args[0] > APP.spritesheetWidth || args[1] < 0 || args[1] > APP.spritesheetHeight) return -1;
        else return args[0] + args[1] * APP.spritesheetWidth;
      }
      
    }

    function onImageChange() {

      APP.width = $(window).width();
      APP.height = $(window).height();

      APP.$editor.show();
      APP.$dropZone.hide();

      APP.spritesheetWidth = this.width;
      APP.spritesheetHeight = this.height;

      APP.scale = Math.min(1, APP.width / APP.spritesheetWidth);

      APP.$hud[0].width = APP.$preview[0].width = Math.min(APP.spritesheetWidth, APP.width);
      APP.$hud[0].height = APP.$preview[0].height = Math.min(APP.spritesheetHeight, APP.height);

      APP.$editor.css("width", APP.$hud[0].width).center();

      APP.$preview.ctx.save();
      APP.$preview.ctx.scale(APP.scale, APP.scale);
      APP.$preview.ctx.drawImage(this, 0, 0);
      APP.$preview.ctx.restore();

      var buffer = document.createElement("Canvas");
      buffer.width = APP.spritesheetWidth;
      buffer.height = APP.spritesheetHeight;
      buffer.ctx = buffer.getContext("2d");
      buffer.ctx.drawImage(this, 0, 0);

      /* build boolean mask */

      APP.boolmap = [];

      var pixels = buffer.ctx.getImageData(0, 0, this.width, this.height).data;

      for(var i = 0, len = pixels.length; i < len; i += 4) {

        /* alpha to boolean */

        APP.boolmap.push(pixels[i + 3] > 0)
      }

      APP.regions = findRegions();

      listRegions();
    }

    /* regions listing */

    function listRegions(mode) {

      APP.$list.children().remove();

      for(var i in APP.regions) {
        var region = APP.regions[i];

        var values = [region[0], region[1], region[2] - region[0] + 1, region[3] - region[1] + 1];

        if(APP.mode === "canvas") var $region = $("<span>[" + values.join(", ") + "]</span>");
        else var $region = $(printf("<span>background-position: -{1}px -{2}px; width: {3}px; height:{4}px</span>", values[0], values[1], values[2], values[3]));


        $region.appendTo(APP.$list);
        $region.attr("region", i);
        $region.on({
          mouseenter: function() {
            $this = $(this);
            var region = $this.attr("region");
            APP.setActiveRegion(region);
          },

          mouseleave: function() {
            $this = $(this);
            var region = $this.attr("region");
            APP.setActiveRegion(null);
          },

          mousedown: function() {
            $this = $(this);
            var region = $this.attr("region");
            APP.setLockedRegion(region);
          }
        });

      }
    }

    /* find all regions */

    function findRegions() {
      var checked = [];
      var regions = [];
      var iteration = 0;
      for(var y = 0; y < APP.spritesheetHeight; y++) {
        for(var x = 0; x < APP.spritesheetWidth; x++) {
          var index = pos(x, y);

          if(APP.boolmap[index] && (checked[index] === undefined)) {
            var region = determineBoundaries(x, y);

            for(var j = 0; j <= region[3] - region[1]; j++) {
              for(var i = 0; i <= region[2] - region[0]; i++) {
                var cursor = pos(region[0] + i, region[1] + j);
                checked[cursor] = true;
              }
            }
            if(iteration++ > 100) {
              return;
            }

            regions.push(region);
          }
        }
      }

      regions.sort(function(a, b) {
        var aValue = 0;
        var bValue = 0;

        if(a[1] > b[1]) aValue += 10;
        else if(b[1] > a[1]) bValue += 10;
        if(a[0] > b[0]) aValue += 100;
        else if(b[0] > a[0]) bValue += 100;

        return a[0] - b[0];
      });


      return regions;
    }

    /* find boundaries for a click using fill algorithm */

    function determineBoundaries(x, y) {

      if(!APP.boolmap[pos(x, y)]) return false;

      /* left top right bottom */

      var bounds = [x, y, x, y];

      var openings = [
        [x, y]
      ];

      var checked = [];

      while(openings.length) {
        var cursor = openings.pop();

        var offsets = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1]
        ];

        /* search for openings */

        for(var i = offsets.length - 1; i >= 0; i--) {

          /* some variables for readability :) */



          var next = [cursor[0] + offsets[i][0], cursor[1] + offsets[i][1]];

          var nextIndex = pos(next);

          if(nextIndex < 0) continue;

          if(!checked[nextIndex] && APP.boolmap[nextIndex]) {
            checked[nextIndex] = true;
            openings.push(next);
          }
        };

        /* check boundaries */

        if(cursor[0] < bounds[0]) bounds[0] = cursor[0]; /* lft */
        if(cursor[0] > bounds[2]) bounds[2] = cursor[0]; /* rgt */
        if(cursor[1] < bounds[1]) bounds[1] = cursor[1]; /* top */
        if(cursor[1] > bounds[3]) bounds[3] = cursor[1]; /* btm */
      }

      return bounds;
    }

    /* chat */

    chat = {

      server: "ws://refuture.eu:5000",
      connected: false,

      state: true,

      init: function() {
        var state = localStorage.getItem("chat-state");

        if(!state) state = "no";

        this.toggle(state === "yes" ? true : false);
      },

      toggle: function(state) {
        if(state === undefined) state = !chat.state;

        this.state = state;
        localStorage.setItem("chat-state", this.state ? "yes" : "no");

        if(state) {
          APP.$chat.show();
          APP.$chatReminder.hide();
        } else {
          APP.$chat.hide();
          APP.$chatReminder.show();
        }

      },

      help: function() {
        this.addLine("* <h1>Cutie Help</h1>" + "set name using: /nick name<br>" + "hit TAB to toggle chat<br>" + "contact: rezoner1337@gmail.com");
      },

      saveNick: function(nick) {
        localStorage.setItem("chat-nick", nick);
      },

      onConnection: function() {
        this.connected = true;
        this.addLine("* <h1>Welcome to Cutie Lounge</h1>" + "I encourage you to say hello as the most of people here are game and web developers<br>" + "type /help");

        var nick = localStorage.getItem("chat-nick");

        if(nick) this.sendMessage("/nick " + nick);
      },

      onDisconnect: function() {
        this.connected = false;
        this.addLine("***chat is dead***");
      },

      onMessage: function(message) {
        this.addLine(message);
      },

      addLine: function(message) {

        if(APP.$chatMessages.children().length > 30) APP.$chatMessages.children(":first").remove()
        $message = $("<p>");

        if(message[0] === "*") {
          $message.addClass("cutie");
          message = message.substr(1);
        }

        $message.html(message);

        APP.$chatMessages.append($message);
      },

      sendMessage: function(message) {
        if(message == "/help") {
          this.help();
          APP.$chatInput.val("");
        } else {
          if(!this.connected) this.addLine("You are not connected");
          else {
            if(message[0] == "/") {
              var args = message.substr(1).split(" ");
              switch(args[0]) {
              case "nick":
                chat.saveNick(args[1]);
                break;
              }
            }

            chat.ws.send(message);
          }
        }
      }

    }

    chat.init();

    /* capture keyboard */

    $(document).on("keydown", function(e) {

      switch(e.keyCode) {
      case 9:
        chat.toggle();
        APP.$chatInput.focus();     
        return false;
        break;
      case 13:
        chat.sendMessage(APP.$chatInput.val());
        APP.$chatInput.val("");
        break;
      }


    });

    /* init websockets */

    chat.ws = new WebSocket(chat.server);

    chat.ws.onopen = function() {
      chat.onConnection();
    }

    chat.ws.onmessage = function(message) {
      chat.onMessage(message.data);
    }

    chat.ws.onclose = function() {
      chat.onDisconnect();
    }

    APP.chat = chat;
  
  

