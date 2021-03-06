// Function to make sure the script will wait for page to load.
$(document).ready(function () {

//Global variables
var searchResultsEl = document.getElementById("search-results-container");
var submitButtonEl = document.getElementById("submit-button");
var lyricsResultEl = document.getElementById("lyrics-result");
var showResultsEl = document.getElementById("search-results");
var pastSearchIdList = JSON.parse(localStorage.getItem("songIdList")) || [];
var pastSearchList = JSON.parse(localStorage.getItem("searchTerms")) || [];
var player;
var searchResultsHeadClone = $("#searchResultsHthree").clone();
var videoTitle = "";
var videoDescript = "";
var videoInfo = {};
//var mockResponse = {"kind":"youtube#searchListResponse","etag":"g-kFa1lNH68H6Ttht2jmkgMJg3k","nextPageToken":"CAEQAA","regionCode":"US","pageInfo":{"totalResults":1000000,"resultsPerPage":1},"items":[{"kind":"youtube#searchResult","etag":"enGOs3s6Lm3RSB55akzDLfTp1Jc","id":{"kind":"youtube#video","videoId":"fJ9rUzIMcZQ"},"snippet":{"publishedAt":"2008-08-01T11:06:40Z","channelId":"UCiMhD4jzUqG-IgPzUmmytRQ","title":"Queen – Bohemian Rhapsody (Official Video Remastered)","description":"REMASTERED IN HD TO CELEBRATE ONE BILLION VIEWS! Taken from A Night At The Opera, 1975. Click here to buy the DVD with this video at the Official ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/fJ9rUzIMcZQ/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/fJ9rUzIMcZQ/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg","width":480,"height":360}},"channelTitle":"Queen Official","liveBroadcastContent":"none","publishTime":"2008-08-01T11:06:40Z"}}]}

// use second key if first doesn't work
var youtubeApiKey = "AIzaSyBEAdeJtkgZUKEVISq0X4s5yA6X7yd2894";
// var youtubeApiKey = "AIzaSyDUbNHIIC-j1KrC8msbrELWzxpm8nMCH08";

// Function to get search term from input fields
$("#submit-button").on("click", function() {
    var artistSearch = document.querySelector("#artistField").value;
    var songSearch = document.querySelector("#songField").value;
    var searchTerm = artistSearch + " " + songSearch;
    var youtubeList = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&type=video&q=" + searchTerm  + "&key=" + youtubeApiKey;

    localStorage.setItem("searchTermPass", artistSearch + "-" + songSearch);
    showResultsEl.innerHTML = "";
    
    fetch(youtubeList)
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        if (artistSearch == "" || songSearch == "") {
            var emptyFldError = document.getElementById('searchResultsHthree');
            emptyFldError.textContent = "Please enter both an artist and a song title!";
            emptyFldError.style.color = 'red';
            emptyFldError.style.fontWeight = 'bolder';
            emptyFldError.style.textAlign = 'center';
            emptyFldError.style.textDecoration = 'underline red';
        }
        else {
            $("#searchResultsHthree").replaceWith(searchResultsHeadClone.clone());
            var idToPass = response.items[0].id.videoId;
            pastSearches(localStorage.getItem("searchTermPass"), idToPass);
            

            loadData(response);
        }
    })
    .catch(function(error) {
        var ytApiError = document.createElement("p");
        ytApiError.classList.add("youtube-api-error");
        ytApiError.innerText = "There was an error retrieving results for your request";
        showResultsEl.appendChild(ytApiError);
    })

    displaySearchResults();
})

