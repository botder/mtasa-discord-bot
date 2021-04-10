'use strict';

const Handler = require('./Handler');

let race = {
	player_count: 0,
	max_players: 0
};

let mix = {
	player_count: 0,
	max_players: 0
};

class ServerStatusHandler extends Handler {
	constructor() {
		super();

		this.types.add('server.player_count_race');
		this.types.add('server.player_count_mix');
	}

	execute(bot, session, type, payload) {
		if (type === 'server.player_count_race') {
			race = payload;
		} else if (type === 'server.player_count_mix') {
			mix = payload;
		}

		bot.setActivity(`Race: ${race.player_count}/${mix.max_players} | Mix: ${mix.player_count}/${mix.max_players}`);
	}
}

module.exports = ServerStatusHandler;
