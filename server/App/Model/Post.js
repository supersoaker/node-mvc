var Model = require('./../Model.js');

module.exports = Model.newClass( 'Post', {
	// - prototype -

	beitragName  : "Default Name",
	beschreibung : "... Default Beschreibung ...",
	erstelltAm   : "01.01.2014",
	zahl         : 123,
	obj          : {}
} );