(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReactStickyState = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sticky = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.stickyNative = stickyNative;

var _react = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _fastscroll = require('fastscroll');

var _fastscroll2 = _interopRequireDefault(_fastscroll);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = function log() {};

var _globals = {
  featureTested: false
};

function stickyNative() {
  if (_globals.featureTested) {
    return _globals.canSticky;
  }
  if (typeof window !== 'undefined') {
    _globals.featureTested = true;

    if (window.Modernizr && window.Modernizr.hasOwnProperty('csspositionsticky')) {
      return _globals.canSticky = window.Modernizr.csspositionsticky;
    }

    _globals.canSticky = false;
    var testEl = document.createElement('div');
    document.documentElement.appendChild(testEl);
    var prefixedSticky = ['sticky', '-webkit-sticky'];

    for (var i = 0; i < prefixedSticky.length; i++) {
      testEl.style.position = prefixedSticky[i];
      _globals.canSticky = !!window.getComputedStyle(testEl).position.match('sticky');
      if (_globals.canSticky) {
        break;
      }
    }
    document.documentElement.removeChild(testEl);
  }
  return _globals.canSticky;
};

function getSrollPosition() {
  return window.scrollY || window.pageYOffset || 0;
}

function getDocumentHeight() {
  return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
}

function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + getSrollPosition();
  var height = fixedHeight || rect.height;
  return {
    top: top,
    bottom: top + height,
    height: height,
    width: rect.width
  };
}

function addBounds(rect1, rect2) {
  var rect = (0, _objectAssign2.default)({}, rect1);
  rect.top -= rect2.top;
  rect.bottom = rect.top + rect1.height;
  return rect;
}

function getPositionStyle(el) {
  var obj = {
    top: null,
    bottom: null
  };

  for (var key in obj) {
    var value = parseInt(window.getComputedStyle(el)[key]);
    value = isNaN(value) ? null : value;
    obj[key] = value;
  }

  return obj;
}

function getPreviousElementSibling(el) {
  var prev = el.previousElementSibling;
  if (prev && prev.tagName.toLocaleLowerCase() === 'script') {
    prev = getPreviousElementSibling(prev);
  }
  return prev;
}

