asyncModule
===========

Run JavaScript modules in their own threads.  

> **Demo:** http://html5man.com/rnd/threads/  
> *Demo Source:* http://html5man.com/rnd/threads/modules/  

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

---

License
-------

> The MIT License (MIT)
> 
> Copyright (c) 2013 Jason Miller
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
> the Software, and to permit persons to whom the Software is furnished to do so,
> subject to the following conditions:
> 
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
> 
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/developit/asyncmodule/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

