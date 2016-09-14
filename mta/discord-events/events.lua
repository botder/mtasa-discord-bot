
function string:monochrome()
    local colorless = self:gsub("#%x%x%x%x%x%x", "")

    if colorless == "" then
        return self:gsub("#(%x%x%x%x%x%x)", "#\1%1")
    else
        return colorless
    end
end

function getPlayerName(player)
    return player.name:monochrome()
end

addEvent("onDiscordUserCommand")

addEventHandler("onPlayerJoin", root,
    function ()
        exports.discord:send("player.join", { player = getPlayerName(source) })
    end
)

addEventHandler("onPlayerQuit", root,
    function (quitType, reason, responsible)
        local playerName = getPlayerName(source)
        
        if isElement(responsible) then
            if getElementType(responsible) == "player" then
                responsible = getPlayerName(responsible)
            else
                responsible = "Console"
            end
        else
            responsible = false
        end

        if type(reason) ~= "string" or reason == "" then
            reason = false
        end
        
        if quitType == "Kicked" and responsible then
            exports.discord:send("player.kick", { player = playerName, responsible = responsible, reason = reason })
        elseif quitType == "Banned" and responsible then
            exports.discord:send("player.ban", { player = playerName, responsible = responsible, reason = reason })
        else
            exports.discord:send("player.quit", { player = playerName, type = quitType, reason = reason })
        end
    end
)

addEventHandler("onPlayerChangeNick", root,
    function (previous, nick)
        exports.discord:send("player.nickchange", { player = nick:monochrome(), previous = previous:monochrome() })
    end
)

addEventHandler("onPlayerChat", root,
    function (message, messageType)
        if messageType == 0 then
            exports.discord:send("chat.message.text", { author = getPlayerName(source), text = message })
        elseif messageType == 1 then
            exports.discord:send("chat.message.action", { author = getPlayerName(source), text = message })
        end
    end
)

addEvent("onInterchatMessage")
addEventHandler("onInterchatMessage", root,
    function (server, playerName, message)
        exports.discord:send("chat.message.interchat", { author = playerName:monochrome(), server = server, text = message })
    end
)

addEvent("onDiscordPacket")
addEventHandler("onDiscordPacket", root,
    function (packet, payload)
        if packet == "text.message" then
            outputServerLog(("DISCORD: %s: %s"):format(payload.author.name, payload.message.text))
            outputChatBox(("#69BFDB[Đ] #FFFFFF%s: #E7D9B0%s"):format(payload.author.name, payload.message.text), root, 255, 255, 255, true)
            exports.discord:send("chat.confirm.message", { author = payload.author.name, message = payload.message })
        elseif packet == "text.command" then
            triggerEvent("onDiscordUserCommand", resourceRoot, payload.author, payload.message)
        end
    end
)

addEventHandler("onPlayerMute", root,
    function (state)
        if state == nil then
            return
        end

        if state then
            exports.discord:send("player.mute", { player = getPlayerName(source) })
        else
            exports.discord:send("player.unmute", { player = getPlayerName(source) })
        end
    end
)

addEvent("onGamemodeMapStart")
addEventHandler("onGamemodeMapStart", root,
    function (map)
        local name = map:getInfo("name") or map.name
        exports.discord:send("mapmanager.mapstart", { name = name })
    end
)

addEvent("onPlayerFinish")
addEventHandler("onPlayerFinish", root,
    function (rank, time)
        if rank > 3 then
            return
        end

        exports.discord:send("player.finish", { player = getPlayerName(source), rank = rank })
    end
)

addEvent("onPlayerToptimeImprovement")
addEventHandler("onPlayerToptimeImprovement", root,
	function (newPos, newTime, oldPos, oldTime, displayTopCount, entryCount)
        -- Do not show every achieved toptime
        if newPos > displayTopCount then
            return
        end

        -- We only handle race_toptimes
		if (not sourceResource or sourceResource ~= getResourceFromName("race_toptimes")) then
			return
		end

        local time = ("%02d:%02d:%03d"):format(math.floor(newTime / 60000), math.floor(newTime / 1000) % 60, newTime % 1000)
        exports.discord:send("player.toptime", { player = getPlayerName(source), position = newPos, time = time })
    end
)
