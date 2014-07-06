var proxyquire = require('proxyquire'),
    EventEmitter = require('events').EventEmitter;

var config = { echonest: { endpoint: 'http://example.com', apiKey: 'ECHONEST_API_KEY' } },
    artistFactory = jasmine.createSpyObj('artistFactory', ['fromEchonest']);
    restler = jasmine.createSpyObj('restler', ['get']);

var echonestService = proxyquire('../../../api/services/echonestService', {
  '../../config/config': config,
  '../../api/models/factories/artistFactory': artistFactory,
  'restler': restler
});

describe('echonestService', function() {
  'use strict';

  beforeEach(function() {
    this.emitter = new EventEmitter();
    restler.get.and.returnValue(this.emitter);
  });

  describe('.getFamiliarArtists', function() {
    beforeEach(function() {
      this.req = echonestService.getFamiliarArtists({
        numArtists: 2
      });
    });

    it('hits the echonest endpoint', function() {
      expect(restler.get).toHaveBeenCalledWith('http://example.com/artist/search', {
        query: jasmine.objectContaining({
          api_key: 'ECHONEST_API_KEY',
          format: 'json',
          bucket: 'familiarity',
          sort: 'familiarity-desc',
          results: 2
        })
      });
    });

    context('when the response is successful', function() {
      beforeEach(function(done) {
        this.thenCallback = jasmine.createSpy('thenCallback');

        artistFactory.fromEchonest.and.callFake(function(artistData) {
          if (artistData === 'artist1data') return 'artist1Obj';
          if (artistData === 'artist2data') return 'artist2Obj';
        });

        this.req.then(this.thenCallback);
        this.emitter.emit('success', {
          response: {
            artists: [
              'artist1data', 'artist2data'
            ]
          }
        });
        process.nextTick(done);
      });

      it('resolves the promise with the returned artists', function() {
        expect(this.thenCallback).toHaveBeenCalledWith(['artist1Obj', 'artist2Obj']);
      });
    });

    context('when the response is a failure', function() {
      beforeEach(function(done) {
        this.catchCallback = jasmine.createSpy('catchCallback');

        this.req.catch(this.catchCallback);
        this.emitter.emit('fail', {
          response: {
            status: {
              code: 3,
              message: "Rate Limit"
            }
          }
        }, { statusCode: 429 });
        process.nextTick(done);
      });

      it('rejects the promise with the error', function() {
        expect(this.catchCallback).toHaveBeenCalledWith(jasmine.objectContaining({
          status: 429,
          code: 3,
          message: "Rate Limit",
        }));
      });
    });
  });
});
