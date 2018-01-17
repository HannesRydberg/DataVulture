var map;
var initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: new google.maps.LatLng(2.8,-187.3),
    mapTypeId: 'terrain'
    })
    initHeatmap()
}

var activeLayers = []

var initHeatmap = (searchquery) => {
    if(searchquery === undefined || searchquery === ""){
        searchquery = "*"
    }
    var heatmapData = []
    var json;
    $.get("http://localhost:3000/JSON/" + searchquery, (data) => {
        json = JSON.parse(data)
        $.each(json, (index, tweet) => {
            //console.log(tweet.longitude, ",", tweet.latitude)
            var latLng = new google.maps.LatLng(tweet.latitude, tweet.longitude)
            heatmapData.push(latLng)
        })
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            dissipating: true,
            map: map,
            radius: 50
        })
        activeLayers.push(heatmap)
    })
}

var clearLayers = () => {
    for(var i = 0; i < activeLayers.length; i++ ){
        activeLayers[i].setMap(null)
    }
    activeLayers.length = 0;
}

$(document).ready(() => {
    $("#filter-button").click(() => {
        clearLayers()
        initHeatmap($("#filter-query").val())
        $("#filtering-on").text(($("#filter-query").val()))
    })

    $("#filter-query").keyup((event) => {
        if(event.keyCode === 13){
            $("#filter-button").click()
        }
    })
})