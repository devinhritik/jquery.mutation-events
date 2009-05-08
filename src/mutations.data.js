/*
 * jQuery.data Mutation Events
 *
 * Copyright (c) 2009 Adaptavist.com Ltd
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * Author: Mark Gibson (jollytoad at gmail dot com)
 */
(jQuery.mutations && (function($) {

$.mutations.register({
	// The event type triggered after a mutation,
	// "pre-" is prepended to this for the pre-mutation event.
	type: 'data',
	
	// The blacklist holds data item names that should never trigger an event
	blacklist: {'events':true, 'handle':true, 'olddisplay':true },
	
	// Hook into jQuery when an event of this type is first bound
	setup: function() {
		var data = $.data,
			removeData = $.removeData,
			blacklist = this.blacklist,
			trigger = $.mutations.trigger;
		
		// Save the original $.data function
		this._data = data;
		this._removeData = removeData;
		
		// Override $.data
		$.data = function( elem, name, newValue, silent ) {
			var prevValue = data(elem, name);

			if ( newValue === undefined ) {
				return prevValue;
			}

			if ( silent || blacklist[name] ) {

				return data(elem, name, newValue);
				
			} else if ( newValue !== prevValue ) {
				
				return trigger( elem, 'data', name, prevValue, newValue,
					function( event ) {
						data( event.target, event.attrName, event.newValue );
					}
				);
			}
		};
		
		$.removeData = function( elem, name, silent ) {
			if ( silent || blacklist[name] ) {
				return removeData( elem, name );
			}

			return trigger( elem, 'data', name, data(elem, name), undefined,
				function(event) {
					if ( event.attrChange === $.mutations.REMOVAL ) {
						removeData( event.target, event.attrName );
					} else {
						// The event handler wants the data modified rather than removed
						data( event.target, event.attrName, event.newValue );
					}
				});
		};
	},
	
	// Remove hooks once all events of this type have been unbound
	teardown: function() {
		$.data = this._data;
		$.removeData = this._removeData;
		delete this._data;
		delete this._removeData;
	}
});

})(jQuery));

