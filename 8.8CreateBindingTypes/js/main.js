// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509

(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;
	var isFirstActivation = true;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.voiceCommand) {
			// TODO: Handle relevant ActivationKinds. For example, if your app can be started by voice commands,
			// this is a good place to decide whether to populate an input field or choose a different initial view.
		}
		else if (args.detail.kind === activation.ActivationKind.launch) {
			// A Launch activation happens when the user launches your app via the tile
			// or invokes a toast notification by clicking or tapping on the body.
			if (args.detail.arguments) {
				// TODO: If the app supports toasts, use this value from the toast payload to determine where in the app
				// to take the user in response to them invoking a toast notification.
			}
			else if (args.detail.previousExecutionState === activation.ApplicationExecutionState.terminated) {
				// TODO: This application had been suspended and was then terminated to reclaim memory.
				// To create a smooth user experience, restore application state here so that it looks like the app never stopped running.
				// Note: You may want to record the time when the app was last suspended and only restore state if they've returned after a short period.
			}
		}

		if (!args.detail.prelaunchActivated) {
			// TODO: If prelaunchActivated were true, it would mean the app was prelaunched in the background as an optimization.
			// In that case it would be suspended shortly thereafter.
			// Any long-running operations (like expensive network or disk I/O) or changes to user state which occur at launch
			// should be done here (to avoid doing them in the prelaunch case).
			// Alternatively, this work can be done in a resume or visibilitychanged handler.
		}

		if (isFirstActivation) {
			// TODO: The app was activated and had not been running. Do general startup initialization here.
			document.addEventListener("visibilitychange", onVisibilityChanged);
			args.setPromise(WinJS.UI.processAll());
		}

		isFirstActivation = false;
	};

	function onVisibilityChanged(args) {
		if (!document.hidden) {
			// TODO: The app just became visible. This may be a good time to refresh the view.
		}
	}

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};


	app.onloaded = function () {
	    //得到Canvas的上下文
	    context = document.querySelector(".creatingBindableTypesOutputCanvas").getContext("2d");
        //绑定输入事件
	    bindInputs();
        //查询开始按钮注册事件
	    document.querySelector(".creatingBindableTypesStart").addEventListener("click",
            function () { sprite.start(); }, false);
        //查询停止按钮注册事件
	    document.querySelector(".creatingBindableTypesStop").addEventListener("click",
            function () { sprite.stop(); }, false);
	    
        //sprite的属性发生改变时执行对应方法
	    sprite.bind("position", onPositionChange);
	    sprite.bind("r", onColorChange);
	    sprite.bind("g", onColorChange);
	    sprite.bind("b", onColorChange);
	}

	app.start();


	var context;
    
    //定义一个类具备Observable行为
	var RectangleSprite = WinJS.Class.define(
        function (x, y, r, g, b) {
            this._initObservable();

            this.position = { x: x, y: y };
            this.r = r;
            this.g = g;
            this.b = b;
            this.dx = 3;
            this.dy = 3;

            this.timeout = null;
        }, {
            //开始
            start: function () {
                var that = this;
                if (this.timeout === null) {
                    //定时器，0.5秒执行_step方法
                    this.timeout = setInterval(function () { that._step(); }, 500);
                }

            },
            //停止
            stop: function () {
                if (this.timeout !== null) {
                    clearInterval(this.timeout);
                    this.timeout = null;
                }
            },
            //步进
            _step: function () {
                var x = this.position.x + this.dx;
                if (x < 0 || x > 150) {
                    this.dx = -this.dx;
                    x += this.dx;
                }

                var y = this.position.y + this.dy;
                if (y < 0 || y > 75) {
                    this.dy = -this.dy;
                    y += this.dy;
                }

                // 调用set方法重新制定Position的位置，这里的setter方法其实是WinJS.Class.mix提供的，内部已经绑定了setter方法的实现
                this.setProperty("position", { x: x, y: y });
            }
        },
        {
            rectangleSize: 75
        });

    // Now we mix in the binding mixin and define the event properties
	WinJS.Class.mix(RectangleSprite,
        WinJS.Binding.mixin,
        //支持Observable行为的属性
        WinJS.Binding.expandProperties({ position: 0, r: 0, g: 0, b: 0 })
    );

    
    //文本框定义颜色的类
	var NumericTextInput = WinJS.Class.define(
        function (element, selector, initialValue, valueChangeCallback) {
            this.element = element.querySelector(selector);
            this.element.value = initialValue;
            this._onchange();
            //当值发生改变的时候会调用_onchange方法
            element.addEventListener("change", this._onchange.bind(this));
            this.onvaluechange = valueChangeCallback;
        },
        {
            onvaluechange: function (newValue) { },
            //这边设置颜色的代码没有具体作用，主要是this.onvaluechange(value);
            _onchange: function () {
                var value = parseInt(this.element.value, 10);
                if (!isNaN(value)) {
                    this.onvaluechange(value);
                    this.element.color = "black";
                    WinJS.log && WinJS.log("", "sample", "status");
                } else {
                    this.element.color = "red";
                    WinJS.log && WinJS.log("Illegal value entered", "sample", "error");
                }
            }
        }
    );

    // 创建一个数据对象
	var sprite = new RectangleSprite(10, 10, 128, 128, 128);


    // 创建3个类分别设置文本框的事件
	function bindInputs() {
	    new NumericTextInput(document, ".creatingBindableTypesInputRed",
            sprite.r, function (v) { sprite.r = v; });
	    new NumericTextInput(document, ".creatingBindableTypesInputGreen",
            sprite.g, function (v) { sprite.g = v; });
	    new NumericTextInput(document, ".creatingBindableTypesInputBlue",
            sprite.b, function (v) { sprite.b = v; });
	}


    //位置发生改变的方法
	function onPositionChange(newValue, oldValue) {
	    if (oldValue) {
	        erase(oldValue.x, oldValue.y);
	    }
	    draw();
	}

    //颜色发生改变的方法
	function onColorChange(newValue, oldValue) {
	    draw();
	}

    // 清除原来的位置
	function erase(x, y) {
	    context.fillStyle = "rgb(29,29,29)";
	    context.fillRect(x, y, RectangleSprite.rectangleSize, RectangleSprite.rectangleSize);
	}

    // 绘制当前的位置
	function draw() {
	    var colors = [sprite.r, sprite.g, sprite.b];
	    context.fillStyle = "rgb(" + colors.join(",") + ")";
	    context.fillRect(sprite.position.x, sprite.position.y,
            RectangleSprite.rectangleSize, RectangleSprite.rectangleSize);
	}







})();
