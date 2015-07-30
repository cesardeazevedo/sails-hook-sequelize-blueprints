module.exports = function _beforeAllHooks(sails) {
    return {
        initAdapters: function() {
            if(sails.adapters === undefined) {
                sails.adapters = {};
            }
        },

        initModels: function() {
            if(sails.models === undefined) {
                sails.models = {};
            }
        },

        initialize: function (cb) {
            this.initAdapters();
            this.initModels();
            return cb();
        }
    };
};
