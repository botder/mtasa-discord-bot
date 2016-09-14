
addEventHandler("onResourceStart", resourceRoot,
    function ()
        local found = false

        for index, module in pairs(getLoadedModules()) do
            if module:find("ml_sockets", 1, true) then
                found = true
                break
            end
        end

        if not found then
            outputServerLog("Module 'ml_sockets' not found, please install.")
            cancelEvent()
        else
            createSocketFromConfig()
        end
    end,
false, "high+9")
