/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
    attributes: {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        age: {
            type: Sequelize.INTEGER
        }
    },
    associate: function() {
      user.hasMany(image, {
           foreignKey: {
            name: 'owner',
            allowNull: false
          }
      });
    },
    options: {
        tableName: 'user',
        classMethods: {},
        instanceMethods: {},
        hooks: {}
    }
};

