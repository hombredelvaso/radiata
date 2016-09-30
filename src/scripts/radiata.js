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