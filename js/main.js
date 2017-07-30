/*var greeter = require("./greeter.js");
console.log(greeter);*/

import greeter from "./greeter"
import Vue from "vue"

console.log(greeter);

var app1 = new Vue({
	el: "#app1",
	data: function(){
		return {
			text: greeter.text
		}
	}
})