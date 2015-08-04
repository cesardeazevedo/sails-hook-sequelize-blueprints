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
    associations: function() {
      user.hasMany(image, {
          onDelete: 'cascade',
          as: 'images',
          foreignKey: {
            name: 'userId',
            as: 'images',
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

