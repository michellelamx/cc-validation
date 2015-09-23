"use strict";

var ccValidation = (function($, module, core) {

    var $num,
        $inputCardNumber,
        $inputCardCvv,
        $brandBadge,
        cards,
        groups,
        defaultFormat;

    defaultFormat = /(\d{1,4})/g;
    cards = [{
        type: "cc-visa",
        pattern: /^4/,
        format: defaultFormat
    }, {
        type: "cc-mastercard",
        pattern: /^5[1-5]/,
        format: defaultFormat
    }, {
        type: "cc-amex",
        pattern: /^3[47]/,
        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/
    }, {
        type: "cc-discover",
        pattern: /^6[011|65|64[4-9]|622]/,
        format: defaultFormat
    }, {
        type: "credit-card",
        pattern: /^([0-3]|[5-9])/,
        format: defaultFormat
    }];


    // get the card type based on account number
    function cardFromNumber(num) {
        var card,
            _i,
            _len,
            newNum = (num + "").replace(/\D/g, "");

        for (_i = 0, _len = cards.length; _i < _len; _i++) {
            card = cards[_i];

            if (card.pattern.test(newNum)) {
                return card;
            }
        }

        // Return default
        return cards[cards.length - 1];
    }

    // restrict input to numbers only, no alpha characters
    function restrictNumeric(e) {
        var input;

        if (e.metaKey || e.ctrlKey || e.which < 33) {  // metaKey: command, windows, and control keys
            return true;                                    // < 33: backspace, tab, enter, shift, ctrl, alt, caps lock, escape, and space keys
        }

        if (e.which === 32) {  // space bar
            return false;
        }

        input = String.fromCharCode(e.which);
        return !!/[\d\s]/.test(input);  //return will be true if numeric, false if alpha
    }

    // restrict the number of digits the user can enter based on the default cc number length
    function restrictCardNumberLength(e) {
        var $target = $(e.currentTarget),
            value = $target.val();

        if (value.length) {
            var card = cardFromNumber(value),
                brand = card.type;

            if (brand === "cc-amex") {
                return value.length <= 16;
            } else {
                return value.length <= 18;
            }
        }
    }

    // restrict the number of digits the user can enter based on the default cc cvv length
    function restrictCardCvvLength(e) {
        var $target = $(e.currentTarget),
            cvv = $target.val();

        if ($('.icon').hasClass('cc-amex')) {
            return cvv.length <= 3;
        } else {
            return cvv.length <= 2;
        }
    }

    // reformat the account number with proper number groupings & spaces
    function formatCardNumber(e) {
        var $target = $(e.currentTarget),
            value = $target.val();

        if (value.length) {
            var card = cardFromNumber(value),
                brand = card.type,
                re;

            updateBrand(brand);

            if (brand === "cc-amex") {
                re = /^(\d{4}|\d{4}\s\d{6})$/;
            } else {
                re = /(?:^|\s)(\d{4})$/;
            }

            if (re.test(value)) {
                e.preventDefault();
                return $target.val(value + " ");
            }
        }
    }

    // watch for deleting & backspacing
    function formatBackCardNumber(e) {
        var $target = $(e.currentTarget),
             value = $target.val();

        if ($target.prop("selectionStart") !== null && $target.prop("selectionStart") !== value.length || e.meta || e.which !== 8) {
            return;
        }

        if (/\d\s$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\d\s$/, ""));
        } else if (/\s\d?$/.test(value)) {
            e.preventDefault();
            return $target.val(value.replace(/\s\d?$/, ""));
        }
    }

    // get pasted cc number and replace with formatted number
    function reformatCardNumber(e) {
        var _this = this;

        return setTimeout(function() {
            var $target = $(e.currentTarget),
                value = $target.val(),
                newValue = formatPastedCardNumber(value);

                return $target.val(newValue);
        });
    }

    // add proper number grouping and spaces to pasted account number
    function formatPastedCardNumber(num) {
        num = num.replace(/\D/g, "");
        var card = cardFromNumber(num),
            brand = card.type,
            _ref;

        //update the icon
        updateBrand(brand);

        if (brand === 'cc-amex') {
            groups = card.format.exec(num);
            groups.shift();
            return groups !== null ? groups.join(" ") : void 0;
        } else {
            return (_ref = num.match(card.format)) !== null ? _ref.join(" ") : void 0;
        }
    }

    // update icon for credit card
    function updateBrand(brand) {

        if (brand) {
            $brandBadge.attr('class', 'icon ' + brand);
        } else {
            $brandBadge.attr('class', 'icon ' + 'credit-card');
        }
    }

    return {
        init : function () {

            var $module = $(module);

            $inputCardNumber = $module.find('input#card_number');
            $inputCardCvv = $module.find('input#card_cvv');
            $brandBadge = $module.find('.icon.credit-card');

            $inputCardNumber.on('keypress', restrictNumeric);
            $inputCardCvv.on('keypress', restrictNumeric);
            $inputCardNumber.on('keypress', restrictCardNumberLength);
            $inputCardCvv.on('keypress', restrictCardCvvLength);
            $inputCardNumber.on('keydown keyup', formatCardNumber);
            $inputCardNumber.on('keydown', formatBackCardNumber);
            $inputCardNumber.on('paste', reformatCardNumber);
        }
    }
})();