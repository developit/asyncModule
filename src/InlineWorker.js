define(function InlineWorker(require, exports, module) {
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
	
	return InlineWorker;
	
});
