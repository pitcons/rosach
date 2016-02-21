$(document).ready(function() {
    var subscriptions_url = '/ru/api/subscriptions/';

    $('#subscribe-button').click(function(){
        var form = $('#subscribe-form');

        $.ajax({
            url: subscriptions_url,
            type: 'PUT',
            dataType: 'json',
            data: form.serialize(),
            success: function(data) {
                form.find('.form-group').removeClass('has-error');
                form.find('.help-block').html('');
                form.find("input[type=text], input[name=id], textarea").val("");
                alert('Вы подписаны на рассылку.');
            },
            error: function(data) {
                for (var key in data.responseJSON) {
                    var group = form.find('*[name=' + key + ']').parents('.form-group');
                    group.addClass('has-error');
                    group.find('.help-block').html(data.responseJSON[key][0]);
                }
            }
        });
    });
});
