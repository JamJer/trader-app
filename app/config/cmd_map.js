const cmd_map = {
    /**
     * 
     * @function help 
     * @description: Show the helping manual of trader control board.
     *  
     */
    "help": {
        "flag": 0,
        "placeholder": "help",
        "description": "Show the helping manual of trader control board."
    },
    /**
     * 
     * @function status 
     * @description List all existed instances of trader bot
     * 
     */
    "status": {
        "flag": 1,
        "placeholder": "status",
        "description": "List all existed instances of trader bot"
    },
    /**
     * 
     * @function use <policy ID> 
     * @description specify policy ID to read the policy
     * 
     */
    "use": {
        "flag": 1,
        "placeholder": "use 《policy_ID》",
        "description": "Specify policy ID to read the policy"
    },
    /**
     * 
     * @function list 
     * @description Listing all the trading policies.
     * 
     */
    "list": {
        "flag": 1,
        "placeholder": "list",
        "description": "Listing all the trading policies."
    },
    /**
     * 
     * @function pull 
     * @description Sync the policies, privileges of user from remote server 
     * 
     */
    "pull": {
        "flag": 1,
        "placeholder": "pull",
        "description": "Sync the policies, privileges of user from remote server."
    },
    /**
     * 
     * @function push <policy ID>
     * @description Upload the local policy to remote server
     * 
     */
    "push": {
        "flag": 1,
        "placeholder": "push 《policy_ID》",
        "description": "Upload the local policy to remote server."
    },
    /**
     * 
     * @function purchase + <user ID>/<policy ID>
     * @description Purchase the specific trading policy, by user_id/policy_id.
     * 
     */
    "purchase": {
        "flag": 1,
        "placeholder": "purchase 《user_ID》/《policy_ID》",
        "description": "Purchase the specific trading policy, by user_id/policy_id."
    },
    /**
     * 
     * @function create 
     * @description open editor to edit trading policy
     * 
     */
    "create": {
        "flag": 1,
        "placeholder": "create",
        "description": "Open editor to edit trading policy"
    },
    /**
     * 
     * @function trade 
     * @description Manually control trading behavior 
     * 
     */
    "trade":{
        "flag": 1,
        "placeholder": "trade",
        "description": "Enter manual trading behavior control mode."
    },
    /**
     * 
     * @function debug 
     * @description new feature, testing branch goes here
     * 
     */
    "debug": {
        "flag": 1,
        "placeholder": "debug",
        "description": "Enter debug page."
    },
    /**
     * 
     * @function config
     * @description configuration page of trader app
     * 
     * 5/26 - Deprecated
     * This command move to the first page - within index.html
     */
}

module.exports = cmd_map;