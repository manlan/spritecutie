if(typeof _ === "undefined") _ = {};

(function(_) {

  var utils = {

    colors: {
      adjustHSL: function(canvas, dh, ds, dl) {

        var context = canvas.getContext("2d");

        var data = context.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = data.data;
        var r, g, b, a, h, s, l, hsl = [],
          newPixel = [];

        for(var i = 0, len = pixels.length; i < len; i += 4) {
          r = pixels[i + 0];
          g = pixels[i + 1];
          b = pixels[i + 2];
          a = pixels[i + 3];

          hsl = _.rgbToHsl(r, g, b);

          h = dh === null ? hsl[0] : _.wrapValue(hsl[0] + dh, 0, 1);
          s = ds === null ? hsl[1] : _.limitValue(hsl[1] + ds, 0, 1);
          l = dl === null ? hsl[2] : _.limitValue(hsl[2] + dl, 0, 1);

          newPixel = _.hslToRgb(h, s, l);

          pixels[i + 0] = newPixel[0];
          pixels[i + 1] = newPixel[1];
          pixels[i + 2] = newPixel[2];
        }

        context.putImageData(data, 0, 0);

        return canvas;
      },

      color: function(canvas, blendR, blendG, blendB) {

        var context = canvas.getContext("2d");

        var targetHSL = _.rgbToHsl(blendR, blendG, blendB);

        var data = context.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = data.data;
        var r, g, b, a, h, s, l, hsl = [],
          newPixel = [];

        for(var i = 0, len = pixels.length; i < len; i += 4) {
          r = pixels[i + 0];
          g = pixels[i + 1];
          b = pixels[i + 2];
          a = pixels[i + 3];

          hsl = _.rgbToHsl(r, g, b);

          h = targetHSL[0];
          s = targetHSL[1];
          l = hsl[2];

          newPixel = _.hslToRgb(h, s, l);

          pixels[i + 0] = newPixel[0];
          pixels[i + 1] = newPixel[1];
          pixels[i + 2] = newPixel[2];
        }


        context.putImageData(data, 0, 0);

        return canvas;

      }

    }
  };

  for(var key in utils) {
    // if(typeof _[key] === "undefined") {
    _[key] = utils[key];
    //}
  }

})(_);