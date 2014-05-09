var $ = require('browserify-zepto');

/**
 * @fileOverview Override of the $.fn.css method that adds the vendor prefixes to CSS properties.
 * @author Jon Bretman jon.bretman@corp.badoo.com
 */

(function () {

    // list of vendors
    var vendors = ['Webkit', 'Moz', 'O', 'ms'];

    // list of vendors in lower case
    var vendorsLowerCase = ['webkit', 'moz', 'o', 'ms'];

    /**
     * Gets the supported property in DOM syntax. eg passing in 'transition-property' may return 'WebkitTransitionProperty'
     * @param prop
     * @return {String}
     */
    var getSupportedProp = function(prop) {

        // format property to DOM style notation
        prop = camelize(prop);

        // CSSStyleDeclaration to use to check for supported CSS properties
        var styles = document.createElement('div').style;

        // save a different version of the property for checking vendor prefixes
        var prop_ = prop.charAt(0).toUpperCase() + prop.substring(1);

        // check non-prefix
        if (prop in styles) {
            return prop;
        }

        // check vendor prefixes
        for (var i = 0; i < vendors.length; i++) {
            if ((vendors[i] + prop_) in styles) {
                return vendors[i] + prop_;
            }
        }

        // fail
        return null;

    };

    /**
     * Turns a dashed property into a camelized one. eg. 'transition-duration' becomes 'transitionDuration'
     * @param str
     * @return {String}
     */
    var camelize = function (str) {
        return str.replace(/-+(.)?/g, function(match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };

    /**
     * Turns a camelized property into a dashed one. Adds a leading dash if property is using a vendor prefix.
     * eg. 'WebkitTranstionProperty' becomes '-webkit-transition-property'
     * @param str
     * @return {String}
     */
    var dasherize = function (str) {
        var prop = str.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
        return $.inArray(prop.split('-')[0], vendorsLowerCase) !== -1 ? '-' + prop : prop;
    };

    /**
     * Generates a prefixed version of a the gradient syntax.
     * @param vendor
     * @parma type
     * @param direction
     * @param values
     * @return {String}
     */
    var getPrefixGradient = function (vendor, type, direction, values) {

        // parse direction
        if (type === 'linear') {
            direction = (direction === 'to bottom') ? 'top' : 'left';
        } else {
            direction = (direction.indexOf('ellipse') !== -1) ? 'center, ellispe cover' : 'center, circle cover';
        }

        return '-' + vendor + '-' + type + '-gradient(' + direction + ',' + values + ')';
    };

    /**
     * Generates the legacy webkit gradient syntax
     * @param type
     * @param direction
     * @param values
     * @return {String}
     */
    var getOldWebkitGradient = function (type, direction, values) {

        // parse direction
        if (type === 'linear') {
            direction = (direction === 'to bottom') ? 'left top, left bottom' : 'left top, right top';
        } else {
            direction = 'center center, 0px, center center, 100%';
        }

        var colorStops = [];
        var stop;
        values = values.split(',');
        for (var i = 0; i < values.length; i++) {
            stop = $.trim(values[i]).split(' ');
            colorStops.push('color-stop(' + stop[1] + ',' + stop[0] + ')');
        }

        return '-webkit-gradient(' + type + ', ' + direction + ', ' + colorStops.join(',') + ')';
    };

    /**
     * Tests a gradient syntax
     * @param value
     * @return {Boolean}
     */
    var testGradient = function (value) {
        var d = document.createElement('div');
        d.style.background = value;
        return d.style.background.indexOf('gradient') !== -1;
    };

    /**
     * Generates the correct gradient syntax
     * @param value A gradient value in W3C style syntax.
     * @return {String}
     */
    var getSupportedGradient = function (type, value) {

        // test standard
        if (testGradient(value)) {
            return value;
        }

        // parse gradient for direction and values
        var match = value.match(/.*?\(([a-z ]+?),(.+?)\)/);

        if (!match || match.length < 3) {
            return value;
        }

        var direction = $.trim(match[1]);
        var values = $.trim(match[2]);
        var prefixed, i;

        // test prefixed
        for (i = 0; i < vendorsLowerCase.length; i++) {
            prefixed = getPrefixGradient(vendorsLowerCase[i], type, direction, values);
            if (testGradient(prefixed)) {
                return prefixed;
            }
        }

        // legacy webkit
        var oldWebkit = getOldWebkitGradient(type, direction, values);
        if (testGradient(oldWebkit)) {
            return oldWebkit;
        }

        return value;

    };

    /**
     * Cache for properies so they are only calculated once.
     * @type {Object}
     */
    var properyCache = {};

    /**
     * Returns the correct property to use. eg. 'transform' may return '-webkit-transform' or '-moz-transform' or 'transform'.
     * @param prop
     * @return {String}
     */
    var getProperty = function (prop) {

        // return from cache
        if (properyCache[prop]) {
            return properyCache[prop];
        }

        // get the supported property (DOM syntax)
        var supported = getSupportedProp(prop);

        // property not supported
        if (!supported) {
            return '';
        }

        // dasherize property and save to cache.
        supported = dasherize(supported);
        properyCache[prop] = supported;
        return supported;

    };

    /**
     * Returns the correct value to use.
     * @param property The CSS property
     * @param value The correct CSS value to use
     * @return {String}
     */
    var getValue = function (property, value) {

        // use correct value for 'display: box;'
        if (property === 'display' && value === 'box') {
            return getProperty('box-flex').replace('-flex', '');
        }

        // use correct value for 'transition: transform 250ms ease;' or 'transition-property: transform;'
        if ((property === 'transition' || property === 'transition-property') && value.indexOf('transform') !== -1) {
            return value.replace('transform', getProperty('transform'));
        }

        // check translate vs. translate3d support
        if (property === 'transform' && value.indexOf('translate3d(') !== -1) {
            return getProperty('perspective') !== '' ? value : value.replace('translate3d(', 'translate(').replace(/(.*?,.*?)(,.*)/, '$1)');
        }

        // check linear gradient syntax
        if (property === 'background-image' && value.indexOf('linear-gradient(') !== -1) {
            return getSupportedGradient('linear', value);
        }

        // check radial gradient syntax
        if (property === 'background-image' && value.indexOf('radial-gradient(') !== -1) {
            return getSupportedGradient('radial', value);
        }

        return value;

    };

    // save a reference to the original method
    var _super = $.fn.css;

    /**
     * Overide method which will intercept CSS properties and apply a vendor prefix if necessary.
     */
    $.fn.css = function (prop, value) {

        if (typeof prop === 'string') {

            // getting a value
            if (arguments.length === 1) {
                return _super.call(this, getProperty(prop));
            }

            // setting a single value
            return _super.call(this, getProperty(prop), getValue(prop, value));

        }

        // setting multiple with a map of properties and values
        for (var key in prop) {
            prop[ getProperty(key) ] = getValue(key, prop[key]);
        }

        return _super.call(this, prop);

    };

    // add a getProp() method to $.css (Zepto doesn't have this so create it)
    $.css = $.css || {};
    $.css.getProp = getProperty;

})();
