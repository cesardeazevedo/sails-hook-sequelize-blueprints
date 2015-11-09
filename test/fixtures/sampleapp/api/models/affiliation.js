/**
* Affiliation.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    state: {
      type: Sequelize.STRING
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  associations: function() {
    affiliation.belongsToMany(user, {
      as: 'users',
      to: 'affiliations', // must be named as the alias in the related Model
      through: 'UserAffiliation',
      foreignKey: {
        name: 'affiliationId',
        as: 'users'
      }
    });
  },
  options: {
    tableName: 'affiliation',
    classMethods: {},
    instanceMethods: {},
    hooks: {}
  }
};
