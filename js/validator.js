/*
-- Settings

container       : $('.validate').get(0),  ---> The container of the fields. Should be a DOM Object.
validClass      : 'valid', 				  ---> The valid class that should be added.
errorClass      : 'error',				  ---> The error class that should be added.
preventSubmit   : false,				  ---> Prevents form submition if form is invalid.
validateOnInit  : false,    			  ---> Controls whether or not the form should be validated once the validator is started.
validateFieldsOn: 'input',   			  ---> The event for when field types should be validated. Default is input.
animationTime   : false,				  ---> The time for the validator to wait until a validation will occur. Usefull when elements are being hidden with transition.
submitButton    : false,     			  ---> Selector for the submit button.
disableButton   : false,                  ---> Disables the submit button from beinge clicked.
radiosContainer : false,                  ---> The container for the radios. 
fieldContainer  : false                   ---> The field container. If specified the valdiator will ad an error/valid class on the container too. Use the name of the class only, don't use a selector.

-- Usage

var validator = new Validator({
	Settings go here
});

*/

var Validator = function(settings) {
	// Global variable for validator
	var validator = this;

	// Assign settings
	validator.settings = extend({
		container       : $('.validate').get(0),
		validClass      : 'valid',
		errorClass      : 'error',
		preventSubmit   : false,
		validateOnInit  : false,
		validateFieldsOn: 'input',
		animationTime   : false,
		submitButton    : false,
		disableButton   : false,
		radiosContainer : false,
		fieldContainer  : false
	}, settings);

	// Init validator
	init();

	function init() {
		// Get required fields
		validator.required = getRequired();

		// Timeout variable for lazy checking when form elements have transition before hiding them
		var lazyCheck;

		closest(validator.settings.container, 'form').addEventListener('submit', function(e) {
			if (!checkFullValidation() && validator.settings.preventSubmit) {
				e.preventDefault();

				validator
					.settings
					.container
						.classList
							.remove('form-valid');

				for (var i = 0; i < validator.required.length; i++) {
					validate(validator.required[i]);
				}
			} else {
				validator
					.settings
					.container
						.classList
							.add('form-valid');
			}
		});

		// Attach an event to check if field is shown and if it should be validated
		document.addEventListener('click', function() {
			checkFullValidation();

			if (validator.settings.animationTime) {
				clearTimeout(lazyCheck);

				setTimeout(function() {
					checkFullValidation();
				}, validator.settings.animationTime);
			}
		});

		// Disable button if specified
		if (validator.settings.disableButton && validator.settings.container.querySelectorAll(validator.settings.submitButton).length) {
			toggleButton(false);
		}

		// Attach events to required fields
		attachEvents();
	}

	// Merge default settings with new ones if specified
	function extend(obj, src) {
	    Object
	    	.keys(src)
	    	.forEach(function(key) { 
	    		obj[key] = src[key]; 
	    	});

	    return obj;
	}

	function attachEvents() {
		for (var i = 0; i < validator.required.length; i++) {
			var element = validator.required[i];

			if (isField(element)) {
				// Attach field and password events
				element.addEventListener(validator.settings.validateFieldsOn, function(e) {
					validate(this);

					checkFullValidation();
				});

				if (validator.settings.validateFieldsOn == 'blur') {
					element.addEventListener('input', function() {
						if (this.classList.value.indexOf('error') >= 0) {
							validate(this);

							checkFullValidation();
						}
					});
				}
			} else if (isRadio(element)) {
				// Attach radio events
				element.addEventListener('click', function() {
					validate(this);

					checkFullValidation();
				});
			} else if (isCheckbox(element)) {
				// Attach checkbox events
				element.addEventListener('change', function() {
					validate(this);

					checkFullValidation();
				});
			} else if (isSelectbox(element)) {
				// Attach selectbox events
				element.addEventListener('change', function() {
					validate(this);

					checkFullValidation();
				});
			}

			if (element.getAttribute('data-validate') == 'confirm') {
				document
					.querySelector(element.getAttribute('data-confirm'))
					.addEventListener('input', function() {
						validate(document.querySelector('[data-confirm="#' + this.getAttribute('id') + '"]'));
					});
			}

			if (validator.settings.validateOnInit == true && element.value !== '') {
				validate(element);
			}
		}
	}

	// Get total number of required inputs in container
	function getTotalInputs() {
		var total = 0;
		var inputs = validator.settings.container.querySelectorAll('select[data-validate], input[data-validate]:not([type="radio"]):not([type="submit"]), textarea[data-validate]');
		var radios = validator.settings.container.querySelectorAll(validator.settings.radiosContainer);

		for (var i = 0; i < inputs.length; i++) {
			if (isVisible(inputs[i])) {
				total++;
			}
		}

		for (var i = 0; i < radios.length; i++) {
			if (isVisible(radios[i])) {
				total++;
			}
		}

		return total;
	}

	// Check if element is visible
	function isVisible(element) {
		return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
	}

	// Check if element is field
	function isField(element) {
		return element.type == 'text' || element.type == 'textarea' || element.type == 'email' || element.type == 'password';
	}

	// Check if element is selectbox
	function isSelectbox(element) {
		return element.type == 'select-one';
	}

	// Check if element is radio
	function isRadio(element) {
		return element.type == 'radio';
	}

	// Check if element is checkbox
	function isCheckbox(element) {
		return element.type == 'checkbox';
	}

	// Get all requred elements
	function getRequired() {
		return validator.settings.container.querySelectorAll('[data-validate]');
	}

	// Check for full validation
	function checkFullValidation() {
		var validInputs = 0;
		var inputs = validator.settings.container.querySelectorAll('.' + validator.settings.validClass);

		validator.totalInputs = getTotalInputs();

		for (var i = 0; i < inputs.length; i++) {
			if (isVisible(inputs[i])) {
				validInputs++;
			}
		}

		if (validator.settings.disableButton && validator.settings.container.querySelectorAll(validator.settings.submitButton).length) {
			toggleButton(validInputs == validator.totalInputs);
		}

		if (validInputs == validator.totalInputs) {
			validator
				.settings
				.container
					.classList
						.add('form-valid');
		} else {
			validator
				.settings
				.container
					.classList
						.remove('form-valid');
		}

		return validInputs == validator.totalInputs;
	}

	// Toggle button
	function toggleButton(condition) {
		if (condition) {
			validator
				.settings
				.container
				.querySelector(validator.settings.submitButton)
				.removeAttribute('disabled');
		} else {
			validator
				.settings
				.container
				.querySelector(validator.settings.submitButton)
				.setAttribute('disabled', true);
		}
	}

	// Validate elements
	function validate(element) {
		if (isField(element)) {
			// Validate fields and textareas
			switchClasses(element, validateField(element, element.getAttribute('data-validate')));

			return;
		}

		if (isRadio(element)) {
			// Validate radios

			var radioGroup = document.querySelectorAll('[name="' + element.getAttribute('name') + '"]');
			var hasChecked = false;

			for (var i = 0; i < radioGroup.length; i++) {
				var radio = radioGroup[i];

				switchClasses(radio, radio.checked);

				if (radio.checked) {
					hasChecked = true;

					break;			
				}
			}

			if (hasChecked == true) {
				for (var i = 0; i < radioGroup.length; i++) {
					radioGroup[i]
							.classList
								.remove(validator.settings.errorClass);
				}
			}

			return;
		}

		if (isCheckbox(element)) {
			// Validate checkboxes
			switchClasses(element, element.checked);

			return;
		}

		if (isSelectbox(element)) {
			// Validate selectbox
			switchClasses(element, element[element.selectedIndex].getAttribute('value') !== '');
		}
	}

	// Switch error and valid class
	function switchClasses(element, isValid) {
		toggleClasses(element, validator.settings.errorClass, validator.settings.validClass);

		if (validator.settings.fieldContainer) {
			toggleClasses(closest(element, validator.settings.fieldContainer), validator.settings.errorClass + '-container', validator.settings.validClass + '-container');
		}

		if (isValid) {
			toggleClasses(element, validator.settings.validClass, validator.settings.errorClass);

			if (validator.settings.fieldContainer) {
				toggleClasses(closest(element, validator.settings.fieldContainer), validator.settings.validClass + '-container', validator.settings.errorClass + '-container');
			}
		}
	}

	// Helper function to get closest element
    function closest(element, className) {
        var parent = element.parentNode;

        while (parent !== document && (!(parent.classList.value.indexOf(className) >= 0) || !(parent.tagName.indexOf(className.toUpperCase()) >= 0))) {
            parent = parent.parentNode;
        }

        return parent;
    }

	// Toggle between classes (addClass is selector. being added to element and removeClass is being removed from element)
	function toggleClasses(element, addClass, removeClass) {
		element
			.classList
			.remove(removeClass);

		element
			.classList
			.add(addClass);
	}

	// Field and textarea validation
	function validateField(field, validationType) {
		return new RegExp(getRegex(field, validationType)).test(field.value);
	}

	// Get regexes for different type of fields
	function getRegex(field, validationType) {
		switch (validationType) {
			case 'presence':
				return '.+';

			case 'date':
				return '^\[0-9]{4}-\[0-9]{2}-\[0-9]{2}$';

			case 'number':
				return '^\[0-9]+$';

			case 'phone':
				return '^[0-9 ()+_]+$';

			case 'email':
				return '^[0-9a-zA-Zäåö]+([0-9a-zA-Zäåö]*[-._+])*[0-9a-zA-Zäåö]+@[0-9a-zA-Zäåö]+([-.][0-9a-zA-Zäåö]+)*([0-9a-zA-Zäåö]*[.])[a-zA-Zäåö]{2,6}$';

			case 'zip':
				return '^[a-zA-Z0-9 _]+$';

			case 'match':
				return '^' + field.getAttribute('data-match') + '$';

			case 'confirm':
				return '^' + document.querySelector(field.getAttribute('data-confirm')).value + '$';

			case 'card-expire':
				if (field.value.length == 2 && !(field.value.indexOf('/') >= 0) && field.value.length > validator.cardExpireCache.length) {
					field.value = field.value + ' / ';
				}

				if (field.value.indexOf('/') > 3 || field.value.length > 7) {
					field.value = validator.cardExpireCache;
				}

				validator.cardExpireCache = field.value;

				return '^\[0-9]{2} / \[0-9]{2}$';

			default:
				return 'Invalid field validation';
		}
	}
}

