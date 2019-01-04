(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeSlot = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.timeDrift = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";function timeDrift(t,e){if(!/^\d\d.\d\d(.\d\d)?$/.test(t))throw new Error("Time format is incorrect. It should be either 'HH:MM:SS' or 'HH:MM', where the colon can be replaced by a non-numerical character");const r=t.split(/[.:\- ]/).map(t=>Number(t));let[n,o,s]=r;if(n>23||n<0)throw new Error("Hours must be between 0 and 23");if(o>59||o<0)throw new Error("Minutes must be between 0 and 59");if(null!=s&&(s>59||s<0))throw new Error("Seconds must be between 0 and 59");if(e&&("string"!=typeof e||e.length>1))throw new Error("Separator must be a single, non-numerical character");function i(t,e){if("number"!=typeof t)throw new Error(`First argument of ${e} method must be a number`)}function a(t,e){if("string"!=typeof t)throw new Error(`Second argument of ${e} method must be a string representing the unit of time`);let r=t.charAt(0).toLowerCase();if(!["h","m","s"].includes(r))throw new Error(`Second argument of ${e} method must be hours, minutes or seconds`);if("s"===r&&null==s)throw new Error("You can't adjust seconds if they weren't included in the original time given");return r}const h={normalize:t=>(null==s&&t.pop(),t.map(function(t){return(t=String(t)).length<2?"0"+t:t}).join(e||":")),hasCrossedMidnight:!1,add(t,e){switch(i(t,"add"),a(e,"add")){case"h":this.hasCrossedMidnight=Boolean(Math.floor((n+t)/24)),n=(n+t)%24;break;case"m":let r=Math.floor((o+t)/60);o=(o+t)%60,this.add(r,"h");break;case"s":let h=Math.floor((s+t)/60);s=(s+t)%60,this.add(h,"m")}return this},subtract(t,e){i(t,"subtract");let r=0;switch(a(e,"subtract")){case"h":let i=n-t;for(;i<0;)r++,i=24+i;n=i,r&&(this.hasCrossedMidnight=!0);break;case"m":let h=o-t;for(;h<0;)r++,h=60+h;o=h,r&&this.subtract(r,"h");break;case"s":let u=s-t;for(;u<0;)r++,u=60+u;s=u,r&&this.subtract(r,"m")}return this}};return Object.defineProperty(h,"val",{get:function(){return this.normalize([n,o,s])}}),h.add=h.add.bind(h),h.subtract=h.subtract.bind(h),h}module.exports=timeDrift;

},{}]},{},[1])(1)
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
const timeDrift = require('time-drift')

