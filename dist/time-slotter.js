(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeSlotter = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";function _slicedToArray(r,t){return _arrayWithHoles(r)||_iterableToArrayLimit(r,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(r,t){var e=[],n=!0,o=!1,i=void 0;try{for(var a,s=r[Symbol.iterator]();!(n=(a=s.next()).done)&&(e.push(a.value),!t||e.length!==t);n=!0);}catch(r){o=!0,i=r}finally{try{n||null==s.return||s.return()}finally{if(o)throw i}}return e}function _arrayWithHoles(r){if(Array.isArray(r))return r}function timeDrift(r,t){if(!/^\d\d.\d\d(.\d\d)?$/.test(r))throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', where the colon can be replaced by a non-numerical character");var e=_slicedToArray(r.split(/[.:\- ]/).map(function(r){return Number(r)}),3),n=e[0],o=e[1],i=e[2];if(n>23||n<0)throw new Error("Hours must be between 0 and 23");if(o>59||o<0)throw new Error("Minutes must be between 0 and 59");if(null!=i&&(i>59||i<0))throw new Error("Seconds must be between 0 and 59");if(t&&("string"!=typeof t||t.length>1))throw new Error("Separator must be a single, non-numerical character");function a(r,t){if("number"!=typeof r)throw new Error("First argument of ".concat(t," method must be a number"))}function s(r,t){if("string"!=typeof r)throw new Error("Second argument of ".concat(t," method must be a string representing the unit of time"));var e=r.charAt(0).toLowerCase();if(!["h","m","s"].includes(e))throw new Error("Second argument of ".concat(t," method must be hours, minutes or seconds"));if("s"===e&&null==i)throw new Error("You can't adjust seconds if they weren't included in the original time given");return e}var u={normalize:function(r){return null==i&&r.pop(),r.map(function(r){return(r=String(r)).length<2?"0"+r:r}).join(t||":")},hasCrossedMidnight:!1,add:function(r,t){switch(a(r,"add"),this.hasCrossedMidnight=!1,s(t,"add")){case"h":this.hasCrossedMidnight=Boolean(Math.floor((n+r)/24)),n=(n+r)%24;break;case"m":var e=Math.floor((o+r)/60);o=(o+r)%60,this.add(e,"h");break;case"s":var u=Math.floor((i+r)/60);i=(i+r)%60,this.add(u,"m")}return this},subtract:function(r,t){a(r,"subtract"),this.hasCrossedMidnight=!1;var e=0;switch(s(t,"subtract")){case"h":for(var u=n-r;u<0;)e++,u=24+u;n=u,e&&(this.hasCrossedMidnight=!0);break;case"m":for(var h=o-r;h<0;)e++,h=60+h;o=h,e&&this.subtract(e,"h");break;case"s":for(var c=i-r;c<0;)e++,c=60+c;i=c,e&&this.subtract(e,"m")}return this}};return Object.defineProperty(u,"val",{get:function(){return this.normalize([n,o,i])}}),u.add=u.add.bind(u),u.subtract=u.subtract.bind(u),u}module.exports=timeDrift;

},{}]},{},[1])(1)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
"use strict";

var timeDrift = require('time-drift');