var Sticky = function (_Component) {
  _inherits(Sticky, _Component);

  function Sticky(props, context) {
    _classCallCheck(this, Sticky);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sticky).call(this, props, context));

    _this._updatingBounds = false;
    _this._shouldComponentUpdate = false;

    _this._updatingState = false;
    _this._key = 'sticky_' + Math.round(Math.random() * 1000);

    if (props.debug) {
      log = console.log.bind(console);
    }

    _this.state = {
      sticky: false,
      fixedOffset: '',
      absolute: false,
      bounds: {
        top: null,
        bottom: null,
        height: null,
        width: null
      },
      restrict: {
        top: null,
        bottom: null,
        height: null,
        width: null
      },
      style: {
        top: null,
        bottom: null
      },
      disabled: props.disabled
    };
    return _this;
  }

  _createClass(Sticky, [{
    key: 'getBoundingClientRect',
    value: function getBoundingClientRect() {
      return this.refs.el.getBoundingClientRect();
    }
  }, {
    key: 'getBounds',
    value: function getBounds(noCache) {

      var clientRect = this.getBoundingClientRect();
      var offsetHeight = getDocumentHeight();

      if (noCache !== true && this.state.bounds.height !== null) {
        if (clientRect.height === this.state.bounds.height && this.state.offsetHeight === offsetHeight) {
          log('getBounds:: return cached values');
          return {
            offsetHeight: offsetHeight,
            style: this.state.style,
            bounds: this.state.bounds,
            restrict: this.state.restrict
          };
        }
      }

      log('getBounds:: (re)calculate values');

      var style = getPositionStyle(this.refs.el);
      var child = this.refs.wrapper || this.refs.el;
      var rect;
      var restrict;
      var offset = 0;

      if (!this.canSticky) {
        rect = getAbsolutBoundingRect(child, clientRect.height);
        if (this.hasOwnScrollTarget) {
          var parentRect = getAbsolutBoundingRect(this.scrollTarget);
          offset = this.fastScroll.scrollY;
          rect = addBounds(rect, parentRect);
          restrict = parentRect;
          restrict.top = 0;
          restrict.height = this.scrollTarget.scrollHeight || restrict.height;
          restrict.bottom = restrict.height;
        }
      } else {
        var elem = getPreviousElementSibling(child);
        offset = 0;

        if (elem) {
          offset = parseInt(window.getComputedStyle(elem)['margin-bottom']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offset += this.fastScroll.scrollY;
          }
          rect.top = rect.bottom + offset;
        } else {
          elem = child.parentNode;
          offset = parseInt(window.getComputedStyle(elem)['padding-top']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offset += this.fastScroll.scrollY;
          }
          rect.top = rect.top + offset;
        }
        if (this.hasOwnScrollTarget) {
          restrict = getAbsolutBoundingRect(this.scrollTarget);
          restrict.top = 0;
          restrict.height = this.scrollTarget.scrollHeight || restrict.height;
          restrict.bottom = restrict.height;
        }

        rect.height = child.clientHeight;
        rect.width = child.clientWidth;
        rect.bottom = rect.top + rect.height;
      }

      restrict = restrict || getAbsolutBoundingRect(child.parentNode);

      return {
        offsetHeight: offsetHeight,
        style: style,
        bounds: rect,
        restrict: restrict
      };
    }
  }, {
    key: 'updateBounds',
    value: function updateBounds() {
      var noCache = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var _this2 = this;

      var shouldComponentUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
      var cb = arguments[2];

      this._shouldComponentUpdate = shouldComponentUpdate;
      this.setState(this.getBounds(noCache), function () {
        _this2._shouldComponentUpdate = true;
        if (cb) {
          cb();
        }
      });
    }
  }, {
    key: 'getStickyState',
    value: function getStickyState() {

      if (this.state.disabled) {
        return { sticky: false, absolute: false };
      }

      var scrollY = this.fastScroll.scrollY;
      var top = this.state.style.top;
      var bottom = this.state.style.bottom;
      var sticky = this.state.sticky;
      var absolute = this.state.absolute;

      if (top !== null) {
        var offsetBottom = this.state.restrict.bottom - this.state.bounds.height - top;
        top = this.state.bounds.top - top;
        if ( /*this.state.sticky === false &&*/scrollY >= top && scrollY <= offsetBottom) {
          sticky = true;
          absolute = false;
        } else if ( /*this.state.sticky &&*/scrollY < top || scrollY > offsetBottom) {
          sticky = false;
          absolute = scrollY > offsetBottom;
        }
      } else if (bottom !== null) {

        scrollY += window.innerHeight;
        var offsetTop = this.state.restrict.top + this.state.bounds.height - bottom;
        bottom = this.state.bounds.bottom + bottom;

        if ( /*this.state.sticky === false &&*/scrollY <= bottom && scrollY >= offsetTop) {
          sticky = true;
          absolute = false;
        } else if ( /*this.state.sticky &&*/scrollY > bottom || scrollY < offsetTop) {
          sticky = false;
          absolute = scrollY < offsetTop;
        }
      }
      return { sticky: sticky, absolute: this.canSticky ? false : absolute };
    }
  }, {
    key: 'updateStickyState',
    value: function updateStickyState() {
      var _this3 = this;

      var bounds = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
      var cb = arguments[1];

      if (this._updatingState) {
        return;
      }
      var values = this.getStickyState();

      if (values.sticky !== this.state.sticky || values.absolute !== this.state.absolute) {
        this._updatingState = true;
        if (bounds) {
          values = (0, _objectAssign2.default)(values, this.getBounds());
        }
        this.setState(values, function () {
          _this3._updatingState = false;
          if (typeof cb === 'function') {
            cb();
          }
        });
        return true;
      } else if (typeof cb === 'function') {
        cb();
      }
      return false;
    }
  }, {
    key: 'updateFixedOffset',
    value: function updateFixedOffset() {
      if (this.hasOwnScrollTarget && !this.canSticky) {

        if (this.state.sticky) {
          this.setState({ fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px' });
          if (!this.hasWindowScrollListener) {
            this.hasWindowScrollListener = true;
            _fastscroll2.default.getInstance(window).on('scroll:progress', this.updateFixedOffset);
          }
        } else {
          this.setState({ fixedOffset: '' });
          if (this.hasWindowScrollListener) {
            this.hasWindowScrollListener = false;
            _fastscroll2.default.getInstance(window).off('scroll:progress', this.updateFixedOffset);
          }
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this4 = this;

      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


      if (!this._updatingBounds) {
        log('update():: force:' + force);
        this._updatingBounds = true;
        this.updateBounds(true, true, function () {
          _this4.fastScroll.updateScrollPosition();
          _this4.updateBounds(force, true, function () {
            _this4.fastScroll.updateScrollPosition();
            var updateSticky = _this4.updateStickyState(false, function () {
              if (force && !updateSticky) {
                _this4.forceUpdate();
              }
            });
            _this4._updatingBounds = false;
          });
        });
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var child = this.refs.wrapper || this.refs.el;
      this.scrollTarget = window.getComputedStyle(child.parentNode).overflow !== 'auto' ? window : child.parentNode;
      this.hasOwnScrollTarget = this.scrollTarget !== window;
      if (this.hasOwnScrollTarget) {
        this.updateFixedOffset = this.updateFixedOffset.bind(this);
      }

      this.addSrollHandler();
      this.addResizeHandler();
      this.update();
    }
  }, {
    key: 'addSrollHandler',
    value: function addSrollHandler() {
      if (!this.fastScroll) {
        this.fastScroll = _fastscroll2.default.getInstance(this.scrollTarget);
        this.onScroll = this.onScroll.bind(this);
        this.fastScroll.on('scroll:start', this.onScroll);
        this.fastScroll.on('scroll:progress', this.onScroll);
        this.fastScroll.on('scroll:stop', this.onScroll);
      }
    }
  }, {
    key: 'removeSrollHandler',
    value: function removeSrollHandler() {
      if (this.fastScroll) {
        this.fastScroll.off('scroll:start', this.onScroll);
        this.fastScroll.off('scroll:progress', this.onScroll);
        this.fastScroll.off('scroll:stop', this.onScroll);
      }
    }
  }, {
    key: 'addResizeHandler',
    value: function addResizeHandler() {
      if (!this.resizeHandler) {
        this.resizeHandler = this.onResize.bind(this);
        window.addEventListener('resize', this.resizeHandler, false);
        window.addEventListener('orientationchange', this.resizeHandler, false);
      }
    }
  }, {
    key: 'removeResizeHandler',
    value: function removeResizeHandler() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.resizeHandler);
        this.resizeHandler = null;
      }
    }
  }, {
    key: 'onScroll',
    value: function onScroll(e) {
      this.updateStickyState();
      this.updateFixedOffset();
    }
  }, {
    key: 'onResize',
    value: function onResize(e) {
      this.update();
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(newProps, newState) {
      return this._shouldComponentUpdate;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      if (props.disabled !== this.state.disabled) {
        this.setState({
          disabled: props.disabled
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this5 = this;

      setTimeout(function () {
        return _this5.initialize();
      }, 1);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._shouldComponentUpdate = false;
      this.removeSrollHandler();
      this.removeResizeHandler();

      //TODO optimize
      if (!this.fastScroll.dispatcher.hasListeners()) {
        this.fastScroll.destroy();
        // this.onScroll = null;
      }
      this.fastScroll = null;
      this.scrollTarget = null;
    }
  }, {
    key: 'render',
    value: function render() {

      var element = _react2.default.Children.only(this.props.children);

      var style;
      var refName = 'el';
      var className = (0, _classnames2.default)({ 'sticky': !this.state.disabled, 'sticky-disabled': this.state.disabled }, { 'sticky-fixed': !this.canSticky }, { 'is-sticky': this.state.sticky && !this.state.disabled }, { 'is-absolute': this.state.absolute });

      if (!this.canSticky) {
        if (this.state.absolute) {

          style = {
            marginTop: this.state.style.top !== null ? this.state.restrict.height - (this.state.bounds.height + this.state.style.top) + (this.state.restrict.top - this.state.bounds.top) + 'px' : '',
            marginBottom: this.state.style.bottom !== null ? this.state.restrict.height - (this.state.bounds.height + this.state.style.bottom) + (this.state.restrict.bottom - this.state.bounds.bottom) + 'px' : ''
          };
        } else if (this.hasOwnScrollTarget && this.state.fixedOffset !== '') {
          style = {
            marginTop: this.state.fixedOffset
          };
        }
      }

      if (element) {
        element = _react2.default.cloneElement(element, { ref: refName, key: this._key, style: style, className: (0, _classnames2.default)(element.props.className, className) });
      } else {
        var Comp = this.props.tagName;
        element = _react2.default.createElement(
          Comp,
          { ref: refName, key: this._key, style: style, className: className },
          this.props.children
        );
      }

      if (this.canSticky) {
        return element;
      }

      var height = this.state.disabled || this.state.bounds.height === null || !this.state.sticky && !this.state.absolute ? 'auto' : this.state.bounds.height + 'px';
      style = {
        height: height
      };
      if (this.state.absolute) {
        style.position = 'relative';
      }
      return _react2.default.createElement(
        'div',
        { ref: 'wrapper', className: 'sticky-wrap', style: style },
        element
      );
    }
  }, {
    key: 'canSticky',
    get: function get() {
      return stickyNative();
    }
  }]);

  return Sticky;
}(_react.Component);

Sticky.propTypes = {
  stickyClass: _react2.default.PropTypes.string,
  fixedClass: _react2.default.PropTypes.string,
  stateClass: _react2.default.PropTypes.string,
  disabled: _react2.default.PropTypes.bool,
  debug: _react2.default.PropTypes.bool,
  tagName: _react2.default.PropTypes.string
};
Sticky.defaultProps = {
  stickyClass: 'sticky',
  fixedClass: 'sticky-fixed',
  stateClass: 'is-sticky',
  debug: false,
  disabled: false,
  tagName: 'div'
};
exports.default = Sticky;
exports.Sticky = Sticky;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"classnames":2,"fastscroll":5,"object-assign":6}],2:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],3:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Sönke Kluth
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

(function(exports) {

    'use strict';

    var delegate = function(target, handler) {
        // Get any extra arguments for handler
        var args = [].slice.call(arguments, 2);

        // Create delegate function
        var fn = function() {

            // Call handler with arguments
            return handler.apply(target, args);
        };

        // Return the delegate function.
        return fn;
    };


    (typeof module != "undefined" && module.exports) ? (module.exports = delegate) : (typeof define != "undefined" ? (define(function() {
        return delegate;
    })) : (exports.delegate = delegate));

})(this);

},{}],4:[function(require,module,exports){
 'use strict';

 function isEmpty(obj) {
   for (var prop in obj) {
     if (obj.hasOwnProperty(prop)){
       return false;
     }
   }
   return true;
 }

var _instanceMap = {};

 var EventDispatcher = function() {
   this._eventMap = {};
   this._destroyed = false;
 };

 EventDispatcher.getInstance = function(key){
  if(!key){
    throw new Error('key must be');
  }
  return _instanceMap[key] || (_instanceMap[key] =  new EventDispatcher());
 };


 EventDispatcher.prototype.addListener = function(event, listener) {
   var listeners = this.getListener(event);
   if (!listeners) {
     this._eventMap[event] = [listener];
     return true;
   }

   if (listeners.indexOf(listener) === -1) {
     listeners.push(listener);
     return true;
   }
   return false;
 };

 EventDispatcher.prototype.addListenerOnce = function(event, listener) {
   var s = this;
   var f2 = function() {
     s.removeListener(event, f2);
     return listener.apply(this, arguments);
   };
   return this.addListener(event, f2);
 };

 EventDispatcher.prototype.removeListener = function(event, listener) {

  if(typeof listener === 'undefined'){
    return this.removeAllListener(event);
  }

   var listeners = this.getListener(event);
   if (listeners) {
     var i = listeners.indexOf(listener);
     if (i > -1) {
       listeners = listeners.splice(i, 1);
       if (!listeners.length) {
         delete(this._eventMap[event]);
       }
       return true;
     }
   }
   return false;
 };

 EventDispatcher.prototype.removeAllListener = function(event) {
   var listeners = this.getListener(event);
   if (listeners) {
     this._eventMap[event].length = 0;
     delete(this._eventMap[event]);
    return true;
   }
   return false;
 };

 EventDispatcher.prototype.hasListener = function(event) {
   return this.getListener(event) !== null;
 };

 EventDispatcher.prototype.hasListeners = function() {
   return (this._eventMap !== null && this._eventMap !== undefined && !isEmpty(this._eventMap));
 };

 EventDispatcher.prototype.dispatch = function(eventType, eventObject) {
   var listeners = this.getListener(eventType);

   if (listeners) {
     eventObject = eventObject || {};
     eventObject.type = eventType;
     eventObject.target = eventObject.target || this;

     var i = -1;
     while (++i < listeners.length) {
       listeners[i](eventObject);
     }
     return true;
   }
   return false;
 };

 EventDispatcher.prototype.getListener = function(event) {
   var result = this._eventMap ? this._eventMap[event] : null;
   return (result || null);
 };

 EventDispatcher.prototype.destroy = function() {
   if (this._eventMap) {
     for (var i in this._eventMap) {
       this.removeAllListener(i);
     }
     this._eventMap = null;
   }
   this._destroyed = true;
 };


 //Method Map
 EventDispatcher.prototype.on = EventDispatcher.prototype.bind = EventDispatcher.prototype.addEventListener = EventDispatcher.prototype.addListener;
 EventDispatcher.prototype.off = EventDispatcher.prototype.unbind = EventDispatcher.prototype.removeEventListener = EventDispatcher.prototype.removeListener;
 EventDispatcher.prototype.once = EventDispatcher.prototype.one = EventDispatcher.prototype.addListenerOnce;
 EventDispatcher.prototype.trigger = EventDispatcher.prototype.dispatchEvent = EventDispatcher.prototype.dispatch;

 module.exports = EventDispatcher;

},{}],5:[function(require,module,exports){
'use strict';

/*
 * FastScroll
 * https://github.com/soenkekluth/fastscroll
 *
 * Copyright (c) 2014 Sönke Kluth
 * Licensed under the MIT license.
 */

var delegate = require('delegatejs');
var EventDispatcher = require('eventdispatcher');
var _instanceMap = {};

var FastScroll = function(scrollTarget, options) {

  scrollTarget = scrollTarget || window;

  if(FastScroll.hasScrollTarget(scrollTarget)) {
    return FastScroll.getInstance(scrollTarget);
  }

  _instanceMap[scrollTarget] = this;

  this.options = options || {};

  if (!this.options.hasOwnProperty('animationFrame')) {
    this.options.animationFrame = true;
  }

  if(typeof window.requestAnimationFrame !== 'function') {
    this.options.animationFrame = false;
  }

  this.scrollTarget = scrollTarget;
  this.init();
};

FastScroll.___instanceMap = _instanceMap;

FastScroll.getInstance = function(scrollTarget, options) {
  scrollTarget = scrollTarget || window;
  return _instanceMap[scrollTarget] || (new FastScroll(scrollTarget, options));
};

FastScroll.hasInstance = function(scrollTarget) {
  return _instanceMap[scrollTarget] !== undefined;
};

FastScroll.hasScrollTarget = FastScroll.hasInstance;

FastScroll.clearInstance = function(scrollTarget) {
  scrollTarget = scrollTarget || window;
  if (FastScroll.hasInstance(scrollTarget)) {
    FastScroll.getInstance(scrollTarget).destroy();
    delete(_instanceMap[scrollTarget]);
  }
};

FastScroll.UP = 'up';
FastScroll.DOWN = 'down';
FastScroll.NONE = 'none';
FastScroll.LEFT = 'left';
FastScroll.RIGHT = 'right';

FastScroll.prototype = {

  destroyed: false,
  scrollY: 0,
  scrollX: 0,
  lastScrollY: 0,
  lastScrollX: 0,
  timeout: 0,
  speedY: 0,
  speedX: 0,
  stopFrames: 5,
  currentStopFrames: 0,
  firstRender: true,
  animationFrame: true,
  lastEvent: {
    type: null,
    scrollY: 0,
    scrollX: 0
  },

  scrolling: false,

  init: function() {
    this.dispatcher = new EventDispatcher();
    this.updateScrollPosition = (this.scrollTarget === window) ? delegate(this, this.updateWindowScrollPosition) : delegate(this, this.updateElementScrollPosition);
    this.updateScrollPosition();
    this.trigger = this.dispatchEvent;
    this.lastEvent.scrollY = this.scrollY;
    this.lastEvent.scrollX = this.scrollX;
    this.onScroll = delegate(this, this.onScroll);
    this.onNextFrame = delegate(this, this.onNextFrame);
    if (this.scrollTarget.addEventListener) {
      this.scrollTarget.addEventListener('mousewheel', this.onScroll, false);
      this.scrollTarget.addEventListener('scroll', this.onScroll, false);
    } else if (this.scrollTarget.attachEvent) {
      this.scrollTarget.attachEvent('onmousewheel', this.onScroll);
      this.scrollTarget.attachEvent('scroll', this.onScroll);
    }
  },

  destroy: function() {
    if (!this.destroyed) {
      this.cancelNextFrame();
      if (this.scrollTarget.addEventListener) {
        this.scrollTarget.removeEventListener('mousewheel', this.onScroll);
        this.scrollTarget.removeEventListener('scroll', this.onScroll);
      } else if (this.scrollTarget.attachEvent) {
        this.scrollTarget.detachEvent('onmousewheel', this.onScroll);
        this.scrollTarget.detachEvent('scroll', this.onScroll);
      }
      this.dispatcher.off();
      this.dispatcher = null;
      this.onScroll = null;
      this.updateScrollPosition = null;
      this.onNextFrame = null;
      this.scrollTarget = null;
      this.destroyed = true;
    }
  },

  getAttributes: function() {
    return {
      scrollY: this.scrollY,
      scrollX: this.scrollX,
      speedY: this.speedY,
      speedX: this.speedX,
      angle: 0,
      directionY: this.speedY === 0 ? FastScroll.NONE : ((this.speedY > 0) ? FastScroll.UP : FastScroll.DOWN),
      directionX: this.speedX === 0 ? FastScroll.NONE : ((this.speedX > 0) ? FastScroll.RIGHT : FastScroll.LEFT)
    };
  },

  updateWindowScrollPosition: function() {
    this.scrollY = window.scrollY || window.pageYOffset || 0;
    this.scrollX = window.scrollX || window.pageXOffset || 0;
  },

  updateElementScrollPosition: function() {
    this.scrollY = this.scrollTarget.scrollTop;
    this.scrollX = this.scrollTarget.scrollLeft;
  },

  onScroll: function() {
    this.currentStopFrames = 0;
    if (this.firstRender) {
      this.firstRender = false;
      if (this.scrollY > 1) {
        this.updateScrollPosition();
        this.dispatchEvent('scroll:progress');
        return;
      }
    }

    if (!this.scrolling) {
      this.scrolling = true;
      this.dispatchEvent('scroll:start');
      if (this.options.animationFrame) {
        this.nextFrameID = requestAnimationFrame(this.onNextFrame);
      }
    }
    if (!this.options.animationFrame) {
      clearTimeout(this.timeout);
      this.onNextFrame();
      var self = this;
      this.timeout = setTimeout(function() {
        self.onScrollStop();
      }, 100);
    }
  },

  onNextFrame: function() {

    this.updateScrollPosition();

    this.speedY = this.lastScrollY - this.scrollY;
    this.speedX = this.lastScrollX - this.scrollX;

    this.lastScrollY = this.scrollY;
    this.lastScrollX = this.scrollX;

    if (this.options.animationFrame && (this.scrolling && this.speedY === 0 && (this.currentStopFrames++ > this.stopFrames))) {
      this.onScrollStop();
      return;
    }

    this.dispatchEvent('scroll:progress');

    if (this.options.animationFrame) {
      this.nextFrameID = requestAnimationFrame(this.onNextFrame);
    }
  },

  onScrollStop: function() {
    this.scrolling = false;
    if (this.options.animationFrame) {
      this.cancelNextFrame();
      this.currentStopFrames = 0;
    }
    this.dispatchEvent('scroll:stop');
  },

  cancelNextFrame: function() {
    cancelAnimationFrame(this.nextFrameID);
  },

  dispatchEvent: function(type, eventObject) {
    eventObject = eventObject || this.getAttributes();

    if (this.lastEvent.type === type && this.lastEvent.scrollY === eventObject.scrollY && this.lastEvent.scrollX === eventObject.scrollX) {
      return;
    }

    this.lastEvent = {
      type: type,
      scrollY: eventObject.scrollY,
      scrollX: eventObject.scrollX
    };

    // eventObject.fastScroll = this;
    eventObject.target = this.scrollTarget;
    this.dispatcher.dispatch(type, eventObject);
  },

  on: function(event, listener) {
    return this.dispatcher.addListener(event, listener);
  },

  off: function(event, listener) {
    return this.dispatcher.removeListener(event, listener);
  }
};

module.exports = FastScroll;

},{"delegatejs":3,"eventdispatcher":4}],6:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}]},{},[1])(1)
});