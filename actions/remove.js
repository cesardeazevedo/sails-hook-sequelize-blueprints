/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');
var _ = require('lodash');


/**
 * Remove a member from an association
 *
 * @param {Integer|String} parentid  - the unique id of the parent record
 * @param {Integer|String} id  - the unique id of the child record to remove
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function remove(req, res) {

  // Ensure a model and alias can be deduced from the request.
  var Model = actionUtil.parseModel(req);
  var relation = req.options.alias;
  if (!relation) {
    return res.serverError(new Error('Missing required route option, `req.options.alias`.'));
  }

  // The primary key of the parent record
  var parentPk = req.param('parentid');

  // Get the model class of the child in order to figure out the name of
  // the primary key attribute.
  var foreign = Model.associations[relation].options.foreignKey;
  var ChildModel = sails.models[req.options.target.toLowerCase()];
  var childPkAttr = ChildModel.primaryKeys.id.fieldName;

  // The primary key of the child record to remove
  // from the aliased collection
  var childPk = actionUtil.parsePk(req);
  var childRemove = {};
  childRemove[childPkAttr] = childPk;

  var isManyToManyThrough = false;
  // check it is a M-M through
  if (_.has(Model.associations[relation].options, 'through')) {
    isManyToManyThrough = true;
    var through = Model.associations[relation].options.through.model;
    var ThroughModel = sails.models[through.toLowerCase()];
    var childRelation = Model.associations[relation].options.to;
    var childForeign = ChildModel.associations[childRelation].options.foreignKey;
    var childAttr = childForeign.name || childForeign;
  }

  if(_.isUndefined(childPk)) {
    return res.serverError('Missing required child PK.');
  }

  Model.findById(parentPk, { include: [{ all: true }]}).then(function(parentRecord) {
    if (!parentRecord) return res.notFound();
    if (!parentRecord[relation]) return res.notFound();

    if (isManyToManyThrough) {
      var throughRemove = { };
      throughRemove[childAttr] = childPk;
      ThroughModel.destroy({ where: throughRemove }).then(function(){
        return returnParentModel();
      })
      .catch(function(err) {
        return res.negotiate(err);
      });
    } else { // not M-M
      ChildModel.destroy({ where: childRemove }).then(function(){
        return returnParentModel();
      }).catch(function(err){
        return res.negotiate(err);
      });
    }
  }).catch(function(err){
    return res.serverError(err);
  });

  function returnParentModel () {
    Model.findById(parentPk, { include: req._sails.config.blueprints.populate ? [{ all: true }] : [] })
    // .populate(relation)
    // TODO: use populateEach util instead
    .then(function(parentRecord) {
      if (!parentRecord) return res.serverError();
      if (!parentRecord[Model.primaryKeys.id.fieldName]) return res.serverError();

      // If we have the pubsub hook, use the model class's publish method
      // to notify all subscribers about the removed item
      if (sails.hooks.pubsub) {
        Model.publishRemove(parentRecord[Model.primaryKey], relation, childPk, !sails.config.blueprints.mirror && req);
      }

      return res.ok(parentRecord);
    }).catch(function(err){
      return res.serverError(err);
    });
  }

};
