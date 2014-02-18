(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	}
	else {
		root.asyncModule = factory();
	}
}(this, function() {
	"use strict";
	
	/**	Web Worker that accepts code instead of a URL.
	 *	@augments Worker
	 */
	function InlineWorker(code) {
		var api = window.URL || window.webkitURL || window.mozURL || window.msURL,
			blob = new Blob([code]);
		if (!api || !api.createObjectURL) {
			throw(new Error('Error: URL.createObjectURL is not available in this environment.'));
		}
		this.url = api.createObjectURL(blob),
		this.worker = new Worker(this.url);
		this.worker.addEventListener('message', this._handleMessage.bind(this));
		api.revokeObjectURL(blob);
	}
	/**	@ignore */
	InlineWorker.prototype._handleMessage = function() {
		if (this.onmessage) {
			this.onmessage.apply(this, arguments);
		}
	};
	InlineWorker.prototype.postMessage = function() {
		return this.worker.postMessage.apply(this.worker, arguments);
	};
	InlineWorker.prototype.addEventListener = function() {
		return this.worker.addEventListener.apply(this.worker, arguments);
	};
	

	return {
		InlineWorker : InlineWorker,
		create : function() {
			var exports = {},
				callbacks = {},
				rpcCounter = 0,
				open = 0,
				mq = [],
				initialized, worker, code,
				noop = function(){},
				buildWorker, compile, compileModule, apiMethod, exec, recv, processMq, mqTimer;
			exports.init = function(module, additionalNamedModules) {
				var inst, i,
					args = Array.prototype.slice.call(arguments);
				initialized = true;
				if (typeof args[0]==='string') {
					exports.name = args.splice(0, 1)[0];
				}
				code = compile.apply(compile, args);
				inst = args[0].call(inst={}, inst) || inst;
				for (i in inst) {
					if (typeof inst[i]==='function') {
						exports[i] = apiMethod.bind(exports, i);
					}
				}
				return exports;
			};
			buildWorker = function() {
				worker = new InlineWorker(code);
				worker.addEventListener('message', recv);
			};
			apiMethod = function(name, args) {
				var args = Array.prototype.slice.call(arguments, 1),
					callback = noop;
				if (typeof args[args.length-1]==='function') {
					callback = args.pop();
				}
				exec(name, args, callback);
			};
			compile = function(lib, additionalLibs) {
				var code = '//@ sourceURL='+(exports.name || lib.displayName || lib.name || (/^\s*function\s+(.*?)\s*\(/g).exec(Function.prototype.toString.call(lib))[1])+'.js\n',
					module;
				code += 'var window=this;addEventListener("message",function(e,a,r,i,s){s=[];for(i=0;i<e.data.length;i++){a=e.data[i];r=__main__[a.method].apply(__main__,a.params);s[i]={id:a.id,result:r};}postMessage(s);});\n';
				for (module in additionalLibs) {
					code += compileModule(module, additionalLibs[module]) + '\n';
				}
				code += compileModule('__main__', lib);
				return code;
			};
			compileModule = function(name, module) {
				var code = '';
				if (typeof module==='string') {
					code = module;
				}
				else if (typeof module==='function' || (module && module.apply)) {
					code = Function.prototype.toString.call(module).replace(/(^.*?\{|\}.*?$)/g,'');
				}
				if (code) {
					if (typeof name==='string') {
						code = 'this["'+name+'"]=(function(){var exports=this;\n'+code+'\nreturn exports;}).call({});';
					}
				}
				return code;
			};
			exec = function(method, params, callback) {
				var msg = {
					id : ++rpcCounter,
					method : method,
					params : params
				};
				if (initialized!==true) {
					throw('Async Module used before init.');
				}
				// lazy spawning
				if (!worker) {
					buildWorker();
				}
				open++;
				callbacks[rpcCounter+''] = callback;
				mq.push(msg);
				if (!mqTimer) {
					mqTimer = setTimeout(processMq, 1);
				}
			};
			recv = function(e) {
				var len = e.data.length,
					r, i;
				open -= len;
				for (var i=0; i<len; i++) {
					r = e.data[i];
					callbacks[r.id].call(exports, r.result, r.error);
					callbacks[r.id] = null;
				}
			};
			processMq = function() {
				if (mqTimer) {
					clearTimeout(mqTimer);
				}
				mqTimer = null;
				if (mq.length) {
					worker.postMessage(mq);
					mq = [];
				}
			};
			
			if (arguments && arguments.length) {
				exports.init.apply(exports, arguments);
			}
			return exports;
		}
	};
}));
