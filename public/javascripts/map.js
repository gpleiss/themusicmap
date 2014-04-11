(function(global) {
  global.Map = function Map(selector, options) {
    options = options || {};
    var width = options.width ? options.width : $(global).width();
    var height = options.height ? options.height : $(global).height();

    this._width = width;
    this._height = height;
    this._svg = null;
    this._force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height]);

    this.el = d3.select(selector);
  }

  Map.prototype.render = function render() {
    this._svg = this.el.append("svg")
      .attr("width", this._width)
      .attr("height", this._height);

    fetchAndDrawNodes.call(this);
  }

  Map.prototype.nodes = function nodes() {
    return this._force.nodes();
  }

  function fetchAndDrawNodes() {
    var self = this;
    d3.json('/map_data.json', function(data) {
      self._force.nodes(data.nodes);
      self._force.links(data.links);
      self._force.start();

      var links = self._svg.selectAll("line.link")
        .data(data.links);

      var nodes = self._svg.selectAll("g.artist")
        .data(data.nodes);

      self._force.on("tick", function() {
        nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        links.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      });

      drawNewNodes.call(self, nodes);
      drawNewLinks.call(self, links);
    });
  }

  function drawNewNodes(nodes) {
    var newNodes = nodes.enter()
      .append("g")
        .attr("class", "artist");

    newNodes.append("circle")
        .attr("r", function(d) { return d.radius; })
        .call(this._force.drag)
      .append("title")
        .text(function(d) { return d.name; });

    newNodes.append("text")
      .text(function(d) { return d.name; })
      .attr("text-anchor", "middle");
  }

  function drawNewLinks(links) {
    var newLinks = links.enter()
      .append("line")
        .attr("class", "link");
  }
})(this);
