(function(window, _, Backbone) {

	var defaultOptions = {
		type: 'detectLines',
		gridColor: '#000000',
		gridPadding: 15,
		gridWidth: 20,
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
			var gw = this.options.gridWidth,
				grid = {};
			for (var x = 0, i = 0; x <= w; x += gw, i++) {
		        contextToDraw.moveTo(0.5 + x + padding, padding);
		        contextToDraw.lineTo(0.5 + x + padding, h + padding);
		        contextToDraw.fillText(x/gw,x,8);
		        grid[i] = [];
		        grid[i].push(x);
		    }


		    for (var x = 0, i = 0; x <= h; x += gw, i++) {
		        contextToDraw.moveTo(padding, 0.5 + x + padding);
		        contextToDraw.lineTo(w + padding, 0.5 + x + padding);
		        contextToDraw.fillText(x/gw,0,x + 7);
		        if (!grid[i]) {
		        	grid[i] = [];
		        	grid[i].push(0);
		        } 
		        grid[i].push(x);
		    }
		    this.grid = grid;
		    contextToDraw.strokeStyle = this.options.gridColor;
		    contextToDraw.stroke();
		},

		invertCanvas: function() {
			var padding = this.options.gridPadding;
			var width = this.gridCanvas.width
				height = this.gridCanvas.height,
				imgData = this.originalContext.getImageData(0, 0, width, height);
			var data = imgData.data,
				length = data.length;
			function invert() {
				for(var i = 0; i < length; i += 4) {
			      var brightness = (0.59 * data[i] + 0.13 * data[i + 1] + 
			      	0.79 * data[i + 2]) * 1;
			      // red
			      data[i] = brightness;
			      // green
			      data[i + 1] = brightness;
			      // blue
			      data[i + 2] = brightness;
			    }
			}
			invert();
		    this.gridContext.clearRect(padding, padding, width, height);
		    this.gridContext.putImageData(imgData, padding, padding);
		    this.gridContext.drawImage(this.gridCanvas, 0, 0, width, height);
		},
		drawImage: function() {
			this.options.drawTo.appendChild(this.gridCanvas);
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
			this.createGrid(this.gridContext, this.originalCanvas.width, 
				this.originalCanvas.height, this.options.gridPadding)
		},
		processLines: function() {
			var cols = Math.floor(this.originalCanvas.width/this.options.gridWidth),
				rows = Math.floor(this.originalCanvas.height/this.options.gridWidth),
				width = this.originalCanvas.width,
				height = this.originalCanvas.height,
				gw = this.options.gridWidth,
				p = this.options.gridPadding,
				imgData, data, length, x, y,
				maxImg = 135,
				minImg = 100;
			function delect() {
				for (var i = 2; i <= 12; i++) {
			        for (var j = 12; j <= 13; j++) {
			        	x = (i * gw + p);
			        	y = (j * gw + p);
			        	w = gw;
			        	h = gw;
			        	imgData = this.gridContext.getImageData(x, y, w, h);

			        	data = imgData.data;
						length = data.length;

						for(var k = 0; k < length; k += 4) {
					      if (data[k] < maxImg && data[k + 1] < maxImg 
					      		&& data[k + 2] < maxImg &&
					      		data[k] > 100 && data[k + 1] > 100 
					      		&& data[k + 2] > 100) {
					      	data[k] = 0;
					      	data[k + 1] = 0;
					      	data[k + 2] = 0;
					      }
					    }
					    this.gridContext.putImageData(imgData, x, y);
			    	}
			    }
			}
			delect.call(this);
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
