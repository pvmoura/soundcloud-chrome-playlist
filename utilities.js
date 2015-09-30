/**************************
 *                         *
 * Array helper functions` *
 *                         *
 ***************************/

Array.prototype.popByIndex = function (index) {
  var val = this[index];
  if (typeof(val) === 'undefined' || typeof(index) !== 'number') return false;
  
  for (var i=index+1, len=this.length; i < len; i++) {
    this[index] = this[i];
    index++;
  }
  
  this.pop();
  return val;
}

Array.prototype.popRandomIndex = function () {

  // returns an arbitrary integer in a given interval
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  
  var index = getRandomInt(0, this.length - 1);
  return this.popByIndex(index);
}

// 
Array.prototype.indexOfByKeyVal = function (key, val, index) {
  var item;
  if (typeof(index) !== 'number')
    index = 0;
  for (var len = this.length; index < len; index++) {
    item = this[index];
    if (typeof(item) === 'undefined' || item === null)
      continue;
    for (var objectKey in item) {
      if (item.hasOwnProperty(objectKey) && item[key] === val) {
        return index;
      }
    }
  }
  return false;
}

/**************************
 *                         *
 *  App helper functions ` *
 *                         *
 ***************************/

// wrapper for document.getElementById
function getById(id) {
  return document.getElementById(id);
}

function genericCallback (options, func) {
  return function() {
    func(options);
  }
}

function replaceClick(elem, func) {
  elem.removeEventListener('click');
  elem.addEventListener('click', func, false);
}

// wrapper for SoundCloud API
function makeSCFunc(method, url, callback, options) {
  if (typeof(options) === 'undefined')
    var options = global_options;
  if (typeof(callback) === 'undefined') 
    var callback = function (data) { console.log(data); };
  
  var responseCallback = function (response, error) {
    if (!error) {
      callback(response);
    } else {
      console.log('Oops. Here\'s the error: ' + error.message);
    }
  };
  
  return function () {
    SC[method](url, options, responseCallback);
  };
}

// HTML element generator
// param tagName - string the HTML tag to create
// param options - An object where keys are HTMLElement methods/properties,
// and values are what you want to assign to that HTMLElement method/property.
// One quirk: the key 'event' adds an event listener to the element, and so
// should have as value an object with a key 'name' with some event as a value
// ('click') for instance, and a key 'func' with a callback function as a value
function makeHTMLTag(tagName, options) {
  var elem = document.createElement(tagName);
  if (typeof(options) === 'undefined') options = {};

  for (var key in options) {
    if (options.hasOwnProperty(key) && options[key]) {
      if (key === 'event') {
        elem.addEventListener(
          options['event']['name'],
          options['event']['func'],
          false
        );
      } else {
        elem[key] = options[key];
      }
    }
  }
  return elem;
}

// show error message or other warning
function flashWarningMessage(message) {
  alert(message);
}