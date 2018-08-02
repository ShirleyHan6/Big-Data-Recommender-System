var smallDataset = "data/result2.json",
    largeDataset = "data/result.json";
var dataset= "data/result2.json";

var width1 = 400,
    height1 = 300,
    width = 1400,
    height = 1000;
//buttons SVG
/*
var svg2 = d3.select("body").append('svg')
             .attr("width", width1)
             .attr("height",height1);

var data = [{label: "small dataset",     x: width1-300, y: height1-250},
            {label: "larger dataset",    x: width1-100, y: height1-250}];

var button = d3.button()
    .on('press', function(d, i) {dataset = largeDataset;console.log(dataset);})
    .on('release', function(d, i) { console.log("Released", d, i, this.parentNode)});


// Add buttons
var buttons = svg2.selectAll('.button')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'button')
    .call(button);

    buttons.on("press", function(d){
      console.log(dataset);
      for(i=0;i<data.length;i++){
      if(d.data[i].label=="larger dataset"){
                                 dataset = largeDataset;
                                 console.log(dataset);
                               }}
                           });
//console.log(dataset);


//data visualization SVG
$(document).ready(function() {
    $(".searchbtn").click(function() {
      dataset = $(this).attr("data-name");
       alert("Creating the visualization.");
    });
});
*/
var queryID = getParameterByName('query');
var visible_num = 1000;
var svg = d3.select("body").append("svg")
          .attr("width", 1400)
          .attr("height",800);

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function unique(arr) {
    var u = {}, a = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

function cleanData(json) {
    var DATA = {
        "nodes": [],
        "links": []
    };
    var nodes = [];
    for (var i = 0; i < json.links.length; ++i) {
        var leftRange = parseInt(queryID) - visible_num;
        var rightRange = parseInt(queryID) + visible_num;
        if ((leftRange <= json.links[i].source && rightRange >= json.links[i].source)
            || (leftRange <= json.links[i].target && rightRange >= json.links[i].target)) {
            nodes.push(json.links[i].source);
            nodes.push(json.links[i].target);
            DATA.links.push(json.links[i]);
        }
    }
    nodes = unique(nodes);
    for (var j = 0; j < nodes.length; ++j) {
        DATA.nodes.push({
            "id": nodes[j]
        });
    }
    return DATA;
}

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d){
        return d.id;
    }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));
d3.json(
  smallDataset, function(error, jsonData) {
    if (error) throw error;
    console.log("in the function");
    console.log(dataset);

    var graph = cleanData(jsonData);
    if (graph.nodes.length <= 1) {
        return;
    }
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return (Math.sqrt(d.value * 2))/10;
        })
        .attr("fill", 'black');

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("font-size", "small")
        .style("font-weight", "600")
        .style("margin-left", "10px")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("xxx");

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function (d) {
            if (d.id == queryID) {
                return 20;
            } else {
                return 4;
            }
        })
        .style("fill", function(d){
          if(d.id == queryID){
            return 'blueviolet';
          } else {
            var hue = 'rgb(' + (Math.floor(Math.random() * 255.0)) + ',' +
            (Math.floor(Math.random() * 255.0)) + ','
            + (Math.floor(Math.random() * 255.0)) + ')';
            return hue;
          }
        })
        .on("mouseover", function () {
            tooltip.text("<- " + d3.select(this).text());
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function () {
            return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            return tooltip.style("visibility", "hidden");
        })
        .on("mousedown", function () {
            location.href = '?query=' + d3.select(this).text();
        })
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

    node.append("title")
        .text(function (d) {
            return d.id;
        });

    simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

    simulation.force("link")
          .links(graph.links);

    function ticked() {
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });
            node.attr("cx", function (d) {
                       return d.x;
                   })
                   .attr("cy", function (d) {
                       return d.y;
                   });


    }
});

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

$(".searchbar").val(queryID);
