asyncModule
===========

Run JS modules in their own threads.

---

Using with AMD
--------------

```JavaScript
define('myModule', asyncModule.create(function() {
	return {
		burnCpu : function(seconds) {
			var start = Date.now();
			while (Date.now()-start < seconds*1000) {}
			return "burned";
		}
	};
}));

require('myModule', function(myModule) {
	// note the added callback:
	myModule.burnCpu(2, function() {
		// no blocking!
	});
});
```

---

Barebones Example
-----------------

Without AMD, it's pretty much the same:  

```JavaScript
function myModule() {
	return {
		burnCpu : function(seconds) {
			var start = Date.now();
			while (Date.now()-start < seconds*1000) {}
			return "burned";
		}
	};
}

// terrible:
var sync = myModule();
sync.burnCpu(2);		// blocks

// Make an async version:
var myAsyncModule = asyncModule.create(myModule);

// Much better:
var async = myAsyncModule();
async.burnCpu(2, function() {
	// no blocking!
});
```
