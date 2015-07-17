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
   */
  API.prototype.request = function(method, path, data) {
    var uri = this.config.server;
    if (_.last(uri) !== '/') {
      uri += '/';
    }
    if (_.first(path) === '/') {
      path = path.substr(1);
    }
    uri += path;
    var opts = {type: method};
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
   * @return {jQuery.Deferred}
   */
  API.prototype.getScript = function(id) {
    this.request('GET', 'script/' + id);
  };

  /**
   * Filter customers.
   * @param params {{}} query parameters.
   * @return {jQuery.Deferred}
   */
  API.prototype.listCustomers = function(params) {
    return this.request('GET', 'customer', params);
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

