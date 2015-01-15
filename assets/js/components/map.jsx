'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react');

var SelectedArtistActions = require('../actions/selected_artist_actions');
var SelectedArtistStore = require('../stores/selected_artist_store');

var ArtistNode = React.createClass({
  propTypes: {
    id: React.PropTypes.string.isRequired,
    radius: React.PropTypes.number.isRequired,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    onMouseOver: React.PropTypes.func,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      onHover: _.noop,
    };
  },

  hoverCallback: function hoverCallback() {
    return SelectedArtistActions.update(this.props);
  },

  render: function render() {
    var x = this.props.x || 0;
    var y = this.props.y || 0;
    var transform = 'translate(' + x + ',' + y + ')';
    var classes = 'artist-node';

    if (this.props.className) {
      classes += ' ' + this.props.className;
    }

    return (
      <g className={classes} transform={transform} onMouseOver={this.hoverCallback}>
        <circle r={this.props.radius}></circle>
        {this.props.children}
      </g>
    );
  },
});

var ArtistLink = React.createClass({
  propTypes: {
    x1: React.PropTypes.number,
    x2: React.PropTypes.number,
    y1: React.PropTypes.number,
    y2: React.PropTypes.number,
  },

  render: function render() {
    return (
      <g className="artist-link">
        <line
          x1={this.props.source.x}
          y1={this.props.source.y}
          x2={this.props.target.x}
          y2={this.props.target.y}>
        </line>
      </g>
    );
  },
});

var Map = React.createClass({
  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    artists: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      width: 800,
      height: 800,
      artists: [],
    };
  },

  force: d3.layout.force()
    .charge(-120)
    .linkDistance(30),

  getInitialState: function getInitialState() {
    return {
      artistNodes: [],
      artistLinks: [],
      highlightedArtist: null,
    };
  },

  componentDidMount: function componentWillMount() {
    var self = this;

    self.force.size([self.props.width, self.props.height]);
    self.force.on('tick', function() {
      self.setState({
        artistNodes: self.force.nodes(),
        artistLinks: self.force.links(),
      });
    });

    SelectedArtistStore.listen(this._updateHighlightedArtist);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var echonestIds = _.map(nextProps.artists, _.createCallback('echonestId'));

    var artistNodes = _.map(nextProps.artists, function(artist) {
      return {
        id: artist.echonestId,
        name: artist.name,
        radius: Math.ceil(100 * Math.pow(artist.familiarity, 10)),
        x: artist.mapData ? artist.mapData.x : null,
        y: artist.mapData ? artist.mapData.y : null,
        fixed: (artist.mapData && artist.mapData.x),
      };
    });

    var artistLinks = _(nextProps.artists).map(function(artist, sourceArtistIndex) {
      return _.map(artist.similar, function(similarArtist) {
        var similarArtistIndex = _.indexOf(echonestIds, similarArtist.echonestId);
        if (similarArtistIndex !== -1) {
          return {
            source: sourceArtistIndex,
            target: similarArtistIndex,
          };
        }
      });
    }).flatten().compact().value();

    this.setState({
      artistLinks: artistLinks,
      artistNodes: artistNodes,
    });

    this.force.stop();
    this.force.nodes(artistNodes);
    this.force.links(artistLinks);
    this.force.start();
  },

  render: function render() {
    var nodes = _(this.state.artistNodes).map(function(node, i) {
      return (
        <ArtistNode key={'node'+i} {...node} onMouseOver={this.onArtistNodeHover}></ArtistNode>
      );
    }, this).reverse().value();

    var links = _.map(this.state.artistLinks, function(link, i) {
      return (
        <ArtistLink key={'link'+i} {...link}></ArtistLink>
      );
    });

    var highlightedArtist = this.state.highlightedArtist ? (
      <ArtistNode className='highlight' key='node-highlighted' {...this.state.highlightedArtist}>
        <text textAnchor='middle'>{this.state.highlightedArtist.name}</text>
      </ArtistNode>
    ) : null;

    return (
      <div className='map'>
        <svg width={this.props.width} height={this.props.height}>
          {links}
          {nodes}
          {highlightedArtist}
        </svg>
      </div>
    );
  },

  _updateHighlightedArtist: function onArtistNodeHover(artistNode) {
    this.setState({
      highlightedArtist: artistNode,
    });
  },
});

module.exports = Map;
