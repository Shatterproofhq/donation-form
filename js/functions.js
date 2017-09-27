;(function($, window, document, undefined) {
	var $win       = $(window);
	var $doc       = $(document);
	var $formHonor = $('.form-donate .form__honor');

	$('#field-honor').on('change', function(){
		$formHonor.slideUp(300);

		if (parseInt($(this).find('option:selected').attr('value')) !== 0) {
			$formHonor.slideDown(300);
		}
	});

	var validator = new Validator({
		container       : $('.validate').get(0),
		validClass      : 'valid',  
		errorClass      : 'error',  
		preventSubmit   : true,
		validateFieldsOn: 'input',
		animationTime   : 300,
		radiosContainer : '.list-radios',  
	});
})(jQuery, window, document);
