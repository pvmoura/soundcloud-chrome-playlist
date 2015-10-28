/**************************
 *                         *
 * Array helper functions` *
 *                         *
 ***************************/
// returns an arbitrary integer in a given interval
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
  
Array.prototype.popByIndex = function (index) {
  var val = this[index];
  if (typeof(val) === 'undefined' || typeof(index) !== 'number') return false;
  
  for (var i=index+1, len=this.length; i < len; i++) {
    this[index] = this[i];
    index++;
  }
  
  this.pop();
  return val;
};

Array.prototype.popRandomIndex = function () {
  var index = getRandomInt(0, this.length - 1);
  return this.popByIndex(index);
};

NodeList.prototype.filterToArray = function (conditionFunc) {
  newArr = new Array;
  for (var i=0, len=this.length; i < len; i++) {
    if (conditionFunc(this[i])) newArr.push(this[i]);
  }
  return newArr;
};

NodeList.prototype.getRandomMember = function () {
  var index = getRandomInt(0, this.length - 1);
  return this[index];
};

// 
Array.prototype.indexOfByKeyVal = function (key, val, index) {
  var len = this.length, item;
  if (typeof index !== 'number' || index >= len)
    index = 0;
  index = parseInt(index, 10);
  
  for (len; index < len; index++) {
    item = this[index];
    if (item.hasOwnProperty(key) && item[key] === val)
      return index;
  }
  return false;
};

/**************************
 *                         *
 *  App helper functions ` *
 *                         *
 ***************************/
(function() {
  
  this.utils = {
    // wrapper for document.getElementById
    getById: function(id) {
      return document.getElementById(id);
    }

    // wrapper for SoundCloud API
    ,makeSCFunc: function(method, url, options, callback) {
      var responseCallback;
      
      callback = callback || function (data) { console.log(data); };
      responseCallback = function (response, error) {
        if (!error) {
          callback(response);
        } else {
          dispatchEvent('control', 'error', error);
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
    ,makeHTMLTag: function(tagName, options) {
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

    ,dispatchEvent: function(elemId, eventName, data, callback) {
      console.log('in dispatch', data, eventName);
      var evt = new CustomEvent( eventName, {
        'detail': { data: data, callback: callback } } ),
          elem = document.getElementById(elemId);
      elem.dispatchEvent(evt);
    }

    // show error message or other warning
    ,flashWarningMessage: function(error) {
      console.log('Oops there was an error, here it is:');
      console.log(error);
    }
  }
}).apply(soundCloudApp);