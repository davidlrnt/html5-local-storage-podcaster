var itunesUrl = 'https://itunes.apple.com/search';
var inputSearch = document.getElementById('searchValue');
var contentDiv = document.getElementById('content');


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

if(localStorage.favorites){
  var favorites = localStorage.getObj("favorites");
  _.forEach(favorites, function(podcast){
    makePodcastPreview(podcast);
  })
}

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
    // console.log(data.results[0])
    xmlDoc = $.parseXML(data.results[0])
    // console.log(xmlDoc)
    var items=$('channel > item',data.results[0]);
    // console.log(items)

    _.forEach(items, function(item) {
      // console.log(item)
        var date = document.createElement("h1");
            date.innerHTML = $('title',item).text();

        var audio = document.createElement("audio");
            audio.setAttribute("controls", "controls")
        var source = document.createElement("source");
        source.src = $('enclosure',item).attr('url');
        audio.appendChild(source)


        var link=$('<a/>').attr('href',$('enclosure',item).attr('url'))
              .text($('title',item).text());

        contentDiv.appendChild(date);
        contentDiv.appendChild(audio);
      // }
    });
    // callback(data)
  });
}


if(typeof(Storage) !== "undefined") {
  localStorage.setObj("test", ['a','b']);
  console.log(localStorage.getObj("test"))
} else {
  console.log('HTML5 Local Storage is not supported on this browser')
}

function addToFavorites(obj){
  console.log("favorite")
  console.log(obj)
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

function makePodcastPreview(obj){
  var div = document.createElement("div");
  var img = document.createElement("img");
  var title = document.createElement("h2");
  var autor = document.createElement("h3");
  var heartImg = document.createElement("img");
    heartImg.src = "img/heart.svg"
    heartImg.className = "favorite"
    heartImg.addEventListener("click", function(){
      addToFavorites(obj)
    });
    img.src = obj.artworkUrl100;
    title.innerHTML = obj.collectionName
    autor.innerHTML = obj.artistName
  div.className = "pod-preview"
  div.setAttribute("onclick", "getEpisodes("+"'"+obj.feedUrl+"'"+")")
  div.appendChild(img)
  div.appendChild(heartImg)
  div.appendChild(title)
  div.appendChild(autor)
  contentDiv.appendChild(div);
  return obj
}

function appendEpisodes(episode){
  // console.log(episode)
  // var div = document.createElement("div");
  // var img = document.createElement("img");
  // var title = document.createElement("h2");
  // var autor = document.createElement("h3");
  //   img.src = obj.artworkUrl100;
  //   title.innerHTML = obj.collectionName
  //   autor.innerHTML = obj.artistName
  // div.className = "pod-preview"
  // div.setAttribute("onclick", "getEpisodes("+"'"+obj.feedUrl+"'"+")")
  // div.appendChild(img)
  // div.appendChild(title)
  // div.appendChild(autor)
  // contentDiv.appendChild(div);
  // return obj
}

function searchPodcast(){
  var url = itunesUrl + '?media=podcast&term=' + inputSearch.value;
  jsonp(url, function(res){
    // console.log(res.results)
    clearE(contentDiv)
    _.forEach(res.results, function(obj) {
      makePodcastPreview(obj)
    });
  })
}

function getEpisodes(feedUrl){
  getXML(feedUrl, function(res){
    // console.log(res.responseData.feed.entries)
    clearE(contentDiv)
    _.forEach(res.responseData.feed.entries, function(episode) {
      appendEpisodes(episode)
    });
  })
}