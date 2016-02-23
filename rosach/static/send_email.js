$(document).ready(function() {
    function deleteDevent(eventId) {
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

    $("#send-email-modal .just-delete-button").click(function(){
        var id = $('#send-email-modal input[name=event-id]').val();
        if (confirm('Вы уверены, что хотите удалить событие никого не оповестив?')) {
            deleteDevent(id);
        }
    });

    function sendEmail(deleteIt) {
        var id = $('#send-email-modal input[name=event-id]').val();
        var form = $('#send-email-modal').find('form');

        $('.summernote').each( function() {
            $(this).val($(this).code());
        });

        $.ajax({
            url: send_email_url,
            type: 'POST',
            data: form.serialize(),
            dataType: 'json',
            success: function(data) {
                if (deleteIt) {
                    deleteDevent(id);
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

    $("#send-email-modal .delete-and-send-button").click(function() {
        sendEmail(true);
    });

    $('#email-message').summernote({
        height: 300
    });
});
