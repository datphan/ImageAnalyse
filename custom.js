(function(window, _, Backbone) {

	var defaultOptions = {
		type: 'detectLines',
		gridColor: '#000000',
		gridPadding: 15,
		drawTo: document.body
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
			var w = this.originalCanvas.width + this.options.gridPadding,
				h = this.originalCanvas.height + this.options.gridPadding;

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
			var padding = this.options.gridPadding;
			var width = this.pixelateCanvas.width
				height = this.pixelateCanvas.height,
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
		    this.pixelateContext.clearRect(padding, padding, width, height);
		    this.pixelateContext.putImageData(imgData, padding, padding);
		    this.pixelateContext.drawImage(this.pixelateCanvas, 0, 0, width, height);
		},
		drawImage: function() {
			this.options.drawTo.appendChild(this.pixelateCanvas);
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
				this.drawImage();
			}
		},
		appendGrid: function() {
			this.createGrid(this.pixelateContext, this.originalCanvas.width, 
				this.originalCanvas.height, this.options.gridPadding)
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
