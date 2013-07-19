/*
 * heatmap.js 1.0 -    JavaScript Heatmap Library
 *
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and the Beerware (http://en.wikipedia.org/wiki/Beerware) license.
 */

var PI2 = Math.PI*2;

(function(w){
    // the heatmapFactory creates heatmap instances
    var heatmapFactory = (function() {
    // store object constructor
    // a heatmap contains a store
    // the store has to know about the heatmap in order to trigger heatmap updates when datapoints get added
    var store = function store(hmap){
        var _ = {
            // data is a two dimensional array
            // a datapoint gets saved as data[point-x-value][point-y-value]
            // the value at [point-x-value][point-y-value] is the occurrence of the datapoint
            data: [],
            // tight coupling of the heatmap object
            heatmap: hmap
        };
        // the max occurrence - the heatmaps radial gradient alpha transition is based on it
        this.max = 1;
        this.get = function(key){return _[key];};
        this.set = function(key, value){_[key] = value;};
    }

    store.prototype = {
        setDataSet: function(obj) {
            var me = this,
                heatmap = me.get("heatmap"),
                data = [],
                d = obj.data,
                dlen = d.length;
            heatmap.clear();        // clear the heatmap before the data set gets drawn
            this.max = obj.max;
            // if a legend is set, update it
            heatmap.get("legend") && heatmap.get("legend").update(obj.max);
            for (var x in d) {
                var dx = d[x];
                for (var y in dx) {
                    heatmap.drawAlpha(x, y, dx[y]);
                }
            }
            heatmap.colorize();
            this.set("data", d);
        }
    };

    var legend = function legend(config){
        this.config = config;
        var _ = {
            element: null,
            labelsEl: null,
            gradientCfg: null,
            ctx: null
        };
        this.get = function(key){return _[key];};
        this.set = function(key, value){_[key] = value;};
        this.init();
    };
    legend.prototype = {
        init: function(){
            var me = this,
                config = me.config,
                title = config.title || "Legend",
                position = config.position,
                offset = config.offset || 10,
                gconfig = config.gradient,
                labelsEl = document.createElement("ul"),
                labelsHtml = "",
                grad, element, gradient, positionCss = "";
 
            me.processGradientObject();
            
            // Positioning
            // top or bottom
            if(position.indexOf('t') > -1) positionCss += 'top:'+offset+'px;';
            else positionCss += 'bottom:'+offset+'px;';
            // left or right
            if(position.indexOf('l') > -1) positionCss += 'left:'+offset+'px;';
            else positionCss += 'right:'+offset+'px;';
            element = document.createElement("div");
            element.style.cssText = "border-radius:5px;position:absolute;"+positionCss+"font-family:Helvetica; width:256px;z-index:10000000000; background:rgba(255,255,255,1);padding:10px;border:1px solid black;margin:0;";
            element.innerHTML = "<h3 style='padding:0;margin:0;text-align:center;font-size:16px;'>"+title+"</h3>";
            // create gradient in canvas
            labelsEl.style.cssText = "position:relative;font-size:12px;display:block;list-style:none;list-style-type:none;margin:0;height:15px;";
            // create gradient element
            gradient = document.createElement("div");
            gradient.style.cssText = ["position:relative;display:block;width:256px;height:15px;border-bottom:1px solid black; background-image:url(",me.createGradientImage(),");"].join("");

            element.appendChild(labelsEl);
            element.appendChild(gradient);
            
            me.set("element", element);
            me.set("labelsEl", labelsEl);

            me.update(1);
        },
        processGradientObject: function(){
            // create array and sort it
            var me = this,
                gradientConfig = this.config.gradient,
                gradientArr = [];

            for(var key in gradientConfig){
                if(gradientConfig.hasOwnProperty(key)){
                    gradientArr.push({ stop: key, value: gradientConfig[key] });
                }
            }
            gradientArr.sort(function(a, b){
                return (a.stop - b.stop);
            });
            gradientArr.unshift({ stop: 0, value: 'rgba(0,0,0,0)' });

            me.set("gradientArr", gradientArr);
        },
        createGradientImage: function(){
            var me = this,
                gradArr = me.get("gradientArr"),
                length = gradArr.length,
                canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                grad;
            // the gradient in the legend including the ticks will be 256x15px
            canvas.width = "256";
            canvas.height = "15";

            grad = ctx.createLinearGradient(0,5,256,10);

            for(var i = 0; i < length; i++){
                grad.addColorStop(1/(length-1) * i, gradArr[i].value);
            }

            ctx.fillStyle = grad;
            ctx.fillRect(0,5,256,10);
            ctx.strokeStyle = "black";
            ctx.beginPath();
 
            for(var i = 0; i < length; i++){
                ctx.moveTo(((1/(length-1)*i*256) >> 0)+.5, 0);
                ctx.lineTo(((1/(length-1)*i*256) >> 0)+.5, (i==0)?15:5);
            }
            ctx.moveTo(255.5, 0);
            ctx.lineTo(255.5, 15);
            ctx.moveTo(255.5, 4.5);
            ctx.lineTo(0, 4.5);
            
            ctx.stroke();

            // we re-use the context for measuring the legends label widths
            me.set("ctx", ctx);

            return canvas.toDataURL();
        },
        getElement: function(){
            return this.get("element");
        },
        update: function(max){
            var me = this,
                gradient = me.get("gradientArr"),
                ctx = me.get("ctx"),
                labels = me.get("labelsEl"),
                labelText, labelsHtml = "", offset;

            for(var i = 0; i < gradient.length; i++){

                labelText = max*gradient[i].stop >> 0;
                offset = (ctx.measureText(labelText).width/2) >> 0;

                if(i == 0){
                    offset = 0;
                }
                if(i == gradient.length-1){
                    offset *= 2;
                }
                labelsHtml += '<li style="position:absolute;left:'+(((((1/(gradient.length-1)*i*256) || 0)) >> 0)-offset+.5)+'px">'+labelText+'</li>';
            }       
            labels.innerHTML = labelsHtml;
        }
    };

    // heatmap object constructor
    var heatmap = function heatmap(config){
        // private variables
        var _ = {
            radius : 40,
            element : {},
            canvas : {},
            acanvas: {},
            ctx : {},
            actx : {},
            legend: null,
            visible : true,
            width : 0,
            height : 0,
            max : false,
            gradient : false,
            opacity: 180,
            premultiplyAlpha: false,
            bounds: {
                l: 1000,
                r: 0,
                t: 1000,
                b: 0
            },
            debug: false
        };
        // heatmap store containing the datapoints and information about the maximum
        // accessible via instance.store
        this.store = new store(this);
        this.get = function(key){return _[key];};
        this.set = function(key, value){_[key] = value;};
        // configure the heatmap when an instance gets created
        this.configure(config);
        // and initialize it
        this.init();
    };

    // public functions
    heatmap.prototype = {
        configure: function(config){
                var me = this,
                    rout, rin;
                me.set("radius", config["radius"] || 40);
                me.set("element", (config.element instanceof Object)?config.element:document.getElementById(config.element));
                me.set("visible", (config.visible != null)?config.visible:true);
                me.set("max", config.max || false);
                me.set("gradient", config.gradient || { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)"});    // default is the common blue to red gradient
                me.set("opacity", parseInt(255/(100/config.opacity), 10) || 180);
                me.set("width", config.width || 0);
                me.set("height", config.height || 0);
                me.set("debug", config.debug);
                if(config.legend){
                    var legendCfg = config.legend;
                    legendCfg.gradient = me.get("gradient");
                    me.set("legend", new legend(legendCfg));
                }
        },
        resize: function () {
                var me = this,
                    element = me.get("element"),
                    canvas = me.get("canvas"),
                    acanvas = me.get("acanvas");
                canvas.width = acanvas.width = me.get("width") || element.style.width.replace(/px/, "") || me.getWidth(element);
                this.set("width", canvas.width);
                canvas.height = acanvas.height = me.get("height") || element.style.height.replace(/px/, "") || me.getHeight(element);
                this.set("height", canvas.height);
        },

        init: function(){
                var me = this,
                    canvas = document.createElement("canvas"),
                    acanvas = document.createElement("canvas"),
                    ctx = canvas.getContext("2d"),
                    actx = acanvas.getContext("2d"),
                    element = me.get("element");
                
                me.initColorPalette();
                me.set("canvas", canvas);
                me.set("ctx", ctx);
                me.set("acanvas", acanvas);
                me.set("actx", actx);
                me.resize();
                canvas.style.cssText = acanvas.style.cssText = "position:absolute;top:0;left:0;z-index:10000000;";
                if(!me.get("visible")) canvas.style.display = "none";
                element.appendChild(canvas);
                if(me.get("legend")) element.appendChild(me.get("legend").getElement());
                // debugging purposes only
                if(me.get("debug")) document.body.appendChild(acanvas);
                actx.shadowOffsetX = 15000; 
                actx.shadowOffsetY = 15000; 
                actx.shadowBlur = 15; 
        },
        initColorPalette: function() {
            var me = this,
                canvas = document.createElement("canvas"),
                gradient = me.get("gradient"),
                ctx, grad, testData;
            canvas.width = "1";
            canvas.height = "256";
            ctx = canvas.getContext("2d");
            grad = ctx.createLinearGradient(0,0,1,256);
            // Test how the browser renders alpha by setting a partially transparent pixel
            // and reading the result.  A good browser will return a value reasonably close
            // to what was set.  Some browsers (e.g. on Android) will return a ridiculously wrong value.
            testData = ctx.getImageData(0,0,1,1);
            testData.data[0] = testData.data[3] = 64; // 25% red & alpha
            testData.data[1] = testData.data[2] = 0; // 0% blue & green
            ctx.putImageData(testData, 0, 0);
            testData = ctx.getImageData(0,0,1,1);
            me.set("premultiplyAlpha", (testData.data[0] < 60 || testData.data[0] > 70));
            for(var x in gradient) grad.addColorStop(x, gradient[x]);
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,1,256);
            me.set("gradient", ctx.getImageData(0,0,1,256).data);
        },
        getWidth: function(element){
            var width = element.offsetWidth;
            if(element.style.paddingLeft) width+=element.style.paddingLeft;
            if(element.style.paddingRight) width+=element.style.paddingRight;
            return width;
        },
        getHeight: function(element){
            var height = element.offsetHeight;
            if(element.style.paddingTop) height+=element.style.paddingTop;
            if(element.style.paddingBottom) height+=element.style.paddingBottom;
            return height;
        },
        colorize: function() {
            // get the private variables
            var me = this,
                width = me.get("width"),
                radius = me.get("radius"),
                height = me.get("height"),
                actx = me.get("actx"),
                ctx = me.get("ctx"),
                x2 = radius * 3,
                premultiplyAlpha = me.get("premultiplyAlpha"),
                palette = me.get("gradient"),
                opacity = me.get("opacity"),
                bounds = me.get("bounds"),
                image, imageData, length, alpha, offset, finalAlpha,
                left = (bounds['l'] < 0) ? 0 : bounds['l'],
                right = (bounds['r'] > width) ? width : bounds['r'],
                top = (bounds['t'] < 0) ? 0 : bounds['t'],
                bottom = (bounds['b'] > height) ? height : bounds['b'];
            image = actx.getImageData(left, top, right-left, bottom-top);
            imageData = image.data;
            length = imageData.length;
            // loop thru the area
            for(var i=3; i < length; i+=4){
                // [0] -> r, [1] -> g, [2] -> b, [3] -> alpha
                alpha = imageData[i],
                offset = alpha*4;
                if(!offset) continue;
                // we ve started with i=3
                // set the new r, g and b values
                finalAlpha = (alpha < opacity)?alpha:opacity;
                imageData[i-3]=palette[offset];
                imageData[i-2]=palette[offset+1];
                imageData[i-1]=palette[offset+2];
                if (premultiplyAlpha) {
                	// To fix browsers that premultiply incorrectly, we'll pass in a value scaled
                	// appropriately so when the multiplication happens the correct value will result.
                	imageData[i-3] /= 255/finalAlpha;
                	imageData[i-2] /= 255/finalAlpha;
                	imageData[i-1] /= 255/finalAlpha;
                }
                // we want the heatmap to have a gradient from transparent to the colors
                // as long as alpha is lower than the defined opacity (maximum), we'll use the alpha value
                imageData[i] = finalAlpha;
            }
            // the rgb data manipulation didn't affect the ImageData object(defined on the top)
            // after the manipulation process we have to set the manipulated data to the ImageData object
            image.data = imageData;
            ctx.putImageData(image, left, top);
        },
        drawAlpha: function(x, y, count){
            // storing the variables because they will be often used
            var me = this,
                radius = me.get("radius"),
                ctx = me.get("actx"),
                max = me.get("max"),
                R = 1.5*radius >> 0,
                bounds = me.get("bounds"),
                xb = x - R, yb = y - R >> 0,
                xc = x + R, yc = y + R;
            ctx.shadowColor = ('rgba(0,0,0,'+((count)?(count/me.store.max):'0.1')+')');
            ctx.shadowOffsetX = 15000; 
            ctx.shadowOffsetY = 15000; 
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(x - 15000, y - 15000, radius, 0, PI2, true);
            ctx.closePath();
            ctx.fill();
            if(xb < bounds["l"]) bounds["l"] = xb;
            if(yb < bounds["t"]) bounds["t"] = yb;
            if(xc > bounds['r']) bounds['r'] = xc;
            if(yc > bounds['b']) bounds['b'] = yc;
        },
        setVisibility: function(v) {
            this.set("visible", v);
            this.get("canvas").style.display = ((v) ? "block" : "none");
        },
        toggleDisplay: function() { this.setVisibility(!this.get("visible"));},
        // dataURL export
        getImageData: function() { return this.get("canvas").toDataURL();},
        clear: function(){
            var me = this,
                w = me.get("width"),
                h = me.get("height");
            me.store.set("data",[]);
            // @TODO: reset stores max to 1
            //me.store.max = 1;
            me.get("ctx").clearRect(0,0,w,h);
            me.get("actx").clearRect(0,0,w,h);
        },
        cleanup: function(){
            var me = this;
            me.get("element").removeChild(me.get("canvas"));
        }
    };

    return {
            create: function(config){ return new heatmap(config);}, 
            util: {
                mousePosition: function(ev){
                    // this doesn't work right
                    // rather use
                    /*
                        // this = element to observe
                        var x = ev.pageX - this.offsetLeft;
                        var y = ev.pageY - this.offsetTop;

                    */
                    var x, y;
                    if (ev.layerX) { // Firefox
                        x = ev.layerX;
                        y = ev.layerY;
                    } else if (ev.offsetX) { // Opera
                        x = ev.offsetX;
                        y = ev.offsetY;
                    }
                    if(typeof(x)=='undefined')
                        return;

                    return [x,y];
                }
            }
        };
    })();
    w.h337 = w.heatmapFactory = heatmapFactory;
})(window);