$(document).ready(function() {
    function cancelEvent(eventId, date) {
        $.ajax({
            url: cancellations_url,
            type: 'POST',
            dataType: 'json',
            data: {
                event: eventId,
                date: date
            },
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
        var day = $('#send-email-modal input[name=current_day]').val();
        if (confirm('Вы уверены, что хотите отменить событие никого не оповестив?')) {
            cancelEvent(id, day);
        }
    });

    function sendEmail(cancelIt) {
        var id = $('#send-email-modal input[name=event-id]').val();
        var form = $('#send-email-modal').find('form');
        var day = $('#send-email-modal input[name=current_day]').val();

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
                    cancelEvent(id, day);
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
