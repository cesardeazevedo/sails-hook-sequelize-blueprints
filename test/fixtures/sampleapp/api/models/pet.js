/**
* Image.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    attributes: {
        name: {
            type: Sequelize.STRING
        },
        breed: {
            type: Sequelize.STRING
        }
    },
    associations: function() {
        pet.belongsTo(user, {
            as: 'owner',
            onDelete: 'cascade',
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
        tableName: 'pets',
        hooks: {}
    }
};

