
function utf8.split(self, separator)
    assert(type(self) == "string", "expected string at argument 1, got ".. type(self))
    assert(type(separator) == "string", "expected string at argument 2, got ".. type(separator))

    local rows = {}
    local position, startpoint = false, 1
    local sepLength = utf8.len(separator)

    repeat
        position = utf8.find(self, separator, startpoint, true)
        local part = utf8.sub(self, startpoint, position and (position - 1) or nil)
        startpoint = position and (position + sepLength)

        if part ~= "" then
            rows[#rows + 1] = part
        end
    until not position

    return rows
end

local function isKeyValuePairJSONCompatible(key_t, value_t)
    return (key_t == "boolean" or key_t == "number" or key_t == "string")
        and (value_t == "boolean" or value_t == "number" or value_t == "string" or value_t == "table") 
end

function table.rawcopy(self)
    assert(type(self) == "table", "expected table at argument 1, got ".. type(self))

    local references = {}

    local function recursive(self)
        local copy = {}

        for key, value in pairs(self) do
            local key_t = type(key)
            local value_t = type(value)

            if isKeyValuePairJSONCompatible(key_t, value_t) then
                if value_t == "table" then
                    -- Recursive
                    if references[key] == nil then
                        references[key] = recursive(value)
                    end

                    copy[key] = references[key]
                else
                    copy[key] = value
                end
            end
        end

        return copy
    end

    return recursive(self)
end

function table.json(self, compact)
    assert(type(self) == "table", "expected table at argument 1, got ".. type(self))
    assert(compact == nil or type(compact) == "boolean", "expected boolean at argument 2, got ".. type(compact))
    compact = (compact == nil or compact)
    return toJSON(table.rawcopy(self), compact):sub(compact and 2 or 3, compact and -2 or -3)
end
