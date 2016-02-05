/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil'),
  _ = require('lodash');

/**
 * Find One Record
 *
 * get /:modelIdentity/:id
 *
 * An API call to find and return a single model instance from the data adapter
 * using the specified id.
 *
 * Required:
 * @param {Integer|String} id  - the unique id of the particular instance you'd like to look up *
 *
 * Optional:
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findOneRecord (req, res) {
  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);
  var populate = actionUtil.populateEach(req);

  Model.findById(pk, {include: req._sails.config.blueprints.populate ?
                               (_.isEmpty(populate) ? [{ all : true}] : populate) : []
  }).then(function(matchingRecord) {
    if(!matchingRecord) return res.notFound('No record found with the specified `id`.');

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecord);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

    res.ok(matchingRecord);
  }).catch(function(err){
    return res.serverError(err);
  });

};
