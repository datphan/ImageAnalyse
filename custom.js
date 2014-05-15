(function(window, _, Backbone) {

	var defaultOptions = {
		type: 'detectLines',
		gridColor: '#000000'
	}

	function ImageAnalyse() {
		this.initialize.apply(this, arguments);
	}
	/**
     * The top tier
     *
     */
	_.extend(ImageAnalyse.prototype, Backbone.Events, {
		initCanvas: function() {
			var w = this.originalCanvas.width,
				h = this.originalCanvas.height;

			this.originalContext = this.originalCanvas.getContext('2d');
			
			this.pixelateCanvas = this.createCanvas(w, h);
			this.pixelateContext = this.pixelateCanvas.getContext("2d");

			this.gridCanvas = this.createCanvas(w, h);
			this.gridContext = this.gridCanvas.getContext("2d");

		},
		createCanvas: function(w, h) {
			var canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			return canvas;
		},
		createGrid: function(contextToDraw, w, h, padding) {
			for (var x = 0; x <= w; x += 40) {
		        contextToDraw.moveTo(0.5 + x + padding, padding);
		        contextToDraw.lineTo(0.5 + x + padding, h + padding);
		        contextToDraw.fillText(x/40,x,8);
		    }


		    for (var x = 0; x <= h; x += 40) {
		        contextToDraw.moveTo(padding, 0.5 + x + padding);
		        contextToDraw.lineTo(w + padding, 0.5 + x + padding);
		        contextToDraw.fillText(x/40,0,x + 7);
		    }

		    contextToDraw.strokeStyle = this.options.gridColor;
		    contextToDraw.stroke();
		},
		invertCanvas: function() {
			var width = this.originalCanvas.width,
				height = this.originalCanvas.height,
				imgData = this.originalContext.getImageData(0, 0, width, height);
			var data = imgData.data,
				length = data.length; // 4 components - red, green, blue and alpha

			for(var i = 0; i < length; i += 4) {
		      /*// red
		      data[i] = 255 - data[i];
		      // green
		      data[i + 1] = 255 - data[i + 1];
		      // blue
		      data[i + 2] = 255 - data[i + 2];*/
		      var brightness = 0.36 * data[i] + 0.76 * data[i + 1] + 0.16 * data[i + 2];
		      // red
		      data[i] = brightness;
		      // green
		      data[i + 1] = brightness;
		      // blue
		      data[i + 2] = brightness;
		    }
		    this.pixelateContext.clearRect(0, 0, width, height);
		    this.pixelateContext.putImageData(imgData, 0, 0);
		    this.pixelateContext.drawImage(this.pixelateCanvas, 0, 0, width, height);
		},
		drawImage: function(drawTo) {
			drawTo.appendChild(this.pixelateCanvas);
		}
	});
	/**
     * The second tier
     *
     */
	_.extend(ImageAnalyse.prototype, {
		initUi: function() {
			if (this.options.type == 'detectLines') {
				this.invertCanvas();
				this.appendGrid();
				this.processLines();
				this.drawImage(document.body);
			}
		},
		appendGrid: function() {
			this.createGrid(this.pixelateContext, this.originalCanvas.width, 
				this.originalCanvas.height, 10)
		},
		processLines: function() {

		}
	});

	_.extend(ImageAnalyse.prototype, Backbone.Events, {
		initialize: function(canvas, options) {
			this.originalCanvas = canvas;
			this.options = _.defaults(options || {}, defaultOptions);

			this.initCanvas();
			this.initUi();
		}
	});

	window.imageAnalyse = function(canvas, options) {
		return new ImageAnalyse(canvas, options);
	}
})(window, _, Backbone);
