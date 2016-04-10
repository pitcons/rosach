$(document).ready(function() {
    function cancelEvent(eventId) {
        $.ajax({
            url: event_url + eventId,
            type: 'DELETE',
            dataType: 'json',
            success: function(data) {
                refillCalendar();
            },
            error: function(data) {
                alert('Не удалось удалить: ' + data);
            }
        });
        $("#send-email-modal").modal('hide');
    }

    $("#send-email-modal .just-cancel-button").click(function(){
        var id = $('#send-email-modal input[name=event-id]').val();
        if (confirm('Вы уверены, что хотите отменить событие никого не оповестив?')) {
            cancelEvent(id);
        }
    });

    function sendEmail(cancelIt) {
        var id = $('#send-email-modal input[name=event-id]').val();
        var form = $('#send-email-modal').find('form');

        $('.summernote').each(function() {
            $(this).val($(this).code());
        });

        $.ajax({
            url: send_email_url,
            type: 'POST',
            data: form.serialize(),
            dataType: 'json',
            success: function(data) {
                if (cancelIt) {
                    cancelEvent(id);
                } else {
                    $("#send-email-modal").modal('hide');
                }
            },
            error: function(data) {
                $('#send-email-modal div[role=alert]').html(data.responseJSON['message']);
                $('#send-email-modal div[role=alert]').show();
            }
        });
    }

    $("#send-email-modal .send-button").click(function() {
        sendEmail(false);
    });

    $("#send-email-modal .cancel-and-send-button").click(function() {
        sendEmail(true);
    });

    $('#email-message').summernote({
        height: 300
    });
});
