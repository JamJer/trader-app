const cmd_map = {
    "list_local": {
        "flag": 1,
        "description": "Listing all the trading policies."
    },
    "list_remote": {
        "flag": 1,
        "description": "Listing all the existing trading policies from remote server."
    },
    "select": {
        "flag": 1,
        "description": "Fetch the target trading policy from local."
    },
    "buy": {
        "flag": 1,
        "description": "Buy the target trading policy from remote server."
    },  
    "help": {
        "flag": 0,
        "description": "Show the helping manual of trader control board."
    }
}

module.exports = cmd_map;