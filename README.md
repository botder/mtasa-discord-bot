# mta-discord-bot
Connects MTA:SA servers and Discord channels by sending messages/commands back and forth.  
**Note:** The recent code update has breaking changes to your `config.json`, please replace _server_ with _guild_, thanks.

## Installation

### MTA:SA
The discord resource requires the socket module on your MTA:SA server. You can find the installation guide
and the binaries on the [MTA wiki](https://wiki.multitheftauto.com/wiki/Modules/Sockets).

The resources themselves require no special setup, you only have to edit the `discord/config.xml` to fit your setup.
The resource **discord** is responsible for message transfer between your MTA:SA server and the Discord relay.
On the other hand, **discord-events** is listening for events on the MTA:SA server to send these to the relay
through the **discord** resource.

> mta/discord/config.xml
```xml
<discord>
    <channel>name-of-your-channel</channel>
    <passphrase>equal-to-the-server-passphrase</passphrase>
    <hostname>localhost</hostname>
    <port>8100</port>
</discord>
```

### Relay
The relay server connects to Discord as a bot user; and starts a socket server listening for connections. I never
bothered to keep the code compatible with older releases of node.js, which might be an issue on some distributions.

The relay code needs a little preparation before you can run it. You have to run the command `npm install` in the `src`
directory to download the node.js modules required by the application. Furthermore, you have to copy the file
`src/example.config.json` to `src/config.json` and edit it to fit your setup
(the passphrase and port must be equal to the **discord** config.xml on your MTA:SA server).

You can start the relay with `node app.js`, but you should consider using [pm2](https://github.com/Unitech/pm2) to restart
the relay automatically on crashes.

> src/example.config.json
```json
{
    "port": 8100,
    "passphrase": "key",
    "guild": "guild.id",
    "bots": [{
        "channel": "channel.name",
        "token": "bot.token"
    }]
}
```

## Notes

### Discord Bots
This application doesn't magically add your bot(s) to your guild(s). You (better said: the guild owner) have to authorize every bot user. Navigate to your bot application on the following page and note the client id:
> https://discordapp.com/developers/applications/me

Then continue to replace the `client_id` field in the URL below and navigate to that page:
> https://discordapp.com/api/oauth2/authorize?scope=bot&permissions=0&client_id=<your_client_id_here>

Proceed by authorizing the bot for the guild of your choice and you're done.
