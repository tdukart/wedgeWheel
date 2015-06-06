if (require) {
  require.config({
    paths: {
      requirejs: 'bower_components/requirejs/require',
      'chroma-js': 'bower_components/chroma-js/chroma',
      duration: 'bower_components/duration.js/duration',
      chance: 'bower_components/chance/chance'
    },
    packages: [],
    shim: {
      duration: {
        exports: 'Duration'
      }
    },
    name: 'wedgewheel'
  });
}

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['chroma-js', 'duration', 'chance'], factory);
  } else {
    // Browser globals
    root.spinner = factory(root.chroma, root.Duration, root.chance);
  }
}(this, function(chroma, Duration, Chance) {

  var chance = new Chance();

  var predefinedColors = [
    "red",
    "blue",
    "yellow",
    "green",
    "orange"
  ];

  function getColor(i) {
    return predefinedColors[i % predefinedColors.length];
  }

  /**
   *
   * @param {String} name
   * @param {Number} [probability]
   * @param {String} [color]
   * @constructor
   */
  var Wedge = function(name, probability, color) {
    this.name = name;
    this.probability = probability || 1;
    if (color) {
      try {
        this.color = chroma(color);
      } catch (exception) {
        //assume it's an invalid color, so no-op.
      }
    }
  };

  /**
   *
   * @param {Element} spinnerContainer
   * @param {Number} size
   * @param {Array} [wedges]
   * @constructor
   */
  var Wheel = function(spinnerContainer, size, wedges) {
    this._totalProbability = 0;
    this._wedges = [];
    this._activeWedge = null;
    this._spinAmount = 0;

    //generate the canvases
    this._wheel = document.createElement('canvas');
    this._wheel.width = size;
    this._wheel.height = size;
    this._wheel.className = 'spinner';
    spinnerContainer.appendChild(this._wheel);

    this._pointer = document.createElement('canvas');
    this._pointer.width = size;
    this._pointer.height = size;
    this._pointer.className = 'pointer';
    spinnerContainer.appendChild(this._pointer);

    this._size = size;

    wedges.forEach(this._addWedge.bind(this));

    this.draw();
  };

  Wheel.prototype.draw = function(activeWedgeIndex) {
    var thisSpinner = this;

    var wheelContext = this._wheel.getContext('2d');

    var centerX = this._wheel.width / 2;
    var centerY = this._wheel.height / 2;
    var radius = (this._size / 2) - 5;

    wheelContext.beginPath();
    wheelContext.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    wheelContext.lineWidth = 5;
    wheelContext.strokeStyle = '#000000';
    wheelContext.stroke();

    var startAngle = 0;

    this._wedges.forEach(function(wedge, wedgeIndex) {
      wheelContext.save();

      //calculate the end angle
      var arc = (wedge.probability / thisSpinner._totalProbability) * 2 * Math.PI;
      var endAngle = startAngle + arc;

      var fillColor = wedge.color || chroma(getColor(wedgeIndex));
      var strokeColor = "#000000";
      if (typeof activeWedgeIndex !== 'undefined' && activeWedgeIndex === wedgeIndex) {
        fillColor = fillColor.hex();
      } else {
        fillColor = fillColor.darken().hex();
      }

      //draw the wedge
      wheelContext.beginPath();
      wheelContext.moveTo(centerX, centerY);
      wheelContext.arc(centerX, centerY, radius, startAngle, endAngle, false);
      wheelContext.closePath();
      wheelContext.fillStyle = fillColor;
      wheelContext.fill();
      wheelContext.lineWidth = 2;
      wheelContext.strokeStyle = strokeColor;
      wheelContext.stroke();

      startAngle = endAngle;

      wheelContext.restore();
    });

    startAngle = 0;
    this._wedges.forEach(function(wedge, wedgeIndex) {
      //calculate the end angle
      var arc = (wedge.probability / thisSpinner._totalProbability) * 2 * Math.PI;
      var endAngle = startAngle + arc;

      var fillColor = wedge.color || chroma(getColor(wedgeIndex));

      var textColor = 'white';
      if (chroma.contrast(textColor, fillColor) < 4) {
        textColor = 'black';
      }

      //draw the text
      wheelContext.save();
      wheelContext.font = 'bold ' + radius / 10 + 'px sans-serif';
      wheelContext.translate(centerX + Math.cos(startAngle + arc / 2) * (radius * .85), centerY + Math.sin(startAngle + arc / 2) * (radius * .85));
      wheelContext.rotate(startAngle + arc / 2 + Math.PI / 2);

      wheelContext.lineWidth = 2;
      wheelContext.strokeStyle = fillColor.darken().hex();
      wheelContext.strokeText(wedge.name, (0 - wheelContext.measureText(wedge.name).width) / 2, 0);

      wheelContext.fillStyle = textColor;
      wheelContext.fillText(wedge.name, (0 - wheelContext.measureText(wedge.name).width) / 2, 0);

      wheelContext.restore();

      startAngle = endAngle;
    });

    //draw the pointer
    var pointerContext = this._pointer.getContext('2d');
    var pointerCenterY = this._pointer.height / 2;
    var pointerWidth = this._pointer.width;

    pointerContext.beginPath();
    pointerContext.moveTo(pointerWidth, pointerCenterY - 8);
    pointerContext.lineTo(pointerWidth, pointerCenterY + 8);
    pointerContext.lineTo(pointerWidth - 16, pointerCenterY);
    pointerContext.closePath();
    pointerContext.fillStyle = '#000000';
    pointerContext.fill();
    pointerContext.lineWidth = 2;
    pointerContext.strokeStyle = '#ffffff';
    pointerContext.stroke();
  };

  /**
   * Spin the spinner
   * @param {Number} [spinAmount]
   */
  Wheel.prototype.spin = function(spinAmount) {
    if (!spinAmount) {
      spinAmount = chance.natural({max: 500}) / 500;
    }
    this._spinAmount += 2 + spinAmount;
    this._pointer.style.transform = "rotate(" + this._spinAmount / 2 + "turn)";
    this._wheel.style.transform = "rotate(-" + this._spinAmount / 2 + "turn)";
    this.draw();

    return this.determineWinner();
  };

  Wheel.prototype.reset = function() {
    this._spinAmount = 0;
    this._pointer.style.transform = "rotate(0turn)";
    this._wheel.style.transform = "rotate(0turn)";
    this.draw();
  };

  Wheel.prototype.determineWinner = function() {
    var fraction = this._spinAmount - Math.floor(this._spinAmount);
    var fractionChecked = 0;

    for (var i = 0; i < this._wedges.length; i++) {
      var wedge = this._wedges[i];
      fractionChecked += wedge.probability / this._totalProbability;
      if (fraction < fractionChecked) {
        var pointerTransition = new Duration(window.getComputedStyle(this._pointer, null).getPropertyValue('transition-duration'));
        setTimeout(function() {
          this.draw(i);
        }.bind(this), pointerTransition);

        return wedge;
      }
    }
  };

  /**
   *
   * @param {String} name
   * @param {Number} [probability]
   * @param {String} [color]
   */
  Wheel.prototype.addWedge = function(name, probability, color) {
    var wedge = new Wedge(name, probability, color);
    this._addWedge(wedge);
    this.draw();
  };

  /**
   *
   * @param {Wedge} wedge
   * @private
   */
  Wheel.prototype._addWedge = function(wedge) {
    var wedgeObject = new Wedge(wedge.name, wedge.probability, wedge.color);
    this._wedges.push(wedgeObject);
    this._totalProbability += wedge.probability;
  };

  return Wheel;

}));