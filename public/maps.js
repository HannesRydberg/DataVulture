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
    $.get("http://localhost:3000/JSON/tweets/" + searchquery, (data) => {
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

var changeHeatmap = (query) => {
    clearLayers()
    initHeatmap(query)
    if(query === ""){
        $("#filtering-on").text("No Filter, showing all tweets")
    }else {
        $("#filtering-on").text("Filtering on: " + query)
    }
}

$(document).ready(() => {

    $("#filter-button").click(() => {
        changeHeatmap($("#filter-query").val())      
    })

    $("#filter-query").keyup((event) => {
        if(event.keyCode === 13){
            $("#filter-button").click()
        }
    })

    $("#filter-select").change(() => {
        changeHeatmap($("#filter-select :selected").text())
    })

    $.get("http://localhost:3000/JSON/queryList", (data) => {
        var queries = JSON.parse(data)
        $.each(queries, (index, query) => {
            $("#filter-select")
                .append($("<option></option>")
                .attr("value", index)
                .text(query.query))
        })
    })
})