var proxyquire = require('proxyquire'),
    Artist = require('../../../../api/models/artist');

var artistFactory = proxyquire('../../../../api/models/factories/artistFactory', {});

describe('artistFactory', function() {
  'use strict';

  it('returns an artist object from echonest data', function() {
    this.newArtist = artistFactory.fromEchonest({
      id: 'echo123',
      name: 'Mouse Rat',
      familiarity: '0.99',
    });

    expect(this.newArtist instanceof Artist).toBeTruthy();
    expect(this.newArtist.echonestId).toEqual('echo123');
    expect(this.newArtist.name).toEqual('Mouse Rat');
    expect(this.newArtist.familiarity).toEqual(0.99);
  });
});
