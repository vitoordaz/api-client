/* jshint strict: true */
/* global define */

define(['jquery', 'underscore', 'utils'], function($, _, utils) {
  'use strict';

  /**
   * Base API class.
   * @param config {{server: string}} API client config.
   * @param credentials {{key: string, secret: string}} API credentials.
   * @constructor
   */
  function API(config, credentials) {
    this.config = config;
    this.credentials = credentials;
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
    this.authorizeRequest(path, opts);
    return $.ajax(uri, opts);
  };

  /**
   * API request authorization handler.
   * @param path {string} request path.
   * @param opts {{}} jQuery ajax request options.
   */
  API.prototype.authorizeRequest = function(path, opts) {
    if (path !== 'auth/') {
      var cred = this.credentials;
      if (!!cred) {
        opts.headers = opts.headers || {};
        opts.headers.Authorization =
          'user ' + window.btoa(cred.key + ':' + cred.secret);
      }
    }
  };

  /**
   * Send authorization request to API.
   * @param data {{username: string, password: string}} authorization
   *                                                    credentials.
   * @param cb {function} callback function to call after response received.
   */
  API.prototype.auth = function(data, cb) {
    cb = cb || utils.noop;
    this.request('POST', 'auth/', data, function(err, data) {
      if (!err) {
        this.credentials = data;
      }
      cb(err, data);
    }.bind(this));
  };

  /**
   * Creates interaction object.
   * @param {Object} data interaction data.
   * @return {jQuery.Promise}
   */
  API.prototype.createInteraction = function(data) {
    return this.request('POST', 'interaction/', data).then(function(result) {
      return result;
    });
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
   * @param cb {function} callback function to call after user data fetched.
   */
  API.prototype.getUserSelf = function(cb) {
    this.request('GET', 'user/self', cb || utils.noop);
  };

  /**
   * Fetch current user sales script.
   * @param cb {function} callback function to call after sales script fetched.
   */
  API.prototype.getUserSalesScript = function(cb) {
    this.request('GET', 'user/self/script', cb || utils.noop);
  };

  return API;
});
