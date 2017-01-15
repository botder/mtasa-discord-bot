
addEvent("onDiscordPacket")

local socket = false

function createSocketFromConfig()
    local config = xmlLoadFile("config.xml")
    local channel = xmlNodeGetValue(xmlFindChild(config, "channel", 0))
    local password = xmlNodeGetValue(xmlFindChild(config, "password", 0))
    local hostname = xmlNodeGetValue(xmlFindChild(config, "hostname", 0))
    local port = tonumber(xmlNodeGetValue(xmlFindChild(config, "port", 0)))
    xmlUnloadFile(config)

    createDiscordPipe(hostname, port, password, channel)
end

function send(packet, payload)
    assert(type(packet) == "string")
    assert(type(payload) == "table")

    socket:write(table.json {
        type = packet,
        payload = payload
    })
end

function createDiscordPipe(hostname, port, password, channel)
    socket = Socket:create(hostname, port, { autoReconnect = true })
    socket.channel = channel
    socket.password = password
    socket.ready = false

    socket:on("ready", 
        function (socket)
            outputDebugString("[Discord] Connected to ".. hostname .." on port ".. port)
            sendRelayAuthPacket(socket)
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
            5000, 1)
        end
    )
end

function sendRelayAuthPacket(socket)
    local salt = md5(getTickCount() + getRealTime().timestamp)

    socket:write(table.json { 
        type = "relay.auth",
        payload = {
            salt = salt,
            password = hash("sha256", salt .. hash("sha512", socket.password))
        }
    })
end

function sendRelayBindPacket(socket)
    socket:write(table.json {
        type = "channel.bind",
        payload = {
            channel = socket.channel
        }
    })
end

function handlePingPacket(socket)
    return socket:write(table.json { type = "pong" })
end

function handleRelayAuthPacket(socket, payload)
    if payload.authenticated then
        outputDebugString("[Discord] Authentication successful")
        sendRelayBindPacket(socket)
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
            socket.ready = true

            socket:write(table.json {
                type = "chat.message.text",
                payload = {
                    author = "Console",
                    text = "Hello :wave:"
                }
            })
        end
    else
        local error = tostring(payload.error) or "unknown error"
        outputDebugString("[Discord] Failed to bind channel: ".. error)
        socket:disconnect()
    end
end

function handleRelayClosePacket(socket)
    outputDebugString("[Discord] Server has closed the connection")
    socket:disconnect()
end

function handleDiscordPacket(socket, packet, payload)
    outputDebugString(("<< %s >> %s"):format(packet, toJSON(payload, true)))

    if packet == "relay.auth" then
        return handleRelayAuthPacket(socket, payload)
    end

    if packet == "relay.close" then
        return handleRelayClosePacket(socket)
    end

    --[[if packet == "ping" then
        return handlePingPacket(socket)
    elseif packet == "auth" then
        return handleAuthPacket(socket, payload)
    elseif packet == "select-channel" then
        return handleSelectChannelPacket(socket, payload)
    elseif packet == "disconnect" then
        return handleDisconnectPacket(socket)
    else
        triggerEvent("onDiscordPacket", resourceRoot, packet, payload)
    end]]
end
