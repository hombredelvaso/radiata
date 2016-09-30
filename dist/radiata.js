(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],2:[function(require,module,exports){
//BROWSERIFY//////////////////////
/////////////////////////////////
require('./styles/radiata.css');
var makeRadial = require('./scripts/radiata.js');
//////////////////////////////////
//////////////////////////////////

if(!window.radiata){
  window.radiata = {
    makeRadial: makeRadial
  };
}
},{"./scripts/radiata.js":3,"./styles/radiata.css":4}],3:[function(require,module,exports){
var makeRadial = function(elementId, settings, menu){
  var buildMenuItem = function(item){
    var node = document.createElement("A");
    node.href = '#';
    node.className = 'radial ' + item.class;
    node.innerHTML = item.value;
    document.getElementById(elementId).appendChild(node);
  };

  menu.forEach(buildMenuItem);

  /*
   document.querySelector('.menu-button').onclick = function(e) {
   e.preventDefault(); document.querySelector('.circle').classList.toggle('open');
   }
   */

  document.querySelector('#' + elementId + '+ .menu-button').onmouseover = function(e) {
    e.preventDefault();
    //TODO: dont allow addition of open more than once... check list for it
    var classes = document.querySelector('#' + elementId + '.circle').classList;
    document.querySelector('#' + elementId + '.circle').classList = classes + ' open';
  };

  //TODO: take away query selector, just document... value of elementId is just last one.. why?
  document.querySelector('#' + elementId + '.circle').onmouseout = function(e) {
    e.preventDefault();
    if (e.target && e.target.matches('#' + elementId + ".circle")){
      if(e.relatedTarget && !e.relatedTarget.classList.contains('radial')){
        document.querySelector('#' + elementId + '.circle').classList.toggle('open');
      }
    }
  };

  var items = document.querySelectorAll('#' + elementId + '.circle a');

  // spread: 3 (right) | -3 (left) | 1 (around)
  // spreadSection: 1 (default) | 1.655 AND spread 3 AND updown 0 (tophalf) | 1.655 AND spread 3 AND updown -0.5 (righthalf) | spread -3 AND updown -0.5 (lefthalf) | spread -3 AND updown 0 (bottomhalf)
  // updown: 0 (down) | -0.5 (up)
  // distance: 35 (default)
  // leftTight (orbit): 0 (default) | (top: 0, left: 1 OR top: 1, left: 0)
  // topTight (orbit): 0 (default) | (top: 0, left: 1 OR top: 1, left: 0)

  var spread = settings['spread'] || 1;
  var spreadSection = settings['spreadSection'] || 1;
  var updown = settings['updown'] || -0.5;
  var distance = settings['distance'] || 35;
  var leftTight = settings['leftTight'] || 0;
  var topTight = settings['topTight'] || 0;

  for(var i = 0, l = items.length; i < l; i++) {
    items[i].style.left = (50 - distance*Math.cos(updown * Math.PI - 2*(spreadSection/(l * spread))*(i - leftTight)*Math.PI)).toFixed(4) + "%";
    items[i].style.top = (56 + distance*Math.sin(updown * Math.PI - 2*(spreadSection/(l * spread))*(i - topTight)*Math.PI)).toFixed(4) + "%";
  }

};

module.exports = makeRadial;
},{}],4:[function(require,module,exports){
var css = ".circular-menu {\n  /* background-color: red; */\n  width: 250px;\n  height: 250px;\n  margin: 0 auto;\n  position: relative;\n}\n.circle {\n  width: 250px;\n  height: 250px;\n  opacity: 0;\n  -webkit-transform: scale(0);\n  -moz-transform: scale(0);\n  transform: scale(0);\n  -webkit-transition: all 0.4s ease-out;\n  -moz-transition: all 0.4s ease-out;\n  transition: all 0.4s ease-out;\n}\n.open.circle {\n  opacity: 1;\n  -webkit-transform: scale(1);\n  -moz-transform: scale(1);\n  transform: scale(1);\n}\n.circle a {\n  text-decoration: none;\n  color: white;\n  display: block;\n  height: 40px;\n  width: 40px;\n  line-height: 40px;\n  margin-left: -20px;\n  margin-top: -20px;\n  position: absolute;\n  text-align: center;\n}\n.menu-button {\n  position: absolute;\n  top: calc(50% - 30px);\n  left: calc(50% - 30px);\n  text-decoration: none;\n  text-align: center;\n  color: #444;\n  /*border-radius: 50%;*/\n  display: block;\n  height: 70px;\n  /*40px*/\n  width: 40px;\n  line-height: 40px;\n  padding: 10px;\n  background: #ddd;\n}\n"; (require("browserify-css").createStyle(css, { "href": "src/styles/radiata.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS1jc3MvYnJvd3Nlci5qcyIsInNyYy9jb21waWxlLmpzIiwic3JjL3NjcmlwdHMvcmFkaWF0YS5qcyIsInNyYy9zdHlsZXMvcmFkaWF0YS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vLyBGb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBicm93c2VyIGZpZWxkLCBjaGVjayBvdXQgdGhlIGJyb3dzZXIgZmllbGQgYXQgaHR0cHM6Ly9naXRodWIuY29tL3N1YnN0YWNrL2Jyb3dzZXJpZnktaGFuZGJvb2sjYnJvd3Nlci1maWVsZC5cblxudmFyIHN0eWxlRWxlbWVudHNJbnNlcnRlZEF0VG9wID0gW107XG5cbnZhciBpbnNlcnRTdHlsZUVsZW1lbnQgPSBmdW5jdGlvbihzdHlsZUVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICB2YXIgbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3AgPSBzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcFtzdHlsZUVsZW1lbnRzSW5zZXJ0ZWRBdFRvcC5sZW5ndGggLSAxXTtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuaW5zZXJ0QXQgPSBvcHRpb25zLmluc2VydEF0IHx8ICdib3R0b20nO1xuXG4gICAgaWYgKG9wdGlvbnMuaW5zZXJ0QXQgPT09ICd0b3AnKSB7XG4gICAgICAgIGlmICghbGFzdFN0eWxlRWxlbWVudEluc2VydGVkQXRUb3ApIHtcbiAgICAgICAgICAgIGhlYWQuaW5zZXJ0QmVmb3JlKHN0eWxlRWxlbWVudCwgaGVhZC5maXJzdENoaWxkKTtcbiAgICAgICAgfSBlbHNlIGlmIChsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZykge1xuICAgICAgICAgICAgaGVhZC5pbnNlcnRCZWZvcmUoc3R5bGVFbGVtZW50LCBsYXN0U3R5bGVFbGVtZW50SW5zZXJ0ZWRBdFRvcC5uZXh0U2libGluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgc3R5bGVFbGVtZW50c0luc2VydGVkQXRUb3AucHVzaChzdHlsZUVsZW1lbnQpO1xuICAgIH0gZWxzZSBpZiAob3B0aW9ucy5pbnNlcnRBdCA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZUVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyIFxcJ2luc2VydEF0XFwnLiBNdXN0IGJlIFxcJ3RvcFxcJyBvciBcXCdib3R0b21cXCcuJyk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gQ3JlYXRlIGEgPGxpbms+IHRhZyB3aXRoIG9wdGlvbmFsIGRhdGEgYXR0cmlidXRlc1xuICAgIGNyZWF0ZUxpbms6IGZ1bmN0aW9uKGhyZWYsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXG4gICAgICAgIGxpbmsuaHJlZiA9IGhyZWY7XG4gICAgICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoICEgYXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZGF0YS0nICsga2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIH0sXG4gICAgLy8gQ3JlYXRlIGEgPHN0eWxlPiB0YWcgd2l0aCBvcHRpb25hbCBkYXRhIGF0dHJpYnV0ZXNcbiAgICBjcmVhdGVTdHlsZTogZnVuY3Rpb24oY3NzVGV4dCwgYXR0cmlidXRlcywgZXh0cmFPcHRpb25zKSB7XG4gICAgICAgIGV4dHJhT3B0aW9ucyA9IGV4dHJhT3B0aW9ucyB8fCB7fTtcblxuICAgICAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKCAhIGF0dHJpYnV0ZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICAgICAgc3R5bGUuc2V0QXR0cmlidXRlKCdkYXRhLScgKyBrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdHlsZS5zaGVldCkgeyAvLyBmb3IganNkb20gYW5kIElFOStcbiAgICAgICAgICAgIHN0eWxlLmlubmVySFRNTCA9IGNzc1RleHQ7XG4gICAgICAgICAgICBzdHlsZS5zaGVldC5jc3NUZXh0ID0gY3NzVGV4dDtcbiAgICAgICAgICAgIGluc2VydFN0eWxlRWxlbWVudChzdHlsZSwgeyBpbnNlcnRBdDogZXh0cmFPcHRpb25zLmluc2VydEF0IH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHsgLy8gZm9yIElFOCBhbmQgYmVsb3dcbiAgICAgICAgICAgIGluc2VydFN0eWxlRWxlbWVudChzdHlsZSwgeyBpbnNlcnRBdDogZXh0cmFPcHRpb25zLmluc2VydEF0IH0pO1xuICAgICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzVGV4dDtcbiAgICAgICAgfSBlbHNlIHsgLy8gZm9yIENocm9tZSwgRmlyZWZveCwgYW5kIFNhZmFyaVxuICAgICAgICAgICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzVGV4dCkpO1xuICAgICAgICAgICAgaW5zZXJ0U3R5bGVFbGVtZW50KHN0eWxlLCB7IGluc2VydEF0OiBleHRyYU9wdGlvbnMuaW5zZXJ0QXQgfSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLy9CUk9XU0VSSUZZLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5yZXF1aXJlKCcuL3N0eWxlcy9yYWRpYXRhLmNzcycpO1xudmFyIG1ha2VSYWRpYWwgPSByZXF1aXJlKCcuL3NjcmlwdHMvcmFkaWF0YS5qcycpO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5pZighd2luZG93LnJhZGlhdGEpe1xuICB3aW5kb3cucmFkaWF0YSA9IHtcbiAgICBtYWtlUmFkaWFsOiBtYWtlUmFkaWFsXG4gIH07XG59IiwidmFyIG1ha2VSYWRpYWwgPSBmdW5jdGlvbihlbGVtZW50SWQsIHNldHRpbmdzLCBtZW51KXtcbiAgdmFyIGJ1aWxkTWVudUl0ZW0gPSBmdW5jdGlvbihpdGVtKXtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJBXCIpO1xuICAgIG5vZGUuaHJlZiA9ICcjJztcbiAgICBub2RlLmNsYXNzTmFtZSA9ICdyYWRpYWwgJyArIGl0ZW0uY2xhc3M7XG4gICAgbm9kZS5pbm5lckhUTUwgPSBpdGVtLnZhbHVlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnRJZCkuYXBwZW5kQ2hpbGQobm9kZSk7XG4gIH07XG5cbiAgbWVudS5mb3JFYWNoKGJ1aWxkTWVudUl0ZW0pO1xuXG4gIC8qXG4gICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWVudS1idXR0b24nKS5vbmNsaWNrID0gZnVuY3Rpb24oZSkge1xuICAgZS5wcmV2ZW50RGVmYXVsdCgpOyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2lyY2xlJykuY2xhc3NMaXN0LnRvZ2dsZSgnb3BlbicpO1xuICAgfVxuICAgKi9cblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGVsZW1lbnRJZCArICcrIC5tZW51LWJ1dHRvbicpLm9ubW91c2VvdmVyID0gZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAvL1RPRE86IGRvbnQgYWxsb3cgYWRkaXRpb24gb2Ygb3BlbiBtb3JlIHRoYW4gb25jZS4uLiBjaGVjayBsaXN0IGZvciBpdFxuICAgIHZhciBjbGFzc2VzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignIycgKyBlbGVtZW50SWQgKyAnLmNpcmNsZScpLmNsYXNzTGlzdDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjJyArIGVsZW1lbnRJZCArICcuY2lyY2xlJykuY2xhc3NMaXN0ID0gY2xhc3NlcyArICcgb3Blbic7XG4gIH07XG5cbiAgLy9UT0RPOiB0YWtlIGF3YXkgcXVlcnkgc2VsZWN0b3IsIGp1c3QgZG9jdW1lbnQuLi4gdmFsdWUgb2YgZWxlbWVudElkIGlzIGp1c3QgbGFzdCBvbmUuLiB3aHk/XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnICsgZWxlbWVudElkICsgJy5jaXJjbGUnKS5vbm1vdXNlb3V0ID0gZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoZS50YXJnZXQgJiYgZS50YXJnZXQubWF0Y2hlcygnIycgKyBlbGVtZW50SWQgKyBcIi5jaXJjbGVcIikpe1xuICAgICAgaWYoZS5yZWxhdGVkVGFyZ2V0ICYmICFlLnJlbGF0ZWRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdyYWRpYWwnKSl7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyMnICsgZWxlbWVudElkICsgJy5jaXJjbGUnKS5jbGFzc0xpc3QudG9nZ2xlKCdvcGVuJyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyMnICsgZWxlbWVudElkICsgJy5jaXJjbGUgYScpO1xuXG4gIC8vIHNwcmVhZDogMyAocmlnaHQpIHwgLTMgKGxlZnQpIHwgMSAoYXJvdW5kKVxuICAvLyBzcHJlYWRTZWN0aW9uOiAxIChkZWZhdWx0KSB8IDEuNjU1IEFORCBzcHJlYWQgMyBBTkQgdXBkb3duIDAgKHRvcGhhbGYpIHwgMS42NTUgQU5EIHNwcmVhZCAzIEFORCB1cGRvd24gLTAuNSAocmlnaHRoYWxmKSB8IHNwcmVhZCAtMyBBTkQgdXBkb3duIC0wLjUgKGxlZnRoYWxmKSB8IHNwcmVhZCAtMyBBTkQgdXBkb3duIDAgKGJvdHRvbWhhbGYpXG4gIC8vIHVwZG93bjogMCAoZG93bikgfCAtMC41ICh1cClcbiAgLy8gZGlzdGFuY2U6IDM1IChkZWZhdWx0KVxuICAvLyBsZWZ0VGlnaHQgKG9yYml0KTogMCAoZGVmYXVsdCkgfCAodG9wOiAwLCBsZWZ0OiAxIE9SIHRvcDogMSwgbGVmdDogMClcbiAgLy8gdG9wVGlnaHQgKG9yYml0KTogMCAoZGVmYXVsdCkgfCAodG9wOiAwLCBsZWZ0OiAxIE9SIHRvcDogMSwgbGVmdDogMClcblxuICB2YXIgc3ByZWFkID0gc2V0dGluZ3NbJ3NwcmVhZCddIHx8IDE7XG4gIHZhciBzcHJlYWRTZWN0aW9uID0gc2V0dGluZ3NbJ3NwcmVhZFNlY3Rpb24nXSB8fCAxO1xuICB2YXIgdXBkb3duID0gc2V0dGluZ3NbJ3VwZG93biddIHx8IC0wLjU7XG4gIHZhciBkaXN0YW5jZSA9IHNldHRpbmdzWydkaXN0YW5jZSddIHx8IDM1O1xuICB2YXIgbGVmdFRpZ2h0ID0gc2V0dGluZ3NbJ2xlZnRUaWdodCddIHx8IDA7XG4gIHZhciB0b3BUaWdodCA9IHNldHRpbmdzWyd0b3BUaWdodCddIHx8IDA7XG5cbiAgZm9yKHZhciBpID0gMCwgbCA9IGl0ZW1zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGl0ZW1zW2ldLnN0eWxlLmxlZnQgPSAoNTAgLSBkaXN0YW5jZSpNYXRoLmNvcyh1cGRvd24gKiBNYXRoLlBJIC0gMiooc3ByZWFkU2VjdGlvbi8obCAqIHNwcmVhZCkpKihpIC0gbGVmdFRpZ2h0KSpNYXRoLlBJKSkudG9GaXhlZCg0KSArIFwiJVwiO1xuICAgIGl0ZW1zW2ldLnN0eWxlLnRvcCA9ICg1NiArIGRpc3RhbmNlKk1hdGguc2luKHVwZG93biAqIE1hdGguUEkgLSAyKihzcHJlYWRTZWN0aW9uLyhsICogc3ByZWFkKSkqKGkgLSB0b3BUaWdodCkqTWF0aC5QSSkpLnRvRml4ZWQoNCkgKyBcIiVcIjtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1ha2VSYWRpYWw7IiwidmFyIGNzcyA9IFwiLmNpcmN1bGFyLW1lbnUge1xcbiAgLyogYmFja2dyb3VuZC1jb2xvcjogcmVkOyAqL1xcbiAgd2lkdGg6IDI1MHB4O1xcbiAgaGVpZ2h0OiAyNTBweDtcXG4gIG1hcmdpbjogMCBhdXRvO1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG4uY2lyY2xlIHtcXG4gIHdpZHRoOiAyNTBweDtcXG4gIGhlaWdodDogMjUwcHg7XFxuICBvcGFjaXR5OiAwO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDApO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcXG4gIC13ZWJraXQtdHJhbnNpdGlvbjogYWxsIDAuNHMgZWFzZS1vdXQ7XFxuICAtbW96LXRyYW5zaXRpb246IGFsbCAwLjRzIGVhc2Utb3V0O1xcbiAgdHJhbnNpdGlvbjogYWxsIDAuNHMgZWFzZS1vdXQ7XFxufVxcbi5vcGVuLmNpcmNsZSB7XFxuICBvcGFjaXR5OiAxO1xcbiAgLXdlYmtpdC10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgLW1vei10cmFuc2Zvcm06IHNjYWxlKDEpO1xcbiAgdHJhbnNmb3JtOiBzY2FsZSgxKTtcXG59XFxuLmNpcmNsZSBhIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIGNvbG9yOiB3aGl0ZTtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgaGVpZ2h0OiA0MHB4O1xcbiAgd2lkdGg6IDQwcHg7XFxuICBsaW5lLWhlaWdodDogNDBweDtcXG4gIG1hcmdpbi1sZWZ0OiAtMjBweDtcXG4gIG1hcmdpbi10b3A6IC0yMHB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG4ubWVudS1idXR0b24ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiBjYWxjKDUwJSAtIDMwcHgpO1xcbiAgbGVmdDogY2FsYyg1MCUgLSAzMHB4KTtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGNvbG9yOiAjNDQ0O1xcbiAgLypib3JkZXItcmFkaXVzOiA1MCU7Ki9cXG4gIGRpc3BsYXk6IGJsb2NrO1xcbiAgaGVpZ2h0OiA3MHB4O1xcbiAgLyo0MHB4Ki9cXG4gIHdpZHRoOiA0MHB4O1xcbiAgbGluZS1oZWlnaHQ6IDQwcHg7XFxuICBwYWRkaW5nOiAxMHB4O1xcbiAgYmFja2dyb3VuZDogI2RkZDtcXG59XFxuXCI7IChyZXF1aXJlKFwiYnJvd3NlcmlmeS1jc3NcIikuY3JlYXRlU3R5bGUoY3NzLCB7IFwiaHJlZlwiOiBcInNyYy9zdHlsZXMvcmFkaWF0YS5jc3NcIiB9LCB7IFwiaW5zZXJ0QXRcIjogXCJib3R0b21cIiB9KSk7IG1vZHVsZS5leHBvcnRzID0gY3NzOyJdfQ==
