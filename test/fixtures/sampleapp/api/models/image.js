/**
* Image.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    attributes: {
        url: {
            type: Sequelize.STRING
        }
    },
    associate: function() {
        image.belongsTo(user, {
            onDelete: 'cascade',
            foreignKey: 'owner'
        });
    },
    options: {
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};

