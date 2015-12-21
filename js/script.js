var itunesUrl = 'https://itunes.apple.com/search';
var inputSearch = document.getElementById('searchValue');
var contentDiv = document.getElementById('content');

$('#searchValue').on('keyup', function(e) {
    if (e.keyCode === 13) {
        searchPodcast();
    }
});

Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.addObj = function(key,obj) {
    var array = this.getObj(key)
    if (!containsObject(obj, array)){
      array.push(obj)
      return this.setObj(key, array)
    }
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

if (!localStorage.favorites){
  localStorage.setObj("favorites", [])
}

function showFavorites(){
  if(localStorage.favorites){
    var favorites = localStorage.getObj("favorites");
    _.forEach(favorites, function(podcast){
      makePodcastPreview(podcast);
    })
  }
}
showFavorites()

function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].collectionId === obj.collectionId) {
      return true;
    }
  }
  return false;
}

function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}

function clearE(element){
  element.innerHTML = "";
}

function jsonp(url, callback) {
  var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
  window[callbackName] = function(data) {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  var script = document.createElement('script');
  script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
  document.body.appendChild(script);
}

function getXML(feedUrl, callback){
var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from xml where url="' + feedUrl + '"') + '&format=xml&callback=?';
var urltest = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?';
  $.getJSON(yql).done(function (data) {
    xmlDoc = $.parseXML(data.results[0])
    callback(xmlDoc)
  });
}


if(typeof(Storage) !== "undefined") {
  localStorage.setObj("test", ['a','b']);
  console.log(localStorage.getObj("test"))
} else {
  console.log('HTML5 Local Storage is not supported on this browser')
}

function addToFavorites(obj){
  localStorage.addObj("favorites", 
    {
      collectionId: obj.collectionId,
      collectionName: obj.collectionName,
      feedUrl: obj.feedUrl,
      img: obj.artworkUrl600,
      artworkUrl100: obj.artworkUrl100,
      artistName: obj.artistName
    }
  )
}

function unFavorite(obj){
  
}

function makePodcastPreview(obj){
  console.log(obj)
  var div = document.createElement("div");
  var textContainer = document.createElement('div');
  var img = document.createElement("img");
  var title = document.createElement("h2");
  var autor = document.createElement("h3");
  var heartIco = document.createElement("i");
    img.src = obj.artworkUrl100;
    title.innerHTML = obj.collectionName
    autor.innerHTML = obj.artistName
  div.className = "pod-preview"
  div.setAttribute("onclick", "getEpisodes("+"'"+obj.feedUrl+"'"+")")
  div.appendChild(img)
  var array = localStorage.getObj("favorites")
  if (!containsObject(obj, array)){
    heartIco.className = "fa fa-heart favorite"
    heartIco.addEventListener("click", function(){
      addToFavorites(obj)
    })
  } else {
    heartIco.className = "fa fa-heart not-favorite"
    heartIco.addEventListener("click", function(){
      unFavorite(obj)
    })
  }
  textContainer.appendChild(heartIco)
  textContainer.appendChild(title)
  textContainer.appendChild(autor)
  div.appendChild(textContainer)
  contentDiv.appendChild(div);
  return obj
}

function refresh(){
  clearE(contentDiv)
  showFavorites();
}

function appendEpisodes(episodes){
  _.forEach(episodes, function(episode) {
    var date = document.createElement("h1");
      date.innerHTML = $('title',episode).text();
    var audio = document.createElement("audio");
      audio.setAttribute("controls", "controls")
    var source = document.createElement("source");
      source.src = $('enclosure',episode).attr('url');
      audio.appendChild(source)
    var link=$('<a/>').attr('href',$('enclosure',episode).attr('url'))
          .text($('title',episode).text());
    contentDiv.appendChild(date);
    contentDiv.appendChild(audio);
  })
}

function searchPodcast(){
  var url = itunesUrl + '?media=podcast&term=' + inputSearch.value;
  jsonp(url, function(res){
    clearE(contentDiv)
    _.forEach(res.results, function(obj) {
      makePodcastPreview(obj)
    });
  })
}

function getEpisodes(feedUrl){
  getXML(feedUrl, function(res){
    clearE(contentDiv)
    var items=$('channel > item',res);
    appendEpisodes(items)
  })
}