//Loads results data to the search results container
function loadData(data) {
    var resultsButtonEl = document.getElementById("search-results");
    var idToPass = data.items[0].id.videoId;

    pastSearches(localStorage.getItem("searchTermPass"), idToPass);

    var videos = data.items;

    for (var i=0; i < videos.length; i++) {
        var title = videos[i].snippet.title;
        var videoId = videos[i].id.videoId;
        var videoDescript = videos[i].snippet.description;
        var videoTitle = videos[i].snippet.title;
        var resultsButton = document.createElement("button");
        resultsButton.className = "resultsButton";
        resultsButton.innerHTML = title;
        resultsButton.id = videoId;
        videoInfo[videoId]= {};
        videoInfo[videoId].title = videoTitle;
        videoInfo[videoId].descript = videoDescript;
        resultsButtonEl.appendChild(resultsButton);
    }
}

//Function to save unique search terms to local storage and create buttons for past searches
function pastSearches(searchTerm, songId){
    var pastSearchEl = document.getElementById("past-searches-container");
    var pastSearchesArray = JSON.parse(localStorage.getItem("searchTerm")) || [];
    var artistSearch = document.querySelector("#artistField").value;
    var songSearch = document.querySelector("#songField").value;
    var searchObj = {
        artist: artistSearch, 
        title: songSearch,
        id: songId
    };

    if(!(pastSearchesArray.some((e => e.artist === searchObj.artist) && (e => e.title === searchObj.title)))) {
        if((searchObj.artist !== "") && (searchObj.title !== "")) {
            pastSearchesArray.push(searchObj);
            localStorage.setItem("searchTerm", JSON.stringify(pastSearchesArray));
            var pastSearchLi = document.createElement("button");
            pastSearchLi.classList.add("past-button");
            pastSearchLi.setAttribute("id", searchObj.artist + "-" + searchObj.title + "-" + searchObj.id);
            pastSearchLi.innerHTML = searchTerm;
            pastSearchEl.appendChild(pastSearchLi);
        }
    }
}

//Function to click on past search and display results
$("#past-searches-container").on("click", "button", function() {
    var pastSearchesArray = JSON.parse(localStorage.getItem("searchTerm")) || [];
    var idArray = $(this).attr("id").split("-");
    var artistName = idArray[0];
    var titleName = idArray[1];
    var songId = idArray[2];
    
    for (var i=0; i < pastSearchesArray.length; i++) {
        if (artistName === pastSearchesArray[i].artist && titleName === pastSearchesArray[i].title) {
            document.querySelector("#artistField").value = artistName;
            document.querySelector("#songField").value =  titleName;
            document.querySelector("#submit-button").click();
        }
    }
    
    localStorage.setItem("songId", songId);
});

//Function to click result button to see youtube video and lyrics
$("#results-container").on("click", "button", function() {
    var videoId = $(this).attr("id");
    getLyrics();
    localStorage.setItem("songId", videoId);

    var titleDescriptEl = document.querySelector("#title-description");
    var titleEl = document.createElement("h4");
    titleDescriptEl.innerHTML = "";
    titleEl.innerText = videoInfo[videoId].title
    titleEl.classList.add("row");
    titleDescriptEl.appendChild(titleEl);

    var descriptEl = document.createElement("p");
    descriptEl.innerText = videoInfo[videoId].descript
    descriptEl.classList.add("row");
    titleDescriptEl.appendChild(descriptEl);

})


