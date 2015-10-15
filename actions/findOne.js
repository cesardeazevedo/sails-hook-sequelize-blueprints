/**
 * Module dependencies
 */
var actionUtil = require('../actionUtil');

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
  Model.findById(pk, {include: sails.config.blueprints.populate ? [{ all: true }] : []
  }).then(function(matchingRecord) {
    if(!matchingRecord) return res.notFound('No record found with the specified `id`.');

    if (sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecord);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

    res.ok(matchingRecord);
  }).catch(function(err){
    return res.serverError(err);
  });

};
