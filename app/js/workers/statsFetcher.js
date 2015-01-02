/**
 * Created by Bouse on 01/01/2015
 */

self.addEventListener('message', function(e) {
	self.postMessage(e.data);
}, false);
