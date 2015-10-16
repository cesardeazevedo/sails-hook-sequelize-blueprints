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
    associations: function() {
        image.belongsTo(user, {
            onDelete: 'cascade',
            as: 'owner',
            foreignKey: {
                name: 'userId',
                as: 'owner',
                allowNull: false
            }
        });
    },
    options: {
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};

