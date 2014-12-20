(function(global) {
  global.Map = function Map(selector, options) {
    options = options || {};
    var width = options.width ? options.width : 800;
    var height = options.height ? options.height : 800;

    this._width = width;
    this._height = height;
    this._svg = null;
    this._force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height]);

    this.el = d3.select(selector);
  }

  Map.prototype.render = function render(options) {
    options = options || {};

    var svg = this._svg = this.el.select("#map").append("svg")
        .attr("width", this._width)
        .attr("height", this._height);

    var list = this._list = this.el.select("#list").append("ul");

    fetchAndDrawNodes.call(this, !!options.fluidMap);
  }

  Map.prototype.nodes = function nodes() {
    return this._force.nodes();
  }

  function fetchAndDrawNodes(isFluidMap) {
    var self = this;
    d3.json('/artists.json?fluid=' + isFluidMap, function(data) {
      var linkData = [];

      var nodeData = _.map(data.artists, function(artist) {
        return {
          id: artist.echonestId,
          name: artist.name,
          radius: Math.ceil(100 * Math.pow(artist.familiarity, 10)),
          x: artist.mapData ? artist.mapData.x : null,
          y: artist.mapData ? artist.mapData.y : null,
          fixed: (artist.mapData && artist.mapData.x),
        };
      });

      _.each(data.artists, function(artist, sourceArtistIndex) {
        _.each(artist.similar, function(similarArtist) {
          var similarArtistIndex = _.indexOf(_.map(data.artists, _.createCallback('echonestId')), similarArtist.echonestId);

          if (similarArtistIndex !== -1) {
            linkData.push({
              source: sourceArtistIndex,
              target: similarArtistIndex
            });
          }
        });
      });

      self._force.nodes(nodeData);
      self._force.links(linkData);
      self._force.start();

      var links = self._svg.selectAll("line.link")
        .data(linkData);

      var nodes = self._svg.selectAll("g.artist.artist-node")
        .data(nodeData);

      var names = self._list.selectAll("li.artist.artist-name")
        .data(nodeData);

      self._force.on("tick", function() {
        nodes.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        links.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      });

      drawNewNodes.call(self, nodes);
      drawNewLinks.call(self, links);
      drawNewNames.call(self, names);

      $(".artist").hover(function(e) {
        var artistId = $(e.currentTarget).data("artist-id");
        d3.selectAll(".artist[data-artist-id=\"" + artistId + "\"]").classed("highlight", true);
      }, function() {
        d3.selectAll(".highlight").classed("highlight", false);
      });
    });
  }

  function drawNewNodes(nodes) {
    var newNodes = nodes.enter()
      .append("g")
        .attr("class", "artist artist-node")
        .attr("data-artist-id", function(d) { return d.id });

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

  function drawNewNames(names) {
    var newNames = names.enter()
      .append("li")
        .attr("class", "artist artist-name")
        .attr("data-artist-id", function(d) { return d.id })
        .text(function(d) { return d.name; });
  }
})(this);
