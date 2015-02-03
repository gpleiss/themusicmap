'use strict';

var _ = require('lodash');
var d3 = require('d3');
var React = require('react/addons');
var Reflux = require('reflux');
var cx = React.addons.classSet;

var ArtistNodeActions = require('../actions/artist_node_actions');
var ArtistNodeStore = require('../stores/artist_node_store');
var SelectedArtistActions = require('../actions/selected_artist_actions');
var SelectedArtistStore = require('../stores/selected_artist_store');

var ArtistNode = React.createClass({
  propTypes: {
    echonestId: React.PropTypes.string.isRequired,
    radius: React.PropTypes.number.isRequired,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    scale: React.PropTypes.number,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      scale: 1,
    };
  },

  render: function render() {
    var x = this.props.x || 0;
    var y = this.props.y || 0;
    var transform = 'translate(' + x + ',' + y + ')scale(' + Math.pow(this.props.scale, -0.4) + ')';

    var classes = cx({
      'artist-node': true,
      highlight: this.props.highlight,
    });

    return (
      <g className={classes} transform={transform} onMouseOver={this._hoverCallback}>
        <circle r={this.props.radius}></circle>
      </g>
    );
  },

  _hoverCallback: function hoverCallback() {
    return SelectedArtistActions.update(this.props.echonestId);
  },
});

var ArtistLink = React.createClass({
  propTypes: {
    x: React.PropTypes.objectOf(React.PropTypes.number),
    y: React.PropTypes.objectOf(React.PropTypes.number),
    scale: React.PropTypes.number,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      scale: 1,
    };
  },

  render: function render() {
    var strokeWidth = Math.pow(this.props.scale, -0.6);

    return (
      <g className="artist-link">
        <line
          x1={this.props.source.x}
          y1={this.props.source.y}
          x2={this.props.target.x}
          y2={this.props.target.y}
          strokeWidth={strokeWidth}>
        </line>
      </g>
    );
  },
});

var ArtistName = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    x: React.PropTypes.number,
    y: React.PropTypes.number,
    scale: React.PropTypes.number,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      scale: 1,
    };
  },

  // TODO: check unmounting

  render: function render() {
    var x = this.props.x || 0;
    var y = this.props.y || 0;
    var transform = 'translate(' + x + ',' + y + ')scale(' + Math.pow(this.props.scale, -0.4) + ')';

    return (
      <g className='artist-name' transform={transform}>
        <text textAnchor='middle'>{this.props.name}</text>
      </g>
    );
  },
});

var Map = React.createClass({
  mixins: [Reflux.ListenerMixin],

  propTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    fluid: React.PropTypes.bool,
  },

  getDefaultProps: function getDefaultProps() {
    return {
      fluid: false,
    };
  },

  getInitialState: function getInitialState() {
    return {
      artistNodes: [],
      artistLinks: [],
      highlightedArtist: null,
      scale: 1,
      translate: [0,0],
    };
  },

  componentDidMount: function componentWillMount() {
    ArtistNodeActions.init(this.props.width, this.props.height, this.props.fluid);

    this.listenTo(SelectedArtistStore, this._updateHighlightedArtistId);
    this.listenTo(ArtistNodeStore, this._update);

    this.zoom(d3.select(this.getDOMNode()));
  },

  _update: function(artistNodes, artistLinks) {
    this.setState({
      artistLinks: artistLinks,
      artistNodes: artistNodes,
    });
  },

  render: function render() {
    var highlightedArtist = _.find(this.state.artistNodes, {echonestId: this.state.highlightedArtistId});

    var nodes = _(this.state.artistNodes).map(function(node) {
      var highlight = (node.echonestId === this.state.highlightedArtistId);
      return (
        <ArtistNode key={node.echonestId} 
          highlight={highlight}
          scale={this.state.scale}
          {...node} />
      );
    }, this).reverse().value();

    var links = _.map(this.state.artistLinks, function(link, i) {
      return (
        <ArtistLink key={'link'+i}
          scale={this.state.scale}
          {...link} />
      );
    }, this);

    var highlightedArtistName = highlightedArtist ? (
      <ArtistName 
        scale={this.state.scale}
        {...highlightedArtist} />
    ) : null;

    return (
      <div className='map'>
        <svg width={this.props.width} height={this.props.height}>
          <g transform={'translate(' + this.state.translate + ')scale(' + this.state.scale + ')'}>
            {links}
            {nodes}
            {highlightedArtistName}
          </g>
        </svg>
      </div>
    );
  },

  zoom: function(selection) {
    var zoomBehavior = d3.behavior.zoom()
      .scaleExtent([1, 8])
      .on('zoom', this._onZoom);
    return zoomBehavior(selection);
  },

  _updateHighlightedArtistId: function(artistId) {
    this.setState({
      highlightedArtistId: artistId,
    });
  },

  _onZoom: function() {
    this.setState({
      translate: d3.event.translate,
      scale: d3.event.scale,
    });
  },
});

module.exports = Map;
