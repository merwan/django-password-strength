$(function($) {
    var display_time = function(seconds) {
        var minute = 60;
        var hour = minute * 60;
        var day = hour * 24;
        var month = day * 31;
        var year = month * 12;
        var century = year * 100;

        // Provide fake gettext for when it is not available
        if( typeof gettext !== 'function' ) { gettext = function(text) { return text; }; };

        if( seconds < minute ) return gettext('only an instant');
        if( seconds < hour) return (1 + Math.ceil(seconds / minute)) + ' ' + gettext('minutes');
        if( seconds < day) return (1 + Math.ceil(seconds / hour)) + ' ' + gettext('hours');
        if( seconds < month) return (1 + Math.ceil(seconds / day)) + ' ' + gettext('days');
        if( seconds < year) return (1 + Math.ceil(seconds / month)) + ' ' + gettext('months');
        if( seconds < century) return (1 + Math.ceil(seconds / year)) + ' ' + gettext('years');

        return 'centuries'
    };

    var match_passwords = function(password_field, confirmation_fields) {
        // Optional parameter: if no specific confirmation field is given, check all
        if( confirmation_fields === undefined ) { confirmation_fields = $('.password_confirmation') }
        if( confirmation_fields === undefined ) { return; }

        var password = password_field.val();

        confirmation_fields.each(function(index, confirm_field) {
            var confirm_value = $(confirm_field).val();
            var confirm_with = $(confirm_field).data('confirm-with');

            if( confirm_with && confirm_with == password_field.attr('id')) {
                if( confirm_value && password ) {
                    if (confirm_value === password) {
                        $(confirm_field).parent().find('.password_strength_info').addClass('hidden');
                    } else {
                        $(confirm_field).parent().find('.password_strength_info').removeClass('hidden');
                    }
                } else {
                    $(confirm_field).parent().find('.password_strength_info').addClass('hidden');
                }
            }
        });

        // If a password field other than our own has been used, add the listener here
        if( !password_field.hasClass('password_strength') && !password_field.data('password-listener') ) {
            password_field.on('keyup', function() {
                match_passwords($(this));
            });
            password_field.data('password-listener', true);
        }
    };

    $('.password_strength').on('keyup', function() {
        var password_strength_bar = $(this).parent().find('.password_strength_bar');
        var password_strength_info = $(this).parent().find('.password_strength_info');

        if( $(this).val() ) {
            var result = zxcvbn( $(this).val() );
            var crack_time = result.crack_time_display;

            if( result.score < 3 ) {
                password_strength_bar.removeClass('progress-bar-success').addClass('progress-bar-warning');
                password_strength_info.find('.label').removeClass('hidden');
            } else {
                password_strength_bar.removeClass('progress-bar-warning').addClass('progress-bar-success');
                password_strength_info.find('.label').addClass('hidden');
            }

            password_strength_bar.width( ((result.score+1)/5)*100 + '%' );
            password_strength_info.find('.password_strength_time').html(display_time(result.crack_time));
            password_strength_info.removeClass('hidden');
        } else {
            password_strength_bar.removeClass('progress-bar-success').addClass('progress-bar-warning');
            password_strength_bar.width( '0%' );
            password_strength_info.addClass('hidden');
        }
        match_passwords($(this));
    });

    var timer = null;
    $('.password_confirmation').on('keyup', function() {
        var password_field;
        var confirm_with = $(this).data('confirm-with');

        if( confirm_with ) {
            password_field = $('#' + confirm_with);
        } else {
            password_field = $('.password_strength');
        }

        if (timer !== null) clearTimeout(timer);

        timer = setTimeout(function(){
            match_passwords(password_field);
        }, 400);
    });
});