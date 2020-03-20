/**
 * Loads a custom scoped version of jQuery to not conflict with any global version
 */
define(['jquery'], function (jq) {
    let newJQ = jq.noConflict(true);

    jq.event.special.destroyed = {
        remove: function(o) {
            if (o.handler && o.type !== 'destroyed') {
                o.handler()
            }
        }
    };

    return newJQ;
});