module.exports = function () {
  var VALID_OPTIONS = ['units', 'spacer', 'spacerUnits', 'includeOverflow', 'pushToEndTime'];
  var warnMsg = {
    DURATION_TOO_LARGE: 'The duration is too large to create even one time-slot within the times given',
    UNRECOGNISED_OPTION: function UNRECOGNISED_OPTION(option) {
      return "Unrecognised '".concat(option, "' option was provided");
    }
  };
  var errMsg = {
    NO_DURATION: 'You must include a positive duration value as the third argument',
    MISSING_ARGS: 'You must enter a start and an end value as the first and second arguments'
  };

  var _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _crossedOverMidnightCount,
      _spacer,
      _spacerUnits,
      _pushToEndTime,
      _includeOverflow,
      _finished;

  function createTimeslots(start, end, slotDuration) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (!start || !end) {
      throw new Error(errMsg.MISSING_ARGS);
    }

    if (!slotDuration) {
      throw new Error(errMsg.NO_DURATION);
    } // Check that valid options were given


    Object.keys(options).forEach(function (option) {
      if (!VALID_OPTIONS.includes(option)) {
        console.warn(warnMsg.UNRECOGNISED_OPTION(option));
      }
    }); // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another

    var initialTime = options.pushToEndTime ? end : start;
    _slots = [];
    _finished = false;
    _crossedOverMidnightCount = 0;
    _timeObject = timeDrift(initialTime, options.delimiter);
    _slotDuration = slotDuration;
    _units = options.units || 'm';
    _pushToEndTime = options.pushToEndTime || false;
    _spacer = options.spacer;
    _spacerUnits = options.spacerUnits || 'm';
    _includeOverflow = options.includeOverflow;
    _shouldCrossMidnight = false; // I put the start and end through the timeDrift package
    // to ensure they have the same format, so that comparing
    // isn't effected by different delimiters

    _start = timeDrift(start, options.delimiter).val;
    _end = timeDrift(end, options.delimiter).val;

    _checkIsValid();

    _slots = start < end ? _noMidnightCrossing() : _crossesMidnight();

    if (options.joinOn) {
      return _slots.map(function (slotPair) {
        return slotPair.join(options.joinOn);
      });
    }

    return _slots;
  } // finish immediately if the _slotDuration is too small for even
  // one time-slot


  function _checkIsValid() {
    var testTime = timeDrift(_start).add(_slotDuration, _units);

    if (_start < _end) {
      if (testTime.val > _end || testTime.hasCrossedMidnight) {
        _finished = true;
        console.warn(warnMsg.DURATION_TOO_LARGE);
      }
    } else {
      if (testTime.val > _end && testTime.hasCrossedMidnight) {
        _finished = true;
        console.warn(warnMsg.DURATION_TOO_LARGE);
      }
    }
  }

  function _checkIsMidnightCrossed() {
    // this was an extra check needed for some boundary conditions
    // to ensure that if midnight was passed when not expected to
    // from the start and end times, _finished is set to true
    if (_crossedOverMidnightCount && !_shouldCrossMidnight) {
      _finished = true;
    } // if midnight is passed more than once we definitely
    // need to finish


    if (_crossedOverMidnightCount > 1) {
      _finished = true;
    }

    if (_timeObject.hasCrossedMidnight) {
      _crossedOverMidnightCount++;
    }
  } // when pushToEndTime is false, we begin at the start time and work our
  // way forward to the end time


  function _incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits);

      _checkIsMidnightCrossed();
    }
  } // when pushToEndTime is true, we begin at the end time and work our
  // way backwards to the start time


  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val);

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits);

      _checkIsMidnightCrossed();
    }
  } // if no crossing over the midnight threshold is involved
  // in creating the required time-slots, this logic will
  // be used


  function _noMidnightCrossing() {
    // _shouldCrossMidnight = false
    if (_pushToEndTime) {
      while (_timeObject.val >= _start && !_finished) {
        _decrementTime();
      }
    } else {
      while (_timeObject.val <= _end && !_finished) {
        _incrementTime();
      }
    }

    return _slots;
  } // if the time-slots required involve a crossing over the midnight
  // threshhold, we need this logic before it gets to midnight


  function _crossesMidnight() {
    _shouldCrossMidnight = true;

    while (!_crossedOverMidnightCount) {
      if (_pushToEndTime) {
        _decrementTime();
      } else {
        _incrementTime();
      }
    }

    return _noMidnightCrossing();
  }

  function _addSlotToBack(pre, post) {
    _checkIsMidnightCrossed(); //we definitely don't want a slot if it begins on the end time, unless
    // the start and end times given were the same


    if (pre === _end && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true;
    }

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the end time
      if (pre < _end && post > _end) {
        _finished = true;
      }

      if (pre < _end && post < _end && _timeObject.hasCrossedMidnight) {
        _finished = true;
      } // if the end time is midnight or close to it, the post
      // and pre values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the end time


      if (pre > _end && post > _end && pre > post) {
        _finished = true;
      }
    }

    if (!_finished) {
      _slots.push([pre, post]);
    }
  }

  function _addSlotToFront(post, pre) {
    _checkIsMidnightCrossed(); // we definitely don't want a slot if it ends on the start time
    // the start and end times given were the same


    if (post === _start && !(_start === _end && !_crossedOverMidnightCount)) {
      _finished = true;
    }

    if (!_includeOverflow) {
      // condition to eliminate timeslots that bridge over the start time
      if (post > _start && pre < _start) {
        _finished = true;
      }

      if (post > _start && pre > _start && _timeObject.hasCrossedMidnight) {
        _finished = true;
      } // if the start time is midnight or close to it, the pre
      // and post values may be either side of the midnight and
      // require this condition to realise the time-slots bridge
      // the start time


      if (post > _start && pre > _start && post < pre) {
        _finished = true;
      }
    }

    if (!_finished) {
      _slots.unshift([pre, post]);
    }
  }

  return createTimeslots;
}();

},{"time-drift":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdGltZS1kcmlmdC9kaXN0L25vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL3RpbWUtZHJpZnQvZGlzdC9zcmMvdGltZS1kcmlmdC5qcyIsInNyYy90aW1lLXNsb3R0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUNBQSx1aEJBRUEsU0FBUyxVQUFXLEVBQU0sR0FJeEIsSUFIbUIsc0JBR0gsS0FBSyxHQUNuQixNQUFNLElBQUksTUFBTSxxSUFJbEIsSUFUbUMsRUFBQSxlQVNaLEVBQUssTUFBTSxXQUFXLElBQUksU0FBQSxHQUFTLE9BQUksT0FBTyxLQVRsQyxHQVU5QixFQVY4QixFQUFBLEdBVXZCLEVBVnVCLEVBQUEsR0FVZCxFQVZjLEVBQUEsR0FhbkMsR0FBRyxFQUFRLElBQU0sRUFBUSxFQUN2QixNQUFNLElBQUksTUFBTSxrQ0FJbEIsR0FBRyxFQUFVLElBQU0sRUFBVSxFQUMzQixNQUFNLElBQUksTUFBTSxvQ0FJbEIsR0FBYyxNQUFYLElBQW9CLEVBQVUsSUFBTSxFQUFVLEdBQy9DLE1BQU0sSUFBSSxNQUFNLG9DQUlsQixHQUFHLElBQW1DLGlCQUFkLEdBQTBCLEVBQVUsT0FBUyxHQUNuRSxNQUFNLElBQUksTUFBTSx1REFJbEIsU0FBUyxFQUFhLEVBQUssR0FDekIsR0FBbUIsaUJBQVIsRUFDVCxNQUFNLElBQUksTUFBSixxQkFBQSxPQUErQixFQUEvQiw2QkFJVixTQUFTLEVBQWMsRUFBTSxHQUUzQixHQUFvQixpQkFBVCxFQUNULE1BQU0sSUFBSSxNQUFKLHNCQUFBLE9BQWdDLEVBQWhDLDJEQUtSLElBQUksRUFBVyxFQUFLLE9BQU8sR0FBRyxjQUc5QixJQUFLLENB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Q0FBQyxTQUFMLEVBQWdCO0FBQ2QsTUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLENBQUMsR0FBRCxFQUFNLElBQU4sQ0FBWjtBQUNEO0FBQ0Y7O0FBRUQsV0FBUyxlQUFULENBQTBCLElBQTFCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ25DLElBQUEsdUJBQXVCLEdBRFksQ0FHbkM7QUFDQTs7O0FBQ0EsUUFBSSxJQUFJLEtBQUssTUFBVCxJQUFtQixFQUFFLE1BQU0sS0FBSyxJQUFYLElBQW1CLENBQUMseUJBQXRCLENBQXZCLEVBQXlFO0FBQ3ZFLE1BQUEsU0FBUyxHQUFHLElBQVo7QUFDRDs7QUFFRCxRQUFJLENBQUMsZ0JBQUwsRUFBdUI7QUFDckI7QUFDQSxVQUFJLElBQUksR0FBRyxNQUFQLElBQWlCLEdBQUcsR0FBRyxNQUEzQixFQUFtQztBQUNqQyxRQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0Q7O0FBRUQsVUFBSSxJQUFJLEdBQUcsTUFBUCxJQUFpQixHQUFHLEdBQUcsTUFBdkIsSUFBaUMsV0FBVyxDQUFDLGtCQUFqRCxFQUFxRTtBQUNuRSxRQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0QsT0FSb0IsQ0FVckI7QUFDQTtBQUNBO0FBQ0E7OztBQUNBLFVBQUssSUFBSSxHQUFHLE1BQVAsSUFBaUIsR0FBRyxHQUFHLE1BQXhCLElBQW1DLElBQUksR0FBRyxHQUE5QyxFQUFtRDtBQUNqRCxRQUFBLFNBQVMsR0FBRyxJQUFaO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNkLE1BQUEsTUFBTSxDQUFDLE9BQVAsQ0FBZSxDQUFDLEdBQUQsRUFBTSxJQUFOLENBQWY7QUFDRDtBQUVGOztBQUVELFNBQU8sZUFBUDtBQUVELENBNU9nQixFQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIlxuXG5mdW5jdGlvbiB0aW1lRHJpZnQgKHRpbWUsIHNlcGFyYXRvcikge1xuICBjb25zdCB0aW1lRm9ybWF0ID0gL15cXGRcXGQuXFxkXFxkKC5cXGRcXGQpPyQvXG5cbiAgLy8gQ2hlY2sgdGhhdCB0aGUgdGltZSBmb3JtYXQgaXMgY29ycmVjdFxuICBpZiAoIXRpbWVGb3JtYXQudGVzdCh0aW1lKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlRpbWUgZm9ybWF0IGlzIGluY29ycmVjdC4gSXQgc2hvdWxkIGJlIGVpdGhlciAnSEg6TU06U1MnIG9yICdISDpNTScsIFxcXG53aGVyZSB0aGUgY29sb24gY2FuIGJlIHJlcGxhY2VkIGJ5IGEgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcIilcbiAgfVxuXG4gIGNvbnN0IHRpbWVDb21wb25lbnRzID0gdGltZS5zcGxpdCgvWy46XFwtIF0vKS5tYXAoY29tcG9uZW50ID0+IE51bWJlcihjb21wb25lbnQpKVxuICBsZXQgW2hvdXJzLCBtaW51dGVzLCBzZWNvbmRzXSA9IHRpbWVDb21wb25lbnRzXG5cbiAgLy8gY2hlY2sgaG91cnMgYXJlIHdpdGhpbiB2YWxpZCByYW5nZVxuICBpZihob3VycyA+IDIzIHx8IGhvdXJzIDwgMCl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdIb3VycyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgMjMnKVxuICB9XG5cbiAgLy8gY2hlY2sgbWludXRlcyBhcmUgd2l0aGluIHZhbGlkIHJhbmdlXG4gIGlmKG1pbnV0ZXMgPiA1OSB8fCBtaW51dGVzIDwgMCl7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdNaW51dGVzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCA1OScpXG4gIH1cblxuICAvLyBjaGVjayBzZWNvbmRzIGFyZSB3aXRoaW4gdmFsaWQgcmFuZ2VcbiAgaWYoc2Vjb25kcyAhPSBudWxsICYmIChzZWNvbmRzID4gNTkgfHwgc2Vjb25kcyA8IDApKXtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlY29uZHMgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDU5JylcbiAgfVxuXG4gIC8vIGNoZWNrIHNlcGFyYXRvciBpcyBzaW5nbGUgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcbiAgaWYoc2VwYXJhdG9yICYmICh0eXBlb2Ygc2VwYXJhdG9yICE9PSAnc3RyaW5nJyB8fCBzZXBhcmF0b3IubGVuZ3RoID4gMSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcGFyYXRvciBtdXN0IGJlIGEgc2luZ2xlLCBub24tbnVtZXJpY2FsIGNoYXJhY3RlcicpXG4gIH1cblxuICAvLyBjaGVjayB0aGF0IHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgYWRkIGFuZCBzdWJ0cmFjdCBtZXRob2RzIGlzIGEgbnVtYmVyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTnVtIChudW0sIG1ldGhvZCkge1xuICAgIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaXJzdCBhcmd1bWVudCBvZiAke21ldGhvZH0gbWV0aG9kIG11c3QgYmUgYSBudW1iZXJgKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlVW5pdCAodW5pdCwgbWV0aG9kKSB7XG4gICAgLy8gY2hlY2sgdGhhdCB0aGUgdW5pdCBpcyBhIHN0cmluZ1xuICAgIGlmICh0eXBlb2YgdW5pdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU2Vjb25kIGFyZ3VtZW50IG9mICR7bWV0aG9kfSBtZXRob2QgbXVzdCBiZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHVuaXQgb2YgdGltZWApXG4gICAgfVxuXG4gICAgLy8ganVzdCBncmFiIHRoZSBmaXJzdCBsZXR0ZXIgb2YgdGhlIHVuaXQgYW5kIGxvd2VyY2FzZSBpdC4gVGhpcyBpcyBlbm91Z2ggdG8gZGlzdGluZ3Vpc2ggYmV0d2VlblxuICAgIC8vIHVuaXRzXG4gICAgbGV0IHVuaXRDaGFyID0gdW5pdC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKVxuXG4gICAgLy8gY2hlY2sgdGhlIHRpbWUgdW5pdCB1c2VkIGJlZ2lucyB3aXRoIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHdvcmRzICdob3VycycsICdtaW51dGVzJywgb3IgJ3NlY29uZHMnXG4gICAgaWYgKCFbJ2gnLCdtJywncyddLmluY2x1ZGVzKHVuaXRDaGFyKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZWNvbmQgYXJndW1lbnQgb2YgJHttZXRob2R9IG1ldGhvZCBtdXN0IGJlIGhvdXJzLCBtaW51dGVzIG9yIHNlY29uZHNgKVxuICAgIH1cblxuICAgIC8vIGVuc3VyZSB0aGF0IG5vIGNhbGN1bGF0aW9ucyBpbnZvbHZpbmcgc2Vjb25kcyBjYW4gYmUgcGVyZm9ybWVkIGlmIG5vIHNlY29uZHMgd2VyZSBzdGF0ZWQgaW4gdGhlXG4gICAgLy8gb3JpZ2luYWwgdGltZSB0byBiZSBjaGFuZ2VkXG4gICAgaWYgKHVuaXRDaGFyID09PSAncycgJiYgc2Vjb25kcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFlvdSBjYW4ndCBhZGp1c3Qgc2Vjb25kcyBpZiB0aGV5IHdlcmVuJ3QgaW5jbHVkZWQgaW4gdGhlIG9yaWdpbmFsIHRpbWUgZ2l2ZW5gKVxuICAgIH1cblxuICAgIHJldHVybiB1bml0Q2hhclxuICB9XG5cbiAgY29uc3QgcmVzcG9uc2UgPSB7XG4gICAgbm9ybWFsaXplIChyZXR1cm5BcnJheSkge1xuICAgICAgLy8gaWYgbm8gc2Vjb25kcyB3ZXJlIGluY2x1ZGVkLCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBhcnJheVxuICAgICAgLy8gd2hpY2ggd2lsbCBiZSB1bmRlZmluZWRcbiAgICAgIGlmIChzZWNvbmRzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuQXJyYXkucG9wKClcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGVhY2ggcGFydCBvZiB0aGUgdGltZSwgZW5zdXJlIHRoYXQgaWYgaXQgaXMgbGVzc1xuICAgICAgLy8gdGhhbiAxMCwgdGhhdCBpdCBoYXMgYSBwcmVjZWRpbmcgMFxuICAgICAgcmV0dXJuIHJldHVybkFycmF5Lm1hcChmdW5jdGlvbihwYXJ0KXtcbiAgICAgICAgcGFydCA9IFN0cmluZyhwYXJ0KVxuICAgICAgICByZXR1cm4gcGFydC5sZW5ndGggPCAyID8gJzAnICsgcGFydCA6IHBhcnRcbiAgICAgIH0pLmpvaW4oc2VwYXJhdG9yIHx8ICc6JylcbiAgICB9LFxuXG4gICAgaGFzQ3Jvc3NlZE1pZG5pZ2h0OiBmYWxzZSxcblxuICAgIC8vIFRoaXMgaXMgYSBzZWxmLXJlZmVyZW5jaW5nIG1ldGhvZFxuICAgIGFkZCAobnVtLCB1bml0KSB7XG4gICAgICB2YWxpZGF0ZU51bShudW0sICdhZGQnKVxuICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSBmYWxzZVxuICAgICAgY29uc3QgdW5pdEZpcnN0Q2hhciA9IHZhbGlkYXRlVW5pdCh1bml0LCAnYWRkJylcbiAgICAgIHN3aXRjaCh1bml0Rmlyc3RDaGFyKXtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgICB0aGlzLmhhc0Nyb3NzZWRNaWRuaWdodCA9IEJvb2xlYW4oTWF0aC5mbG9vcigoaG91cnMgKyBudW0pLzI0KSlcbiAgICAgICAgaG91cnMgPSAoaG91cnMgKyBudW0pICUgMjRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ20nOlxuICAgICAgICBsZXQgaG91cnNUb0FkZCA9IE1hdGguZmxvb3IoKG1pbnV0ZXMgKyBudW0pLzYwKVxuICAgICAgICBtaW51dGVzID0gKG1pbnV0ZXMgKyBudW0pICUgNjBcbiAgICAgICAgdGhpcy5hZGQoaG91cnNUb0FkZCwgJ2gnKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncyc6XG4gICAgICAgIGxldCBtaW51dGVzVG9BZGQgPSBNYXRoLmZsb29yKChzZWNvbmRzICsgbnVtKS82MClcbiAgICAgICAgc2Vjb25kcyA9IChzZWNvbmRzICsgbnVtKSAlIDYwXG4gICAgICAgIHRoaXMuYWRkKG1pbnV0ZXNUb0FkZCwgJ20nKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBpcyBhIHNlbGYtcmVmZXJlbmNpbmcgbWV0aG9kXG4gICAgc3VidHJhY3QgKG51bSwgdW5pdCkge1xuICAgICAgdmFsaWRhdGVOdW0obnVtLCAnc3VidHJhY3QnKVxuICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSBmYWxzZVxuICAgICAgY29uc3QgdW5pdEZpcnN0Q2hhciA9IHZhbGlkYXRlVW5pdCh1bml0LCAnc3VidHJhY3QnKVxuICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgIHN3aXRjaCh1bml0Rmlyc3RDaGFyKXtcbiAgICAgIGNhc2UgJ2gnOlxuICAgICAgICBsZXQgaG91ckFuc3dlciA9IGhvdXJzIC0gbnVtXG4gICAgICAgIHdoaWxlKGhvdXJBbnN3ZXIgPCAwKXtcbiAgICAgICAgICBjb3VudCArK1xuICAgICAgICAgIGhvdXJBbnN3ZXIgPSAyNCArIGhvdXJBbnN3ZXJcbiAgICAgICAgfVxuICAgICAgICBob3VycyA9IGhvdXJBbnN3ZXJcbiAgICAgICAgaWYgKGNvdW50KSB7XG4gICAgICAgICAgdGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ20nOlxuICAgICAgICBsZXQgbWludXRlQW5zd2VyID0gbWludXRlcyAtIG51bVxuICAgICAgICB3aGlsZShtaW51dGVBbnN3ZXIgPCAwKXtcbiAgICAgICAgICBjb3VudCArK1xuICAgICAgICAgIG1pbnV0ZUFuc3dlciA9IDYwICsgbWludXRlQW5zd2VyXG4gICAgICAgIH1cbiAgICAgICAgbWludXRlcyA9IG1pbnV0ZUFuc3dlclxuICAgICAgICBpZihjb3VudCl7XG4gICAgICAgICAgdGhpcy5zdWJ0cmFjdChjb3VudCwgJ2gnKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzJzpcbiAgICAgICAgbGV0IHNlY29uZEFuc3dlciA9IHNlY29uZHMgLSBudW1cbiAgICAgICAgd2hpbGUoc2Vjb25kQW5zd2VyIDwgMCl7XG4gICAgICAgICAgY291bnQgKytcbiAgICAgICAgICBzZWNvbmRBbnN3ZXIgPSA2MCArIHNlY29uZEFuc3dlclxuICAgICAgICB9XG4gICAgICAgIHNlY29uZHMgPSBzZWNvbmRBbnN3ZXJcbiAgICAgICAgaWYoY291bnQpe1xuICAgICAgICAgIHRoaXMuc3VidHJhY3QoY291bnQsICdtJylcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzcG9uc2UsICd2YWwnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUoW2hvdXJzLCBtaW51dGVzLCBzZWNvbmRzXSlcbiAgICB9XG4gIH0pXG5cbiAgcmVzcG9uc2UuYWRkID0gcmVzcG9uc2UuYWRkLmJpbmQocmVzcG9uc2UpXG4gIHJlc3BvbnNlLnN1YnRyYWN0ID0gcmVzcG9uc2Uuc3VidHJhY3QuYmluZChyZXNwb25zZSlcblxuICByZXR1cm4gcmVzcG9uc2Vcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aW1lRHJpZnQiLCJjb25zdCB0aW1lRHJpZnQgPSByZXF1aXJlKCd0aW1lLWRyaWZ0JylcblxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gKCkge1xuICBjb25zdCBWQUxJRF9PUFRJT05TID0gWyAndW5pdHMnLCAnc3BhY2VyJywgJ3NwYWNlclVuaXRzJywgJ2luY2x1ZGVPdmVyZmxvdycsICdwdXNoVG9FbmRUaW1lJ11cblxuICBjb25zdCB3YXJuTXNnID0ge1xuICAgIERVUkFUSU9OX1RPT19MQVJHRTogJ1RoZSBkdXJhdGlvbiBpcyB0b28gbGFyZ2UgdG8gY3JlYXRlIGV2ZW4gb25lIHRpbWUtc2xvdCB3aXRoaW4gdGhlIHRpbWVzIGdpdmVuJyxcbiAgICBVTlJFQ09HTklTRURfT1BUSU9OOiAob3B0aW9uKSA9PiBgVW5yZWNvZ25pc2VkICcke29wdGlvbn0nIG9wdGlvbiB3YXMgcHJvdmlkZWRgXG4gIH1cblxuICBjb25zdCBlcnJNc2cgPSB7XG4gICAgTk9fRFVSQVRJT046ICdZb3UgbXVzdCBpbmNsdWRlIGEgcG9zaXRpdmUgZHVyYXRpb24gdmFsdWUgYXMgdGhlIHRoaXJkIGFyZ3VtZW50JyxcbiAgICBNSVNTSU5HX0FSR1M6ICdZb3UgbXVzdCBlbnRlciBhIHN0YXJ0IGFuZCBhbiBlbmQgdmFsdWUgYXMgdGhlIGZpcnN0IGFuZCBzZWNvbmQgYXJndW1lbnRzJ1xuICB9XG5cbiAgbGV0IF90aW1lT2JqZWN0ID0ge30sXG4gICAgICBfc2xvdER1cmF0aW9uLFxuICAgICAgX3N0YXJ0LFxuICAgICAgX2VuZCxcbiAgICAgIF9zbG90cyxcbiAgICAgIF91bml0cyxcbiAgICAgIF9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQsXG4gICAgICBfc3BhY2VyLFxuICAgICAgX3NwYWNlclVuaXRzLFxuICAgICAgX3B1c2hUb0VuZFRpbWUsXG4gICAgICBfaW5jbHVkZU92ZXJmbG93LFxuICAgICAgX2ZpbmlzaGVkXG5cbiAgZnVuY3Rpb24gY3JlYXRlVGltZXNsb3RzKHN0YXJ0LCBlbmQsIHNsb3REdXJhdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKCFzdGFydCB8fCAhZW5kKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnLk1JU1NJTkdfQVJHUylcbiAgICB9XG5cbiAgICBpZiAoIXNsb3REdXJhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZy5OT19EVVJBVElPTilcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGF0IHZhbGlkIG9wdGlvbnMgd2VyZSBnaXZlblxuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgIGlmICghVkFMSURfT1BUSU9OUy5pbmNsdWRlcyhvcHRpb24pKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybih3YXJuTXNnLlVOUkVDT0dOSVNFRF9PUFRJT04ob3B0aW9uKSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gdGhpcyB3aWxsIGJlIGEgc2luZ2xldG9uIGluIGEgbm9kZSBhcHAsIHNvIGl0IGlzIGltcG9ydGFudFxuICAgIC8vIHRvIHJlc2V0IGFsbCB0aGUgdmFyaWFibGVzIHNvIHRoYXQgb25lIGludm9jYXRpb24gZG9lc24ndFxuICAgIC8vIGVmZmVjdCBhbm90aGVyXG4gICAgbGV0IGluaXRpYWxUaW1lID0gb3B0aW9ucy5wdXNoVG9FbmRUaW1lID8gZW5kIDogc3RhcnRcbiAgICBfc2xvdHMgPSBbXVxuICAgIF9maW5pc2hlZCA9IGZhbHNlXG4gICAgX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCA9IDBcbiAgICBfdGltZU9iamVjdCA9IHRpbWVEcmlmdChpbml0aWFsVGltZSwgb3B0aW9ucy5kZWxpbWl0ZXIpXG4gICAgX3Nsb3REdXJhdGlvbiA9IHNsb3REdXJhdGlvblxuICAgIF91bml0cyA9IG9wdGlvbnMudW5pdHMgfHwgJ20nXG4gICAgX3B1c2hUb0VuZFRpbWUgPSBvcHRpb25zLnB1c2hUb0VuZFRpbWUgfHwgZmFsc2VcbiAgICBfc3BhY2VyID0gb3B0aW9ucy5zcGFjZXJcbiAgICBfc3BhY2VyVW5pdHMgPSBvcHRpb25zLnNwYWNlclVuaXRzIHx8ICdtJ1xuICAgIF9pbmNsdWRlT3ZlcmZsb3cgPSBvcHRpb25zLmluY2x1ZGVPdmVyZmxvd1xuICAgIF9zaG91bGRDcm9zc01pZG5pZ2h0ID0gZmFsc2VcblxuICAgIC8vIEkgcHV0IHRoZSBzdGFydCBhbmQgZW5kIHRocm91Z2ggdGhlIHRpbWVEcmlmdCBwYWNrYWdlXG4gICAgLy8gdG8gZW5zdXJlIHRoZXkgaGF2ZSB0aGUgc2FtZSBmb3JtYXQsIHNvIHRoYXQgY29tcGFyaW5nXG4gICAgLy8gaXNuJ3QgZWZmZWN0ZWQgYnkgZGlmZmVyZW50IGRlbGltaXRlcnNcbiAgICBfc3RhcnQgPSB0aW1lRHJpZnQoc3RhcnQsIG9wdGlvbnMuZGVsaW1pdGVyKS52YWxcbiAgICBfZW5kID0gdGltZURyaWZ0KGVuZCwgb3B0aW9ucy5kZWxpbWl0ZXIpLnZhbFxuXG4gICAgX2NoZWNrSXNWYWxpZCgpXG5cbiAgICBfc2xvdHMgPSBzdGFydCA8IGVuZCA/IF9ub01pZG5pZ2h0Q3Jvc3NpbmcoKSA6IF9jcm9zc2VzTWlkbmlnaHQoKTtcblxuICAgIGlmIChvcHRpb25zLmpvaW5Pbikge1xuICAgICAgcmV0dXJuIF9zbG90cy5tYXAoc2xvdFBhaXIgPT4gc2xvdFBhaXIuam9pbihvcHRpb25zLmpvaW5PbikpXG4gICAgfVxuXG4gICAgcmV0dXJuIF9zbG90c1xuICB9XG5cbiAgLy8gZmluaXNoIGltbWVkaWF0ZWx5IGlmIHRoZSBfc2xvdER1cmF0aW9uIGlzIHRvbyBzbWFsbCBmb3IgZXZlblxuICAvLyBvbmUgdGltZS1zbG90XG4gIGZ1bmN0aW9uIF9jaGVja0lzVmFsaWQoKSB7XG4gICAgY29uc3QgdGVzdFRpbWUgPSB0aW1lRHJpZnQoX3N0YXJ0KS5hZGQoX3Nsb3REdXJhdGlvbiwgIF91bml0cylcbiAgICBpZiAoX3N0YXJ0IDwgX2VuZCkge1xuICAgICAgaWYgKHRlc3RUaW1lLnZhbCA+IF9lbmQgfHwgdGVzdFRpbWUuaGFzQ3Jvc3NlZE1pZG5pZ2h0KSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgICAgY29uc29sZS53YXJuKHdhcm5Nc2cuRFVSQVRJT05fVE9PX0xBUkdFKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGVzdFRpbWUudmFsID4gX2VuZCAmJiB0ZXN0VGltZS5oYXNDcm9zc2VkTWlkbmlnaHQpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgICBjb25zb2xlLndhcm4od2Fybk1zZy5EVVJBVElPTl9UT09fTEFSR0UpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2NoZWNrSXNNaWRuaWdodENyb3NzZWQgKCkge1xuICAgIC8vIHRoaXMgd2FzIGFuIGV4dHJhIGNoZWNrIG5lZWRlZCBmb3Igc29tZSBib3VuZGFyeSBjb25kaXRpb25zXG4gICAgLy8gdG8gZW5zdXJlIHRoYXQgaWYgbWlkbmlnaHQgd2FzIHBhc3NlZCB3aGVuIG5vdCBleHBlY3RlZCB0b1xuICAgIC8vIGZyb20gdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXMsIF9maW5pc2hlZCBpcyBzZXQgdG8gdHJ1ZVxuICAgIGlmIChfY3Jvc3NlZE92ZXJNaWRuaWdodENvdW50ICYmICFfc2hvdWxkQ3Jvc3NNaWRuaWdodCkge1xuICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIGlmIG1pZG5pZ2h0IGlzIHBhc3NlZCBtb3JlIHRoYW4gb25jZSB3ZSBkZWZpbml0ZWx5XG4gICAgLy8gbmVlZCB0byBmaW5pc2hcbiAgICBpZiAoX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCA+IDEpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAoX3RpbWVPYmplY3QuaGFzQ3Jvc3NlZE1pZG5pZ2h0KSB7XG4gICAgICBfY3Jvc3NlZE92ZXJNaWRuaWdodENvdW50ICsrXG4gICAgfVxuXG4gIH1cblxuICAvLyB3aGVuIHB1c2hUb0VuZFRpbWUgaXMgZmFsc2UsIHdlIGJlZ2luIGF0IHRoZSBzdGFydCB0aW1lIGFuZCB3b3JrIG91clxuICAvLyB3YXkgZm9yd2FyZCB0byB0aGUgZW5kIHRpbWVcbiAgZnVuY3Rpb24gX2luY3JlbWVudFRpbWUoKSB7XG4gICAgX2FkZFNsb3RUb0JhY2soX3RpbWVPYmplY3QudmFsLCBfdGltZU9iamVjdC5hZGQoX3Nsb3REdXJhdGlvbiwgX3VuaXRzKS52YWwpXG5cbiAgICBpZiAoX3NwYWNlcikge1xuICAgICAgX3RpbWVPYmplY3QuYWRkKF9zcGFjZXIsIF9zcGFjZXJVbml0cylcbiAgICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkICgpXG4gICAgfVxuICB9XG5cbiAgLy8gd2hlbiBwdXNoVG9FbmRUaW1lIGlzIHRydWUsIHdlIGJlZ2luIGF0IHRoZSBlbmQgdGltZSBhbmQgd29yayBvdXJcbiAgLy8gd2F5IGJhY2t3YXJkcyB0byB0aGUgc3RhcnQgdGltZVxuICBmdW5jdGlvbiBfZGVjcmVtZW50VGltZSgpIHtcbiAgICBfYWRkU2xvdFRvRnJvbnQoX3RpbWVPYmplY3QudmFsLCBfdGltZU9iamVjdC5zdWJ0cmFjdChfc2xvdER1cmF0aW9uLCBfdW5pdHMpLnZhbClcblxuICAgIGlmIChfc3BhY2VyKSB7XG4gICAgICBfdGltZU9iamVjdC5zdWJ0cmFjdChfc3BhY2VyLCBfc3BhY2VyVW5pdHMpXG4gICAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCAoKVxuICAgIH1cbiAgfVxuXG4gIC8vIGlmIG5vIGNyb3NzaW5nIG92ZXIgdGhlIG1pZG5pZ2h0IHRocmVzaG9sZCBpcyBpbnZvbHZlZFxuICAvLyBpbiBjcmVhdGluZyB0aGUgcmVxdWlyZWQgdGltZS1zbG90cywgdGhpcyBsb2dpYyB3aWxsXG4gIC8vIGJlIHVzZWRcbiAgZnVuY3Rpb24gX25vTWlkbmlnaHRDcm9zc2luZygpIHtcbiAgICAvLyBfc2hvdWxkQ3Jvc3NNaWRuaWdodCA9IGZhbHNlXG4gICAgaWYgKF9wdXNoVG9FbmRUaW1lKSB7XG4gICAgICB3aGlsZSAoKF90aW1lT2JqZWN0LnZhbCA+PSBfc3RhcnQpICYmICFfZmluaXNoZWQpIHtcbiAgICAgICAgX2RlY3JlbWVudFRpbWUoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKF90aW1lT2JqZWN0LnZhbCA8PSBfZW5kKSAmJiAhX2ZpbmlzaGVkKSB7XG4gICAgICAgIF9pbmNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9zbG90c1xuICB9XG5cbiAgLy8gaWYgdGhlIHRpbWUtc2xvdHMgcmVxdWlyZWQgaW52b2x2ZSBhIGNyb3NzaW5nIG92ZXIgdGhlIG1pZG5pZ2h0XG4gIC8vIHRocmVzaGhvbGQsIHdlIG5lZWQgdGhpcyBsb2dpYyBiZWZvcmUgaXQgZ2V0cyB0byBtaWRuaWdodFxuICBmdW5jdGlvbiBfY3Jvc3Nlc01pZG5pZ2h0KCkge1xuICAgIF9zaG91bGRDcm9zc01pZG5pZ2h0ID0gdHJ1ZVxuICAgIHdoaWxlICghX2Nyb3NzZWRPdmVyTWlkbmlnaHRDb3VudCkge1xuICAgICAgaWYgKF9wdXNoVG9FbmRUaW1lKSB7XG4gICAgICAgIF9kZWNyZW1lbnRUaW1lKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9pbmNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX25vTWlkbmlnaHRDcm9zc2luZygpXG4gIH1cblxuICBmdW5jdGlvbiBfYWRkU2xvdFRvQmFjayhwcmUsIHBvc3QpIHtcbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG5cbiAgICAvL3dlIGRlZmluaXRlbHkgZG9uJ3Qgd2FudCBhIHNsb3QgaWYgaXQgYmVnaW5zIG9uIHRoZSBlbmQgdGltZSwgdW5sZXNzXG4gICAgLy8gdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXMgZ2l2ZW4gd2VyZSB0aGUgc2FtZVxuICAgIGlmIChwcmUgPT09IF9lbmQgJiYgIShfc3RhcnQgPT09IF9lbmQgJiYgIV9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQpKSB7XG4gICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCFfaW5jbHVkZU92ZXJmbG93KSB7XG5cbiAgICAgIC8vIGNvbmRpdGlvbiB0byBlbGltaW5hdGUgdGltZXNsb3RzIHRoYXQgYnJpZGdlIG92ZXIgdGhlIGVuZCB0aW1lXG4gICAgICBpZiAocHJlIDwgX2VuZCAmJiBwb3N0ID4gX2VuZCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChwcmUgPCBfZW5kICYmIHBvc3QgPCBfZW5kICYmIF90aW1lT2JqZWN0Lmhhc0Nyb3NzZWRNaWRuaWdodCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSBlbmQgdGltZSBpcyBtaWRuaWdodCBvciBjbG9zZSB0byBpdCwgdGhlIHBvc3RcbiAgICAgIC8vIGFuZCBwcmUgdmFsdWVzIG1heSBiZSBlaXRoZXIgc2lkZSBvZiB0aGUgbWlkbmlnaHQgYW5kXG4gICAgICAvLyByZXF1aXJlIHRoaXMgY29uZGl0aW9uIHRvIHJlYWxpc2UgdGhlIHRpbWUtc2xvdHMgYnJpZGdlXG4gICAgICAvLyB0aGUgZW5kIHRpbWVcbiAgICAgIGlmICgocHJlID4gX2VuZCAmJiBwb3N0ID4gX2VuZCkgJiYgcHJlID4gcG9zdCkge1xuICAgICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFfZmluaXNoZWQpIHtcbiAgICAgIF9zbG90cy5wdXNoKFtwcmUsIHBvc3RdKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9hZGRTbG90VG9Gcm9udCAocG9zdCwgcHJlKSB7XG4gICAgX2NoZWNrSXNNaWRuaWdodENyb3NzZWQoKVxuXG4gICAgLy8gd2UgZGVmaW5pdGVseSBkb24ndCB3YW50IGEgc2xvdCBpZiBpdCBlbmRzIG9uIHRoZSBzdGFydCB0aW1lXG4gICAgLy8gdGhlIHN0YXJ0IGFuZCBlbmQgdGltZXMgZ2l2ZW4gd2VyZSB0aGUgc2FtZVxuICAgIGlmIChwb3N0ID09PSBfc3RhcnQgJiYgIShfc3RhcnQgPT09IF9lbmQgJiYgIV9jcm9zc2VkT3Zlck1pZG5pZ2h0Q291bnQpKSB7XG4gICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCFfaW5jbHVkZU92ZXJmbG93KSB7XG4gICAgICAvLyBjb25kaXRpb24gdG8gZWxpbWluYXRlIHRpbWVzbG90cyB0aGF0IGJyaWRnZSBvdmVyIHRoZSBzdGFydCB0aW1lXG4gICAgICBpZiAocG9zdCA+IF9zdGFydCAmJiBwcmUgPCBfc3RhcnQpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAocG9zdCA+IF9zdGFydCAmJiBwcmUgPiBfc3RhcnQgJiYgX3RpbWVPYmplY3QuaGFzQ3Jvc3NlZE1pZG5pZ2h0KSB7XG4gICAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICAgIH1cblxuICAgICAgLy8gaWYgdGhlIHN0YXJ0IHRpbWUgaXMgbWlkbmlnaHQgb3IgY2xvc2UgdG8gaXQsIHRoZSBwcmVcbiAgICAgIC8vIGFuZCBwb3N0IHZhbHVlcyBtYXkgYmUgZWl0aGVyIHNpZGUgb2YgdGhlIG1pZG5pZ2h0IGFuZFxuICAgICAgLy8gcmVxdWlyZSB0aGlzIGNvbmRpdGlvbiB0byByZWFsaXNlIHRoZSB0aW1lLXNsb3RzIGJyaWRnZVxuICAgICAgLy8gdGhlIHN0YXJ0IHRpbWVcbiAgICAgIGlmICgocG9zdCA+IF9zdGFydCAmJiBwcmUgPiBfc3RhcnQpICYmIHBvc3QgPCBwcmUpIHtcbiAgICAgICAgX2ZpbmlzaGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghX2ZpbmlzaGVkKSB7XG4gICAgICBfc2xvdHMudW5zaGlmdChbcHJlLCBwb3N0XSlcbiAgICB9XG5cbiAgfVxuXG4gIHJldHVybiBjcmVhdGVUaW1lc2xvdHNcblxufSkoKSJdfQ==
