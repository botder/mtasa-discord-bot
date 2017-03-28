
addEvent("onDiscordPacket")

local socket = false

function createSocketFromConfig()
     local config = xmlLoadFile("config.xml")
     local channel = xmlNodeGetValue(xmlFindChild(config, "channel", 0))
     local passphrase = xmlNodeGetValue(xmlFindChild(config, "passphrase", 0))
     local hostname = xmlNodeGetValue(xmlFindChild(config, "hostname", 0))
     local port = tonumber(xmlNodeGetValue(xmlFindChild(config, "port", 0)))
     xmlUnloadFile(config)

     createDiscordPipe(hostname, port, passphrase, channel)
end

function send(packet, payload)
    assert(type(packet) == "string")
    assert(type(payload) == "table")

    socket:write(table.json {
        type = packet,
        payload = payload
    })
end

function createDiscordPipe(hostname, port, passphrase, channel)
    socket = Socket:create(hostname, port, { autoReconnect = true })
    socket.channel = channel
    socket.passphrase = passphrase
    socket.bindmessage = false

    socket:on("ready",
        function (socket)
            outputDebugString("[Discord] Connected to ".. hostname .." on port ".. port)
            sendAuthPacket(socket)
        end
    )

    socket:on("data", handleDiscordPacket)

    socket:on("close",
        function (socket)
            outputDebugString("[Discord] Disconnected from ".. hostname)

            setTimer(
                function ()
                    outputDebugString("[Discord] Reconnecting now..")
                    socket:connect()
                end,
            15000, 1)
        end
    )
end

function sendAuthPacket(socket)
    local salt = md5(getTickCount() + getRealTime().timestamp)

    socket:write(table.json {
        type = "auth",
        payload = {
            salt = salt,
            passphrase = hash("sha256", salt .. hash("sha512", socket.passphrase))
        }
    })
end

function handlePingPacket(socket)
    return socket:write(table.json { type = "pong" })
end

function handleAuthPacket(socket, payload)
    if payload.authenticated then
        outputDebugString("[Discord] Authentication successful")

        socket:write(table.json {
            type = "select-channel",
            payload = {
                channel = socket.channel
            }
        })
    else
        local error = tostring(payload.error) or "unknown error"
        outputDebugString("[Discord] Failed to authenticate: ".. error)
        socket:disconnect()
    end
end

function handleSelectChannelPacket(socket, payload)
    if payload.success then
        if payload.wait then
            outputDebugString("[Discord] Bot isn't ready")
        else
            outputDebugString("[Discord] Channel has been bound")

            if not socket.bindmessage then
                socket:write(table.json {
                    type = "chat.message.text",
                    payload = {
                        author = "Server",
                        text = "Hello :wave:"
                    }
                })

                socket.bindmessage = true
            end
        end
    else
        local error = tostring(payload.error) or "unknown error"
        outputDebugString("[Discord] Failed to bind channel: ".. error)
        socket:disconnect()
    end
end

function handleDisconnectPacket(socket)
    outputDebugString("[Discord] Server has closed the connection")
    socket:disconnect()
    socket.bindmessage = false
end

function handleDiscordPacket(socket, packet, payload)
    if packet == "ping" then
        return handlePingPacket(socket)
    elseif packet == "auth" then
        return handleAuthPacket(socket, payload)
    elseif packet == "select-channel" then
        return handleSelectChannelPacket(socket, payload)
    elseif packet == "disconnect" then
        return handleDisconnectPacket(socket)
    else
        triggerEvent("onDiscordPacket", resourceRoot, packet, payload)
    end
end
