$(function() {
  var width = 1000;//$(window).width();
  var height = 800;//$(window).height();

  var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

  var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.json('/map_data.json', function(data) {
    force.nodes(data.nodes)
    force.links(data.links)
    force.start();

    var links = svg.selectAll("line.link")
      .data(data.links)

    var newLinks = links.enter()
      .append("line")
        .attr("class", "link");

    var nodes = svg.selectAll("g.artist")
      .data(data.nodes)

    var newNodes = nodes.enter()
      .append("g")
        .attr("class", "artist")

    newNodes.append("circle")
        .attr("r", function(d) { return d.radius; })
        .call(force.drag)
      .append("title")
        .text(function(d) { return d.name; });

    newNodes.append("text")
      .text(function(d) { return d.name; })
      .attr("text-anchor", "middle");

    force.on("tick", function() {
      links.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

      nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
  });
});
