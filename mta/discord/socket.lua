
Socket = {}

local defaultOptions = {
    autoReconnect = false,
    connectOnCreate = true,
    connectTimeoutMS = 1000,
    reconnectRetryMS = 3000,
}

local instances = {}
local metatableSocket = { __index = Socket }

function Socket:create(hostname, port, options)
    assert(type(hostname) == "string", "expected string at argument 1, got ".. type(hostname))
    assert(type(port) == "number", "expected number at argument 2, got ".. type(hostname))

    if type(options) ~= "table" then
        options = {}
    end

    for option, default in pairs(defaultOptions) do
        if options[option] == nil or type(options[option]) ~= type(default) then
            options[option] = default
        end
    end

    options.connectTimeoutMS = math.max(50, options.connectTimeoutMS)
    options.reconnectRetryMS = math.max(50, options.reconnectRetryMS)

    local new = {
        port = port,
        hostname = hostname,
        options = options,
        handle = false,
        listener = {},
        timeout = false,
        connected = false
    }

    setmetatable(new, metatableSocket)

    if new.options.connectOnCreate then
        new:connect()
    end

    return new
end

function Socket:connect()
    if self:isConnected() then
        return
    end

    self.options.ignoreAutoReconnect = nil
    self.handle = sockOpen(self.hostname, self.port)

    if self.handle then
        instances[self.handle] = self
        self.timeout = setTimer(Socket.timeout, self.options.connectTimeoutMS, 1, self.handle)
    end
end

function Socket.timeout(socket)
    local instance = instances[socket]
    instance:emit("timeout")
    instance.timeout = false
    sockClose(socket)
end

function Socket:disconnect()
    if self:isConnected() then
        self.options.ignoreAutoReconnect = true
        sockClose(self.handle)
    end
end

function Socket:isConnected()
    return self.connected
end

function Socket:write(data)
    if self:isConnected() then
        sockWrite(self.handle, base64Encode(data) .. "\r\n")
    end
end

function Socket:on(eventName, callback)
    assert(type(eventName) == "string", "expected string at argument 1, got ".. type(eventName))
    assert(type(callback) == "function", "expected function at argument 2, got ".. type(callback))

    self.listener[eventName] = callback
end

function Socket:emit(eventName, ...)
    assert(type(eventName) == "string", "expected string at argument 1, got ".. type(eventName))

    if self.listener[eventName] then
        pcall(self.listener[eventName], self, ...)
    end
end

addEventHandler("onSockOpened", root,
    function (socket)
        local instance = instances[socket]

        if instance then
            if instance.timeout and isTimer(instance.timeout) then
                killTimer(instance.timeout)
            end
            instance.connected = true
            instance.timeout = false
            instance:emit("ready")
        end
    end
)

addEventHandler("onSockClosed", root,
    function (socket)
        local instance = instances[socket]

        if instance then
            instance.handle = false
            instances[socket] = nil

            if instance.connected then
                instance.connected = false
                instance:emit("close")
            end

            if not instance.options.ignoreAutoReconnect and instance.options.autoReconnect then
                setTimer(
                    function ()
                        instance:connect()
                    end, 
                instance.options.reconnectRetryMS, 1)
            end
        end
    end
)

addEventHandler("onSockData", root,
    function (socket, data)
        local instance = instances[socket]

        if instance then
            local lines = utf8.split(data, "\r\n")

            if lines then
                for index, line in ipairs(lines) do
                    line = base64Decode(line)
                    local json = fromJSON(line)

                    if type(json) == "table" then
                        if type(json.type) == "string" then
                            instance:emit("data", json.type, type(json.payload) == "table" and json.payload or {})
                        end
                    end
                end
            end
        end
    end
)

addEventHandler("onResourceStop", resourceRoot,
    function ()
        for socket, instance in pairs(instances) do
            instance:disconnect()
        end
    end,
false, "low")
