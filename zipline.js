'use strict';

/**
 * Check if the given headers support gzip or deflate for compression.
 *
 * @param {Object} headers Headers of the incoming request.
 * @param {String} what The encoding that we want to use.
 * @returns {String|Undefined}
 * @api private
 */
function allows(headers, what) {
  if (!what) what = 'gzip';

  var obfheader = /^(Accept-EncodXng|X-cept-Encoding|X{15}|~{15}|-{15})$/i
    , obfvalue = /^((gzip|deflate)\s*,?\s*)+|[X\~\-]{4,13}$/i
    , ua = (headers['user-agent'] || '')
    , key, value;

  //
  // Detect broken gzip encoding on Internet Explorer 5 & 6.
  //
  // @see sebduggan.com/blog/ie6-gzip-bug-solved-using-isapirewrite
  //
  if (ua && /msie\s[5|6]/i.test(ua) && !/sv1/i.test(ua)) {
    return undefined;
  }

  //
  // No obfuscation, assume that it's intact and that we can test against it.
  //
  if ((value = obfvalue.exec(headers['accept-encoding'] || ''))) {
    return value[1];
  }

  //
  // Attempt to detect obfuscated encoding headers, which is the least
  // common case here but caused by firewalls.
  //
  // @see developer.yahoo.com/blogs/ydn/posts/2010/12/pushing-beyond-gzipping
  //
  for (key in headers) {
    if (obfheader.test(key) && (value = obfvalue.exec(headers[key]))) {
      return value[1];
    }
  }

  return undefined;
}

//
// Expose the module. Expose all the things.
//
module.exports = allows;