module.exports = (function () {

  let _timeObject = {},
      _slotDuration,
      _start,
      _end,
      _slots,
      _units,
      _hasCrossedMidnight,
      _spacer,
      _spacerUnits,
      _pushToEndTime,
      _finished = false

  function createTimeslots(start, end, slotDuration, options = {}) {
    // this will be a singleton in a node app, so it is important
    // to reset all the variables so that one invocation doesn't
    // effect another
    let initialTime = options.pushToEndTime ? end : start
    _slots = []
    _finished = false
    _pushToEndTime = false
    _hasCrossedMidnight = false
    _timeObject = timeDrift(initialTime, options.delimiter)
    _slotDuration = slotDuration
    _units = options.units || 'm'
    _pushToEndTime = options.pushToEndTime
    _spacer = options.spacer
    _spacerUnits = options.spacerUnits || 'm'

    // I put the start and end through the timeDrift package
    // to ensure they have the same format, so that comparing
    // isn't effected by different delimiters
    _start = timeDrift(start, options.delimiter).val
    _end = timeDrift(end, options.delimiter).val

    _slots = start < end ? _noMidnightCrossing() : _crossesMidnight();

    if (options.joinOn) {
      return _slots.map(slotPair => slotPair.join(options.joinOn))
    }

    return _slots
  }

  function _checkIsMidnightCrossed () {
    if (_timeObject.hasCrossedMidnight) {
      _hasCrossedMidnight = true
    }
  }

  function incrementTime() {
    _addSlotToBack(_timeObject.val, _timeObject.add(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.add(_spacer, _spacerUnits)
    }
    _checkIsMidnightCrossed()
  }

  function _decrementTime() {
    _addSlotToFront(_timeObject.val, _timeObject.subtract(_slotDuration, _units).val)

    if (_spacer) {
      _timeObject.subtract(_spacer, _spacerUnits)
    }
    _checkIsMidnightCrossed()
  }

  // if no crossing over the midnight threshold is involved
  // in creating the required time-slots, this logic will
  // be used
  function _noMidnightCrossing() {
    if (_pushToEndTime) {
      while ((_timeObject.val >= _start) && !_finished) {
        _decrementTime()
      }
    } else {
      while ((_timeObject.val <= _end) && !_finished) {
        incrementTime()
      }
    }
    return _slots
  }

  // if the time-slots required involve a crossing over the midnight
  // threshhold, we need this logic before it gets to midnight
  function _crossesMidnight() {
    while (!_hasCrossedMidnight) {
      if (_pushToEndTime) {
        _decrementTime()
      } else {
        incrementTime()
      }
    }

    return _noMidnightCrossing()
  }

  function _addSlotToBack(pre, post) {

    _checkIsMidnightCrossed()
    // if the time-slot bridges over the _end time,
    // that time-slot is not acceptable. Set the outer
    // _finished function to true to stop more slots being
    // added
    if (pre <= _end && post > _end) {
      _finished = true
    }

    // if the end time is midnight or close to it, the post
    // and pre values may be either side of the midnight and
    // require this condition to realise the time-slots are
    // finished
    if ((pre > _end && post > _end) && pre > post) {
      _finished = true
    }

    if (!_finished) {
      _slots.push([pre, post])
    }
  }

  function _addSlotToFront (pre, post) {
    _checkIsMidnightCrossed()
    // if the time-slot bridges over the _start time,
    // that time-slot is not acceptable. Set the outer
    // _finished function to true to stop more slots being
    // added
    if (pre >= _start && post < _start) {
      _finished = true
    }

    // if the end time is midnight or close to it, the post
    // and pre values may be either side of the midnight and
    // require this condition to realise the time-slots are
    // finished
    if ((pre >= _start && post > _start) && pre < post) {
      _finished = true
    }

    if (!_finished) {
      _slots.unshift([post, pre])
    }
  }

  return createTimeslots

})()
},{"time-drift":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdGltZS1kcmlmdC9kaXN0L25vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy90aW1lLWRyaWZ0L2Rpc3Qvbm9kZV9tb2R1bGVzL3RpbWUtZHJpZnQvZGlzdC9zcmMvdGltZS1kcmlmdC5qcyIsInNyYy90aW1lLXNsb3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUNBQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0aW1lRHJpZnQodCxlKXtpZighL15cXGRcXGQuXFxkXFxkKC5cXGRcXGQpPyQvLnRlc3QodCkpdGhyb3cgbmV3IEVycm9yKFwiVGltZSBmb3JtYXQgaXMgaW5jb3JyZWN0LiBJdCBzaG91bGQgYmUgZWl0aGVyICdISDpNTTpTUycgb3IgJ0hIOk1NJywgd2hlcmUgdGhlIGNvbG9uIGNhbiBiZSByZXBsYWNlZCBieSBhIG5vbi1udW1lcmljYWwgY2hhcmFjdGVyXCIpO2NvbnN0IHI9dC5zcGxpdCgvWy46XFwtIF0vKS5tYXAodD0+TnVtYmVyKHQpKTtsZXRbbixvLHNdPXI7aWYobj4yM3x8bjwwKXRocm93IG5ldyBFcnJvcihcIkhvdXJzIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAyM1wiKTtpZihvPjU5fHxvPDApdGhyb3cgbmV3IEVycm9yKFwiTWludXRlcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNTlcIik7aWYobnVsbCE9cyYmKHM+NTl8fHM8MCkpdGhyb3cgbmV3IEVycm9yKFwiU2Vjb25kcyBtdXN0IGJlIGJldHdlZW4gMCBhbmQgNTlcIik7aWYoZSYmKFwic3RyaW5nXCIhPXR5cGVvZiBlfHxlLmxlbmd0aD4xKSl0aHJvdyBuZXcgRXJyb3IoXCJTZXBhcmF0b3IgbXVzdCBiZSBhIHNpbmdsZSwgbm9uLW51bWVyaWNhbCBjaGFyYWN0ZXJcIik7ZnVuY3Rpb24gaSh0LGUpe2lmKFwibnVtYmVyXCIhPXR5cGVvZiB0KXRocm93IG5ldyBFcnJvcihgRmlyc3QgYXJndW1lbnQgb2YgJHtlfSBtZXRob2QgbXVzdCBiZSBhIG51bWJlcmApfWZ1bmN0aW9uIGEodCxlKXtpZihcInN0cmluZ1wiIT10eXBlb2YgdCl0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCBvZiAke2V9IG1ldGhvZCBtdXN0IGJlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdW5pdCBvZiB0aW1lYCk7bGV0IHI9dC5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKTtpZighW1wiaFwiLFwibVwiLFwic1wiXS5pbmNsdWRlcyhyKSl0aHJvdyBuZXcgRXJyb3IoYFNlY29uZCBhcmd1bWVudCBvZiAke2V9IG1ldGhvZCBtdXN0IGJlIGhvdXJzLCBtaW51dGVzIG9yIHNlY29uZHNgKTtpZihcInNcIj09PXImJm51bGw9PXMpdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbid0IGFkanVzdCBzZWNvbmRzIGlmIHRoZXkgd2VyZW4ndCBpbmNsdWRlZCBpbiB0aGUgb3JpZ2luYWwgdGltZSBnaXZlblwiKTtyZXR1cm4gcn1jb25zdCBoPXtub3JtYWxpemU6dD0+KG51bGw9PXMmJnQucG9wKCksdC5tYXAoZnVuY3Rpb24odCl7cmV0dXJuKHQ9U3RyaW5nKHQpKS5sZW5ndGg8Mj9cIjBcIit0OnR9KS5qb2luKGV8fFwiOlwiKSksaGFzQ3Jvc3NlZE1pZG5pZ2h0OiExLGFkZCh0LGUpe3N3aXRjaChpKHQsXCJhZGRcIiksYShlLFwiYWRkXCIpKXtjYXNlXCJoXCI6dGhpcy5oYXNDcm9zc2VkTWlkbmlnaHQ9Qm9vbGVhbihNYXRoLmZsb29yKChuK3QpLzI0KSksbj0obit0KSUyNDticmVhaztjYXNlXCJtXCI6bGV0IHI9TWF0aC5mbG9vcigobyt0KS82MCk7bz0obyt0KSU2MCx0aGlzLmFkZChyLFwiaFwiKTticmVhaztjYXNlXCJzXCI6bGV0IGg9TWF0aC5mbG9vcigocyt0KS82MCk7cz0ocyt0KSU2MCx0aGlzLmFkZChoLFwibVwiKX1yZXR1cm4gdGhpc30sc3VidHJhY3QodCxlKXtpKHQsXCJzdWJ0cmFjdFwiKTtsZXQgcj0wO3N3aXRjaChhKGUsXCJzdWJ0cmFjdFwiKSl7Y2FzZVwiaFwiOmxldCBpPW4tdDtmb3IoO2k8MDspcisrLGk9MjQraTtuPWksciYmKHRoaXMuaGFzQ3Jvc3NlZE1pZG5pZ2h0PSEwKTticmVhaztjYXNlXCJtXCI6bGV0IGg9by10O2Zvcig7aDwwOylyKyssaD02MCtoO289aCxyJiZ0aGlzLnN1YnRyYWN0KHIsXCJoXCIpO2JyZWFrO2Nhc2VcInNcIjpsZXQgdT1zLXQ7Zm9yKDt1PDA7KXIrKyx1PTYwK3U7cz11LHImJnRoaXMuc3VidHJhY3QocixcIm1cIil9cmV0dXJuIHRoaXN9fTtyZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGgsXCJ2YWxcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubm9ybWFsaXplKFtuLG8sc10pfX0pLGguYWRkPWguYWRkLmJpbmQoaCksaC5zdWJ0cmFjdD1oLnN1YnRyYWN0LmJpbmQoaCksaH1tb2R1bGUuZXhwb3J0cz10aW1lRHJpZnQ7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJblJwYldVdFpISnBablF1YW5NaVhTd2libUZ0WlhNaU9sc2lkR2x0WlVSeWFXWjBJaXdpZEdsdFpTSXNJbk5sY0dGeVlYUnZjaUlzSW5SbGMzUWlMQ0pGY25KdmNpSXNJblJwYldWRGIyMXdiMjVsYm5Seklpd2ljM0JzYVhRaUxDSnRZWEFpTENKamIyMXdiMjVsYm5RaUxDSk9kVzFpWlhJaUxDSm9iM1Z5Y3lJc0ltMXBiblYwWlhNaUxDSnpaV052Ym1Seklpd2liR1Z1WjNSb0lpd2lkbUZzYVdSaGRHVk9kVzBpTENKdWRXMGlMQ0p0WlhSb2IyUWlMQ0oyWVd4cFpHRjBaVlZ1YVhRaUxDSjFibWwwSWl3aWRXNXBkRU5vWVhJaUxDSmphR0Z5UVhRaUxDSjBiMHh2ZDJWeVEyRnpaU0lzSW1sdVkyeDFaR1Z6SWl3aWNtVnpjRzl1YzJVaUxDSnViM0p0WVd4cGVtVWlMQ0p5WlhSMWNtNUJjbkpoZVNJc0luQnZjQ0lzSW5CaGNuUWlMQ0pUZEhKcGJtY2lMQ0pxYjJsdUlpd2lhR0Z6UTNKdmMzTmxaRTFwWkc1cFoyaDBJaXdpVzI5aWFtVmpkQ0JQWW1wbFkzUmRJaXdpZEdocGN5SXNJa0p2YjJ4bFlXNGlMQ0pOWVhSb0lpd2labXh2YjNJaUxDSm9iM1Z5YzFSdlFXUmtJaXdpWVdSa0lpd2liV2x1ZFhSbGMxUnZRV1JrSWl3aVkyOTFiblFpTENKb2IzVnlRVzV6ZDJWeUlpd2liV2x1ZFhSbFFXNXpkMlZ5SWl3aWMzVmlkSEpoWTNRaUxDSnpaV052Ym1SQmJuTjNaWElpTENKUFltcGxZM1FpTENKa1pXWnBibVZRY205d1pYSjBlU0lzSW1kbGRDSXNJbUpwYm1RaUxDSnRiMlIxYkdVaUxDSmxlSEJ2Y25SeklsMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFTeGhRVVZCTEZOQlFWTkJMRlZCUVZkRExFVkJRVTFETEVkQlNYaENMRWxCU0cxQ0xITkNRVWRJUXl4TFFVRkxSaXhIUVVOdVFpeE5RVUZOTEVsQlFVbEhMRTFCUVUwc2NVbEJTV3hDTEUxQlFVMURMRVZCUVdsQ1NpeEZRVUZMU3l4TlFVRk5MRmRCUVZkRExFbEJRVWxETEVkQlFXRkRMRTlCUVU5RUxFbEJRM0pGTEVsQlFVdEZMRVZCUVU5RExFVkJRVk5ETEVkQlFWZFFMRVZCUjJoRExFZEJRVWRMTEVWQlFWRXNTVUZCVFVFc1JVRkJVU3hGUVVOMlFpeE5RVUZOTEVsQlFVbE9MRTFCUVUwc2EwTkJTV3hDTEVkQlFVZFBMRVZCUVZVc1NVRkJUVUVzUlVGQlZTeEZRVU16UWl4TlFVRk5MRWxCUVVsUUxFMUJRVTBzYjBOQlNXeENMRWRCUVdNc1RVRkJXRkVzU1VGQmIwSkJMRVZCUVZVc1NVRkJUVUVzUlVGQlZTeEhRVU12UXl4TlFVRk5MRWxCUVVsU0xFMUJRVTBzYjBOQlNXeENMRWRCUVVkR0xFbEJRVzFETEdsQ1FVRmtRU3hIUVVFd1FrRXNSVUZCVlZjc1QwRkJVeXhIUVVOdVJTeE5RVUZOTEVsQlFVbFVMRTFCUVUwc2RVUkJTV3hDTEZOQlFWTlZMRVZCUVdGRExFVkJRVXRETEVkQlEzcENMRWRCUVcxQ0xHbENRVUZTUkN4RlFVTlVMRTFCUVUwc1NVRkJTVmdzTWtKQlFUSkNXU3cyUWtGSmVrTXNVMEZCVTBNc1JVRkJZME1zUlVGQlRVWXNSMEZGTTBJc1IwRkJiMElzYVVKQlFWUkZMRVZCUTFRc1RVRkJUU3hKUVVGSlpDdzBRa0ZCTkVKWkxESkVRVXQ0UXl4SlFVRkpSeXhGUVVGWFJDeEZRVUZMUlN4UFFVRlBMRWRCUVVkRExHTkJSemxDTEVsQlFVc3NRMEZCUXl4SlFVRkpMRWxCUVVrc1MwRkJTME1zVTBGQlUwZ3NSMEZETVVJc1RVRkJUU3hKUVVGSlppdzBRa0ZCTkVKWkxEaERRVXQ0UXl4SFFVRnBRaXhOUVVGaVJ5eEhRVUVyUWl4TlFVRllVQ3hGUVVOMFFpeE5RVUZOTEVsQlFVbFNMRTFCUVUwc1owWkJSMnhDTEU5QlFVOWxMRVZCUjFRc1RVRkJUVWtzUlVGQlZ5eERRVU5tUXl4VlFVRlhReXhKUVVkTkxFMUJRVmhpTEVkQlEwWmhMRVZCUVZsRExFMUJTMUJFTEVWQlFWbHNRaXhKUVVGSkxGTkJRVk52UWl4SFFVVTVRaXhQUVVSQlFTeEZRVUZQUXl4UFFVRlBSQ3hKUVVOR1pDeFBRVUZUTEVWQlFVa3NTVUZCVFdNc1JVRkJUMEVzU1VGRGNrTkZMRXRCUVVzelFpeEhRVUZoTEUxQlIzWkNORUlzYjBKQlFXOUNMRVZCUjNCQ1F5eEpRVUZMYUVJc1JVRkJTMGNzUjBGSFVpeFBRVVpCU2l4RlFVRlpReXhGUVVGTExFOUJRMHRGTEVWQlFXRkRMRVZCUVUwc1VVRkZla01zU1VGQlN5eEpRVU5JWXl4TFFVRkxSaXh0UWtGQmNVSkhMRkZCUVZGRExFdEJRVXRETEU5QlFVOTZRaXhGUVVGUlN5eEhRVUZMTEV0QlF6TkVUQ3hIUVVGVFFTeEZRVUZSU3l4SFFVRlBMRWRCUTNoQ0xFMUJRMFlzU1VGQlN5eEpRVU5JTEVsQlFVbHhRaXhGUVVGaFJpeExRVUZMUXl4UFFVRlBlRUlzUlVGQlZVa3NSMEZCU3l4SlFVTTFRMG9zUjBGQlYwRXNSVUZCVlVrc1IwRkJUeXhIUVVNMVFtbENMRXRCUVV0TExFbEJRVWxFTEVWQlFWa3NTMEZEY2tJc1RVRkRSaXhKUVVGTExFbEJRMGdzU1VGQlNVVXNSVUZCWlVvc1MwRkJTME1zVDBGQlQzWkNMRVZCUVZWSExFZEJRVXNzU1VGRE9VTklMRWRCUVZkQkxFVkJRVlZITEVkQlFVOHNSMEZETlVKcFFpeExRVUZMU3l4SlFVRkpReXhGUVVGakxFdEJSM3BDTEU5QlFVOU9MRTFCU1ZSRUxGTkJRVlZvUWl4RlFVRkxSeXhIUVVOaVNpeEZRVUZaUXl4RlFVRkxMRmxCUldwQ0xFbEJRVWwzUWl4RlFVRlJMRVZCUTFvc1QwRkdjMEowUWl4RlFVRmhReXhGUVVGTkxHRkJSM3BETEVsQlFVc3NTVUZEU0N4SlFVRkpjMElzUlVGQllUbENMRVZCUVZGTExFVkJRM3BDTEV0QlFVMTVRaXhGUVVGaExFZEJRMnBDUkN4SlFVTkJReXhGUVVGaExFZEJRVXRCTEVWQlJYQkNPVUlzUlVGQlVUaENMRVZCUTBwRUxFbEJRMFpRTEV0QlFVdEdMRzlDUVVGeFFpeEhRVVUxUWl4TlFVTkdMRWxCUVVzc1NVRkRTQ3hKUVVGSlZ5eEZRVUZsT1VJc1JVRkJWVWtzUlVGRE4wSXNTMEZCVFRCQ0xFVkJRV1VzUjBGRGJrSkdMRWxCUTBGRkxFVkJRV1VzUjBGQlMwRXNSVUZGZEVJNVFpeEZRVUZWT0VJc1JVRkRVRVlzUjBGRFJGQXNTMEZCUzFVc1UwRkJVMGdzUlVGQlR5eExRVVYyUWl4TlFVTkdMRWxCUVVzc1NVRkRTQ3hKUVVGSlNTeEZRVUZsTDBJc1JVRkJWVWNzUlVGRE4wSXNTMEZCVFRSQ0xFVkJRV1VzUjBGRGJrSktMRWxCUTBGSkxFVkJRV1VzUjBGQlMwRXNSVUZGZEVJdlFpeEZRVUZWSzBJc1JVRkRVRW9zUjBGRFJGQXNTMEZCUzFVc1UwRkJVMGdzUlVGQlR5eExRVWw2UWl4UFFVRlBVQ3hQUVdGWUxFOUJWRUZaTEU5QlFVOURMR1ZCUVdWMFFpeEZRVUZWTEUxQlFVOHNRMEZEY2tOMVFpeEpRVUZMTEZkQlEwZ3NUMEZCVDJRc1MwRkJTMUlzVlVGQlZTeERRVUZEWkN4RlFVRlBReXhGUVVGVFF5eFBRVWt6UTFjc1JVRkJVMk1zU1VGQlRXUXNSVUZCVTJNc1NVRkJTVlVzUzBGQlMzaENMRWRCUTJwRFFTeEZRVUZUYlVJc1UwRkJWMjVDTEVWQlFWTnRRaXhUUVVGVFN5eExRVUZMZUVJc1IwRkZjRU5CTEVWQlIxUjVRaXhQUVVGUFF5eFJRVUZWYWtRaUxDSm1hV3hsSWpvaUwxVnpaWEp6TDJGdVpISmxkeTlRWlhKemIyNWhiQzkwYVcxbExXUnlhV1owTDNOeVl5OTBhVzFsTFdSeWFXWjBMbXB6SW4wPSIsImNvbnN0IHRpbWVEcmlmdCA9IHJlcXVpcmUoJ3RpbWUtZHJpZnQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgbGV0IF90aW1lT2JqZWN0ID0ge30sXG4gICAgICBfc2xvdER1cmF0aW9uLFxuICAgICAgX3N0YXJ0LFxuICAgICAgX2VuZCxcbiAgICAgIF9zbG90cyxcbiAgICAgIF91bml0cyxcbiAgICAgIF9oYXNDcm9zc2VkTWlkbmlnaHQsXG4gICAgICBfc3BhY2VyLFxuICAgICAgX3NwYWNlclVuaXRzLFxuICAgICAgX3B1c2hUb0VuZFRpbWUsXG4gICAgICBfZmluaXNoZWQgPSBmYWxzZVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVRpbWVzbG90cyhzdGFydCwgZW5kLCBzbG90RHVyYXRpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIHRoaXMgd2lsbCBiZSBhIHNpbmdsZXRvbiBpbiBhIG5vZGUgYXBwLCBzbyBpdCBpcyBpbXBvcnRhbnRcbiAgICAvLyB0byByZXNldCBhbGwgdGhlIHZhcmlhYmxlcyBzbyB0aGF0IG9uZSBpbnZvY2F0aW9uIGRvZXNuJ3RcbiAgICAvLyBlZmZlY3QgYW5vdGhlclxuICAgIGxldCBpbml0aWFsVGltZSA9IG9wdGlvbnMucHVzaFRvRW5kVGltZSA/IGVuZCA6IHN0YXJ0XG4gICAgX3Nsb3RzID0gW11cbiAgICBfZmluaXNoZWQgPSBmYWxzZVxuICAgIF9wdXNoVG9FbmRUaW1lID0gZmFsc2VcbiAgICBfaGFzQ3Jvc3NlZE1pZG5pZ2h0ID0gZmFsc2VcbiAgICBfdGltZU9iamVjdCA9IHRpbWVEcmlmdChpbml0aWFsVGltZSwgb3B0aW9ucy5kZWxpbWl0ZXIpXG4gICAgX3Nsb3REdXJhdGlvbiA9IHNsb3REdXJhdGlvblxuICAgIF91bml0cyA9IG9wdGlvbnMudW5pdHMgfHwgJ20nXG4gICAgX3B1c2hUb0VuZFRpbWUgPSBvcHRpb25zLnB1c2hUb0VuZFRpbWVcbiAgICBfc3BhY2VyID0gb3B0aW9ucy5zcGFjZXJcbiAgICBfc3BhY2VyVW5pdHMgPSBvcHRpb25zLnNwYWNlclVuaXRzIHx8ICdtJ1xuXG4gICAgLy8gSSBwdXQgdGhlIHN0YXJ0IGFuZCBlbmQgdGhyb3VnaCB0aGUgdGltZURyaWZ0IHBhY2thZ2VcbiAgICAvLyB0byBlbnN1cmUgdGhleSBoYXZlIHRoZSBzYW1lIGZvcm1hdCwgc28gdGhhdCBjb21wYXJpbmdcbiAgICAvLyBpc24ndCBlZmZlY3RlZCBieSBkaWZmZXJlbnQgZGVsaW1pdGVyc1xuICAgIF9zdGFydCA9IHRpbWVEcmlmdChzdGFydCwgb3B0aW9ucy5kZWxpbWl0ZXIpLnZhbFxuICAgIF9lbmQgPSB0aW1lRHJpZnQoZW5kLCBvcHRpb25zLmRlbGltaXRlcikudmFsXG5cbiAgICBfc2xvdHMgPSBzdGFydCA8IGVuZCA/IF9ub01pZG5pZ2h0Q3Jvc3NpbmcoKSA6IF9jcm9zc2VzTWlkbmlnaHQoKTtcblxuICAgIGlmIChvcHRpb25zLmpvaW5Pbikge1xuICAgICAgcmV0dXJuIF9zbG90cy5tYXAoc2xvdFBhaXIgPT4gc2xvdFBhaXIuam9pbihvcHRpb25zLmpvaW5PbikpXG4gICAgfVxuXG4gICAgcmV0dXJuIF9zbG90c1xuICB9XG5cbiAgZnVuY3Rpb24gX2NoZWNrSXNNaWRuaWdodENyb3NzZWQgKCkge1xuICAgIGlmIChfdGltZU9iamVjdC5oYXNDcm9zc2VkTWlkbmlnaHQpIHtcbiAgICAgIF9oYXNDcm9zc2VkTWlkbmlnaHQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5jcmVtZW50VGltZSgpIHtcbiAgICBfYWRkU2xvdFRvQmFjayhfdGltZU9iamVjdC52YWwsIF90aW1lT2JqZWN0LmFkZChfc2xvdER1cmF0aW9uLCBfdW5pdHMpLnZhbClcblxuICAgIGlmIChfc3BhY2VyKSB7XG4gICAgICBfdGltZU9iamVjdC5hZGQoX3NwYWNlciwgX3NwYWNlclVuaXRzKVxuICAgIH1cbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG4gIH1cblxuICBmdW5jdGlvbiBfZGVjcmVtZW50VGltZSgpIHtcbiAgICBfYWRkU2xvdFRvRnJvbnQoX3RpbWVPYmplY3QudmFsLCBfdGltZU9iamVjdC5zdWJ0cmFjdChfc2xvdER1cmF0aW9uLCBfdW5pdHMpLnZhbClcblxuICAgIGlmIChfc3BhY2VyKSB7XG4gICAgICBfdGltZU9iamVjdC5zdWJ0cmFjdChfc3BhY2VyLCBfc3BhY2VyVW5pdHMpXG4gICAgfVxuICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkKClcbiAgfVxuXG4gIC8vIGlmIG5vIGNyb3NzaW5nIG92ZXIgdGhlIG1pZG5pZ2h0IHRocmVzaG9sZCBpcyBpbnZvbHZlZFxuICAvLyBpbiBjcmVhdGluZyB0aGUgcmVxdWlyZWQgdGltZS1zbG90cywgdGhpcyBsb2dpYyB3aWxsXG4gIC8vIGJlIHVzZWRcbiAgZnVuY3Rpb24gX25vTWlkbmlnaHRDcm9zc2luZygpIHtcbiAgICBpZiAoX3B1c2hUb0VuZFRpbWUpIHtcbiAgICAgIHdoaWxlICgoX3RpbWVPYmplY3QudmFsID49IF9zdGFydCkgJiYgIV9maW5pc2hlZCkge1xuICAgICAgICBfZGVjcmVtZW50VGltZSgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlICgoX3RpbWVPYmplY3QudmFsIDw9IF9lbmQpICYmICFfZmluaXNoZWQpIHtcbiAgICAgICAgaW5jcmVtZW50VGltZSgpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfc2xvdHNcbiAgfVxuXG4gIC8vIGlmIHRoZSB0aW1lLXNsb3RzIHJlcXVpcmVkIGludm9sdmUgYSBjcm9zc2luZyBvdmVyIHRoZSBtaWRuaWdodFxuICAvLyB0aHJlc2hob2xkLCB3ZSBuZWVkIHRoaXMgbG9naWMgYmVmb3JlIGl0IGdldHMgdG8gbWlkbmlnaHRcbiAgZnVuY3Rpb24gX2Nyb3NzZXNNaWRuaWdodCgpIHtcbiAgICB3aGlsZSAoIV9oYXNDcm9zc2VkTWlkbmlnaHQpIHtcbiAgICAgIGlmIChfcHVzaFRvRW5kVGltZSkge1xuICAgICAgICBfZGVjcmVtZW50VGltZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmNyZW1lbnRUaW1lKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX25vTWlkbmlnaHRDcm9zc2luZygpXG4gIH1cblxuICBmdW5jdGlvbiBfYWRkU2xvdFRvQmFjayhwcmUsIHBvc3QpIHtcblxuICAgIF9jaGVja0lzTWlkbmlnaHRDcm9zc2VkKClcbiAgICAvLyBpZiB0aGUgdGltZS1zbG90IGJyaWRnZXMgb3ZlciB0aGUgX2VuZCB0aW1lLFxuICAgIC8vIHRoYXQgdGltZS1zbG90IGlzIG5vdCBhY2NlcHRhYmxlLiBTZXQgdGhlIG91dGVyXG4gICAgLy8gX2ZpbmlzaGVkIGZ1bmN0aW9uIHRvIHRydWUgdG8gc3RvcCBtb3JlIHNsb3RzIGJlaW5nXG4gICAgLy8gYWRkZWRcbiAgICBpZiAocHJlIDw9IF9lbmQgJiYgcG9zdCA+IF9lbmQpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgZW5kIHRpbWUgaXMgbWlkbmlnaHQgb3IgY2xvc2UgdG8gaXQsIHRoZSBwb3N0XG4gICAgLy8gYW5kIHByZSB2YWx1ZXMgbWF5IGJlIGVpdGhlciBzaWRlIG9mIHRoZSBtaWRuaWdodCBhbmRcbiAgICAvLyByZXF1aXJlIHRoaXMgY29uZGl0aW9uIHRvIHJlYWxpc2UgdGhlIHRpbWUtc2xvdHMgYXJlXG4gICAgLy8gZmluaXNoZWRcbiAgICBpZiAoKHByZSA+IF9lbmQgJiYgcG9zdCA+IF9lbmQpICYmIHByZSA+IHBvc3QpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAoIV9maW5pc2hlZCkge1xuICAgICAgX3Nsb3RzLnB1c2goW3ByZSwgcG9zdF0pXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2FkZFNsb3RUb0Zyb250IChwcmUsIHBvc3QpIHtcbiAgICBfY2hlY2tJc01pZG5pZ2h0Q3Jvc3NlZCgpXG4gICAgLy8gaWYgdGhlIHRpbWUtc2xvdCBicmlkZ2VzIG92ZXIgdGhlIF9zdGFydCB0aW1lLFxuICAgIC8vIHRoYXQgdGltZS1zbG90IGlzIG5vdCBhY2NlcHRhYmxlLiBTZXQgdGhlIG91dGVyXG4gICAgLy8gX2ZpbmlzaGVkIGZ1bmN0aW9uIHRvIHRydWUgdG8gc3RvcCBtb3JlIHNsb3RzIGJlaW5nXG4gICAgLy8gYWRkZWRcbiAgICBpZiAocHJlID49IF9zdGFydCAmJiBwb3N0IDwgX3N0YXJ0KSB7XG4gICAgICBfZmluaXNoZWQgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIGVuZCB0aW1lIGlzIG1pZG5pZ2h0IG9yIGNsb3NlIHRvIGl0LCB0aGUgcG9zdFxuICAgIC8vIGFuZCBwcmUgdmFsdWVzIG1heSBiZSBlaXRoZXIgc2lkZSBvZiB0aGUgbWlkbmlnaHQgYW5kXG4gICAgLy8gcmVxdWlyZSB0aGlzIGNvbmRpdGlvbiB0byByZWFsaXNlIHRoZSB0aW1lLXNsb3RzIGFyZVxuICAgIC8vIGZpbmlzaGVkXG4gICAgaWYgKChwcmUgPj0gX3N0YXJ0ICYmIHBvc3QgPiBfc3RhcnQpICYmIHByZSA8IHBvc3QpIHtcbiAgICAgIF9maW5pc2hlZCA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAoIV9maW5pc2hlZCkge1xuICAgICAgX3Nsb3RzLnVuc2hpZnQoW3Bvc3QsIHByZV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNyZWF0ZVRpbWVzbG90c1xuXG59KSgpIl19
