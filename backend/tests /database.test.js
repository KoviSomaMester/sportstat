const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Game = require('../models/Game');
const Coach = require('../models/Coach');

describe('Database Connection & Models', () => {
  
  test('MongoDB should be connected', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('Should have correct MongoDB URI', () => {
    expect(mongoose.connection.name).toBeTruthy();
  });

  test('User model should exist', () => {
    expect(User).toBeTruthy();
  });

  test('Team model should exist', () => {
    expect(Team).toBeTruthy();
  });

  test('Player model should exist', () => {
    expect(Player).toBeTruthy();
  });

  test('Game model should exist', () => {
    expect(Game).toBeTruthy();
  });

  test('Coach model should exist', () => {
    expect(Coach).toBeTruthy();
  });

  test('User email should be unique', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  test('User username should be unique', async () => {
    const userData = {
      username: 'uniqueuser',
      email: 'unique1@example.com',
      password: 'password123'
    };
    
    await User.create(userData);
    
    const duplicateData = {
      username: 'uniqueuser',
      email: 'unique2@example.com',
      password: 'password123'
    };
    
    await expect(User.create(duplicateData)).rejects.toThrow();
  });

  test('User email index should be created', async () => {
    const indexes = await User.collection.getIndexes();
    expect(Object.keys(indexes).some(key => key.includes('email'))).toBe(true);
  });

  test('Team name should be trimmed', async () => {
    const team = await Team.create({
      name: '  Test Team  ',
      sport: 'football',
      city: 'Budapest',
      founded: 2000
    });
    
    expect(team.name).toBe('Test Team');
  });

  test('Player jerseyNumber should be within range (1-99)', async () => {
    const team = await Team.create({
      name: 'Test Team',
      sport: 'football',
      city: 'Budapest',
      founded: 2000
    });
    
    const invalidPlayer = {
      name: 'Test Player',
      position: 'Forward',
      jerseyNumber: 100,
      team: team._id
    };
    
    await expect(Player.create(invalidPlayer)).rejects.toThrow();
  });

  test('Player age should be within valid range (16-50)', async () => {
    const team = await Team.create({
      name: 'Test Team',
      sport: 'football',
      city: 'Budapest',
      founded: 2000
    });
    
    const invalidPlayer = {
      name: 'Test Player',
      position: 'Forward',
      age: 15,
      team: team._id
    };
    
    await expect(Player.create(invalidPlayer)).rejects.toThrow();
  });

  test('Team sport should be from enum', async () => {
    const invalidTeam = {
      name: 'Test Team',
      sport: 'invalid_sport',
      city: 'Budapest',
      founded: 2000
    };
    
    await expect(Team.create(invalidTeam)).rejects.toThrow();
  });

  test('User role should default to "user"', async () => {
    const user = await User.create({
      username: 'defaultrole',
      email: 'defaultrole@example.com',
      password: 'password123'
    });
    
    expect(user.role).toBe('user');
  });

  test('Team createdAt should be automatically set', async () => {
    const team = await Team.create({
      name: 'Test Team',
      sport: 'football',
      city: 'Budapest',
      founded: 2000
    });
    
    expect(team.createdAt).toBeTruthy();
    expect(team.createdAt instanceof Date).toBe(true);
  });

  test('Player should reference Team via ObjectId', async () => {
    const team = await Team.create({
      name: 'Reference Team',
      sport: 'basketball',
      city: 'Budapest',
      founded: 2010
    });
    
    const player = await Player.create({
      name: 'Test Player',
      position: 'Forward',
      team: team._id
    });
    
    expect(player.team.toString()).toBe(team._id.toString());
  });

  test('Team founded year minimum should be 1800', async () => {
    await expect(Team.create({
      name: 'Old Team',
      sport: 'football',
      city: 'Budapest',
      founded: 1799
    })).rejects.toThrow();
  });

  test('Player stats should initialize with default values', async () => {
    const team = await Team.create({
      name: 'Stats Team',
      sport: 'football',
      city: 'Budapest',
      founded: 2015
    });
    
    const player = await Player.create({
      name: 'Stats Player',
      position: 'Midfielder',
      team: team._id
    });
    
    expect(player.stats.gamesPlayed).toBe(0);
    expect(player.stats.goals).toBe(0);
    expect(player.stats.rating).toBe(0);
  });
});
