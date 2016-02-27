/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');
var _ = require('lodash');
var async = require('async');

/**
 * Add Record To Collection
 *
 * post  /:modelIdentity/:id/:collectionAttr/:childid
 *  *    /:modelIdentity/:id/:collectionAttr/add/:childid
 *
 *  post  /:modelIdentity/:id/:collectionAttr?:childField=Value&childAnotherField=AnotherValue
 *  *    /:modelIdentity/:id/:collectionAttr/add?:childField=Value&childAnotherField=AnotherValue
 *
 * Associate one record with the collection attribute of another.
 * e.g. add a Horse named "Jimmy" to a Farm's "animals".
 * If the record being added has a primary key value already, it will
 * just be linked.  If it doesn't, a new record will be created, then
 * linked appropriately.  In either case, the association is bidirectional.
 *
 * @param {Integer|String} parentid  - the unique id of the parent record
 * @param {Integer|String} id    [optional]
 *        - the unique id of the child record to add
 *        Alternatively, an object WITHOUT a primary key may be POSTed
 *        to this endpoint to create a new child record, then associate
 *        it with the parent.
 *
 * @option {String} model  - the identity of the model
 * @option {String} alias  - the name of the association attribute (aka "alias")
 */

module.exports = function addToCollection (req, res) {
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
  var associationAttr = foreign.name || foreign;
  var ChildModel = sails.models[req.options.target.toLowerCase()];
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
  var childPkAttr = ChildModel.primaryKeys.id.fieldName;
  // The child record to associate is defined by either...
  var child;

  // ...a primary key:
  var supposedChildPk = actionUtil.parsePk(req);
  if (supposedChildPk) {
    child = {};
    child[childPkAttr] = supposedChildPk;
  }
  // ...or an object of values:
  else {
    req.options.values = req.options.values || {};
    req.options.values.blacklist = req.options.values.blacklist || ['limit', 'skip', 'sort', 'id', 'parentid'];
    child = actionUtil.parseValues(req);
  }
  if (!child) {
    res.badRequest('You must specify the record to add (either the primary key of an existing record to link, or a new object without a primary key which will be used to create a record then link it.)');
  }

  // add pk parent to child
  child[associationAttr] = parentPk;

  async.auto({

    // Look up the parent record
    parent: function (cb) {
      Model.findById(parentPk, { include: [{ all : true }]}).then(function(parentRecord) {
        if (!parentRecord) return cb({status: 404});
        if (!parentRecord[relation]) { return cb({status: 404}); }
        cb(null, parentRecord);
      }).catch(function(err){
        return cb(err);
      });
    },

    // If a primary key was specified in the `child` object we parsed
    // from the request, look it up to make sure it exists.  Send back its primary key value.
    // This is here because, although you can do this with `.save()`, you can't actually
    // get ahold of the created child record data, unless you create it first.
    actualChildPkValue: ['parent', function(cb) {
      // Below, we use the primary key attribute to pull out the primary key value
      // (which might not have existed until now, if the .add() resulted in a `create()`)

      // If the primary key was specified for the child record, we should try to find
      // it before we create it.
      if (isManyToManyThrough) {




        if (supposedChildPk) {
          // update just the through model with boths IDS => parentPK + supposedChildPk
          // needed the name of foreign keys (got parent, gets target)
          // throughModel update ({ associationAttr: parentPk, targetAttr: supposedChildPk })
          var create = { };
          create[associationAttr] = parentPk;
          create[childAttr] = supposedChildPk;
          ThroughModel.create(create).then(function(throughModelInstance) {
              return cb();
            })
            .catch(function(err) {
              return cb(err);
            });
        } else {
          // Otherwise, it must be referring to a new thing, so create it.
          // and update the through model
          createChild(function(err, childInstanceId) {
            if (err) cb(err);

            var create = { };
            create[associationAttr] = parentPk;
            create[childAttr] = childInstanceId;
            ThroughModel.create(create).then(function(throughModelInstance) {
                return cb();
              })
              .catch(function(err) {
                return cb(err);
              });
          });
        }
      } else {
        if (child[childPkAttr]) {
          ChildModel.findById(child[childPkAttr]).then(function(childRecord) {
            // if there is no real update, no update
            // if (childRecord[associationAttr] === parentPk) return cb(null, childRecord[childPkAttr]);
            // Didn't find it?  Then try creating it.
            if (!childRecord) {return createChild();}
            // Otherwise use the one we found.
            // UPDATE THE CHILD WITH PARENTPK
            childRecord[associationAttr] = parentPk;
            childRecord.save().then(function() {
              return cb(null, childRecord[childPkAttr]);
            });
          }).catch(function(err){
            return cb(err);
          });
        }
        // Otherwise, it must be referring to a new thing, so create it.
        else {
          return createChild();
        }
      }

      // Create a new instance and send out any required pubsub messages.
      function createChild(customCb) {


        ChildModel.create(child).then(function(newChildRecord){
          if (req._sails.hooks.pubsub) {
            if (req.isSocket) {
              ChildModel.subscribe(req, newChildRecord);
              ChildModel.introduce(newChildRecord);
            }
            ChildModel.publishCreate(newChildRecord, !req.options.mirror && req);
          }
          // in case we have to create a child and link it to parent(M-M through scenario)
          // createChild function should return the instance to be linked
          // in the through model => customCb
          return (typeof customCb === 'function') ?
            customCb(null, newChildRecord[childPkAttr]) : cb(null, newChildRecord[childPkAttr]);
        }).catch(function(err){
          return cb(err);
        });
      }
    }]
  }, function(err, results){
    // if (err) return res.negotiate(err);

    Model.findById(parentPk, { include: req._sails.config.blueprints.populate ? [{ all: true }] : []}).then(function(matchingRecord) {
      if(!matchingRecord) return res.serverError();
      return res.ok(matchingRecord);
    }).catch(function(err) {
      return res.serverError(err);
    });
  });
};
