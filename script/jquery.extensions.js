$.fn.center = function() {

    if(typeof arguments[0] === "object") {
      $object = arguments[0];
      x = arguments[1];
      y = arguments[2];
    } else {
      $object = this.parent();
      x = arguments[0];
      y = arguments[1];
    }

    if(typeof x === "undefined") x = true;

    if(this.css("position") === "absolute") {
      if(x) this.css({
        left: $object.width() / 2 - this.outerWidth() / 2
      });
      if(y) this.css({
        top: $object.height() / 2 - this.outerHeight() / 2
      });
    } else {
      this.css({
        "margin-left": $object.width() / 2 - this.outerWidth() / 2
      });
    }

    return this;
  }