/* jshint strict: true */
/* global define */

define('api',['jquery', 'underscore', 'utils'], function($, _, utils) {
  'use strict';

  /**
   * Base API class.
   * @param config {{server: string}} API client config.
   * @constructor
   */
  function API(config) {
    this.config = $.extend({
      server: 'https://api2.absdata.ru'
    }, config || {});
    this.name = 'API';
  }

  /**
   * Private function for API calls.
   * @param method {string} HTTP method of request.
   * @param path {string} request URI path.
   * @param data {{}} request data.
   * @param cb {function} callback function to call after response received.
   */
  API.prototype.request = function(method, path, data, cb) {
    if (typeof data === 'function') {
      cb = data;
      data = undefined;
    }
    cb = cb || utils.noop;
    var uri = this.config.server;
    if (_.last(uri) !== '/') {
      uri += '/';
    }
    uri += path;
    var opts = {
      type: method,
      complete: function(jqXHR, textStatus) {
        var status = jqXHR.status;
        var resp = jqXHR.responseJSON || {};
        if (textStatus === 'success' && 200 <= status && status < 300) {
          cb(null, resp);
        } else {
          cb(resp, null);
        }
      }.bind(this)
    };
    if (!_.isEmpty(data)) {
      if (method === 'GET') {
        opts.data = data;
      } else if (method === 'POST' || method === 'PUT') {
        opts.contentType = 'application/json';
        opts.data = JSON.stringify(data);
      }
    }
    opts.timeout = 5000;  // 5s
    return this.authorizeRequest(path, opts).then(function(opts) {
      return $.ajax(uri, opts);
    });
  };

  /**
   * API request authorization handler.
   * @param path {string} request path.
   * @param opts {{}} jQuery ajax request options.
   * @returns {jQuery.Deferred}
   */
  API.prototype.authorizeRequest = function(path, opts) {
    if (path === 'auth/') {
      return $.Deferred().resolve(opts);
    }
    return utils.credentials.get().then(function(c) {
      opts.headers = opts.headers || {};
      opts.headers.Authorization =
        'user ' + window.btoa(c.key + ':' + c.secret);
      return opts;
    });
  };

  /**
   * Send authorization request to API.
   * @param data {{username: string, password: string}} authorization
   *                                                    credentials.
   */
  API.prototype.auth = function(data) {
    return this.request('POST', 'auth/', data);
  };

  /**
   * Creates interaction object.
   * @param {Object} data interaction data.
   * @return {jQuery.Deferred}
   */
  API.prototype.createInteraction = function(data) {
    return this.request('POST', 'interaction/', data);
  };

  /**
   * Gets current user script.
   * @param id {string} script id.
   * @param cb {function} callback function to call after script loaded.
   */
  API.prototype.getScript = function(id, cb) {
    this.request('GET', 'script/' + id, cb || utils.noop);
  };

  /**
   * Filter customers.
   * @param params {{}} query parameters.
   * @param cb {function} callback function to call after customer data
   *                      fetched.
   */
  API.prototype.listCustomers = function(params, cb) {
    cb = cb || utils.noop;
    this.request('GET', 'customer', params, function(err, data) {
      if (!err) {
        cb(null, data);
      } else {
        cb(err);
      }
    }.bind(this));
  };


  /**
   * Fetch current user data.
   * @return {jQuery.Deferred}
   */
  API.prototype.getUserSelf = function() {
    return this.request('GET', 'user/self');
  };

  /**
   * Fetch current user sales script.
   * @return {jQuery.Deferred}
   */
  API.prototype.getUserSalesScript = function() {
    return this.request('GET', 'user/self/script');
  };

  return API;
});