//Additional functions for the YoutubeAPI to work as intended
$("#results-container").on("click", "button", function onYouTubeIframeAPIReady() {
    if(player) {
        player.destroy();
    }

    var songId = "";

    if($(this).hasClass("resultsButton")) {
        songId = $(this).attr("id");
    } else {
        var idPieces = $(this).attr("id")
        var idArray = idPieces.split("-");
        songId = idArray[2];
    }

    localStorage.setItem("videoIdToPlay", songId);

    if(songId !== undefined) {
  
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: songId,
          playerVars: {
            'playsinline': 1
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
    }
});

function onPlayerReady(event) {
    var videoId = localStorage.getItem("videoIdToPlay");
    event.target.loadVideoById(videoId);

    addLink(videoId);
}

function onPlayerStateChange(event) {
    var done = false;
    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo, 6000);
      done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

function addLink(videoId) {
    if(videoId) {
        var videoLinkEl = document.getElementById("video-link");

        videoLinkEl.innerHTML = "";
    
        var includeLink= document.createElement("a");
        includeLink.href = "https://www.youtube.com/watch?v=" + videoId;
        includeLink.target = "_blank";
        includeLink.innerText = "Video not working? Try this link";
        includeLink.classList.add("lyrics-link");
    
        videoLinkEl.appendChild(includeLink);
    }
}


function displaySearchResults() {
    searchResultsEl.style.visibility = "visible";
    showResultsEl.style.visibility = "visible";
}

//Function to get and return lyrics from MusixMatch
function getLyrics(){
    var artistValue = document.querySelector("#artistField").value;
    var songValue = document.querySelector("#songField").value;

    var apiKey = "https://api.musixmatch.com/ws/1.1/track.search?q_artist="+ artistValue + "&q_track=" + songValue + "&page_size=3&page=1&s_track_rating=desc&apikey=b821d7d8d4a306e5ec045464dcd5ed20";

    //Call to MusixMatch API based on user artist and song inputs
    fetch(apiKey)
    .then(function(response) {
        return response.json();
    })
    .then(function(response) {
        var responseData = response.message.body;
        
        //Retrieves track ID and matches another fetch request to get the lyrics
        var songId = "https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id="+ responseData.track_list[0].track.track_id + "&apikey=b821d7d8d4a306e5ec045464dcd5ed20";

        return fetch(songId);
        
    })
    .then(function(songIdResponse) {
        return songIdResponse.json();
    })
    .then(function(songIdResponse) {

        var songIdData = songIdResponse.message.body
        
        var copyRightAllowed = songIdData.lyrics.lyrics_copyright;
        var lyrics = songIdData.lyrics.lyrics_body;
        var lyricParagraph = document.createElement("p");
        
        clearLyrics();


        //If copyright law allows any of the lyrics to be reprinted, there are printed here
        //Songs with copyright issues do not print any lyrics but an error message instead
        if(copyRightAllowed == "Unfortunately we're not authorized to show these lyrics.") {
            //Print error message here
            lyricParagraph.innerText = "Copyright law does not allow these lyrics to be printed";
            lyricsResultEl.appendChild(lyricParagraph);
        } else {
            //Print lyrics to page here
            lyricParagraph.classList.add("lyrics-text");
            lyricParagraph.innerText = lyrics;
            lyricsResultEl.appendChild(lyricParagraph);
        }
    })
    //Catch function will exectute if there are no lyrics on MusixMatch for the search term or if an error occurred
    .catch(function(error) {
        clearLyrics();
        var noLyricsParagraph = document.createElement("p");
        noLyricsParagraph.classList.add("lyrics-text");
        noLyricsParagraph.innerText = "We cannot find your lyrics :(";
        lyricsResultEl.appendChild(noLyricsParagraph);
    })
}

function clearSearchValues() {
    $("#artistField")[0].value = "";
    $("#songField")[0].value = "";
}

function loadLocalStorage(){
    var pastSearchEl = document.querySelector("#past-searches-container");

    var storedSearches = JSON.parse(localStorage.getItem("searchTerm")) || [];
    
    for (var j=0; j < storedSearches.length; j++) {
        var pastSearchLi = document.createElement("button");
        pastSearchLi.classList.add("past-button");
        pastSearchLi.setAttribute("id", storedSearches[j].artist + "-" + storedSearches[j].title + "-" + storedSearches[j].id)
        pastSearchLi.innerHTML = storedSearches[j].artist + "-" + storedSearches[j].title;
        pastSearchEl.appendChild(pastSearchLi);
    }
}



//Clears text in the lyrics result div
function clearLyrics(){
    lyricsResultEl.innerHTML = "";
}

//Event listeners and functions to load website
submitButtonEl.addEventListener("click", displaySearchResults);
loadLocalStorage();

});