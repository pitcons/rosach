
function doFillCalendar(data, cdata) {
  var cancellations = {};
  $.each(cdata, function(i, item) {
    if (!(item.event in cancellations)) {
      cancellations[item.event] = {}
    }
    cancellations[item.event][item.date] = true;
  });
  // console.log(cancellations);

  var events = [];
  $.each(data, function(i, event) {
    var begin;
    var end;

    if (event.repeat == "WEEKLY" && event.end_repeat) {
      end = moment(event.end_repeat);
    } else {
      end = moment(event.start_date);
    }

    var current = moment(event.start_date);
    var current_end = moment(event.end_date);
    current.locale(dateLang);
    current_end.locale(dateLang);
    end.locale(dateLang);


    while(moment(current).startOf('day').unix() <= moment(end).startOf('day').unix()) {
      var place = libraryId;
      if (event.categories.length != 0) {
        if (event.categories[0] == hallId) {
          place = hallId;
        }
        if (event.categories[0] == internalId) {
          place = internalId;
        }
      }

      var rawCurrentDay = moment(current).startOf('day').format(rawDateFormat);
      if (!(event.id in cancellations) || !(rawCurrentDay in cancellations[event.id])) {
        events.push(
          {'id': event.id,
           'title': event.title,
           'description': event.description,
           'start': current.format(),
           'end': current_end.format(),
           'source_start': event.start_date,
           'source_end': event.end_date,
           'repeat': event.repeat,
           'end_repeat': event.end_repeat,
           'created_by': event.created_by,
           'place': place,
          }
        );
      }

      current.add(7, 'day');
      current_end.add(7, 'day');
    }
  });

  $('#calendar').fullCalendar('removeEvents');
  $('#calendar').fullCalendar('addEventSource', events);
  $('#calendar').fullCalendar('refetchEvents');
}

function refillCalendar() {
  var cancellationsData = false;
  var eventsData = false;

  $.get(cancellations_url).then(function(cdata){
    cancellationsData = cdata;
    if (eventsData) {
      doFillCalendar(eventsData, cancellationsData)
    }
  });
  $.get(events_url).then(function(data){
    eventsData = data;
    if (cancellationsData) {
      doFillCalendar(eventsData, cancellationsData)
    }
  });
}


$(document).ready(function() {

    var btnNoRepeat = $('#event-edit-modal button[name=no-repeat]');
    var btnWeekRepeat = $('#event-edit-modal button[name=week-repeat]');
    var btnLibraryPlace = $('#event-edit-modal button[name=library-place]');
    var btnHallPlace = $('#event-edit-modal button[name=hall-place]');
    var btnInternalPlace = $('#event-edit-modal button[name=internal-place]');

    function cleanupEventForm() {
        var form = $('#event-edit-modal').find('form');
        form.find('.form-group').removeClass('has-error');
        form.find('.help-block').html('');
        form.find("input[type=text], input[name=id], textarea").val("");
        form.find('.cancel-day').html('');
        form.find('.cancel-button').hide();
        form.find('input[name=image]').val('');
        $("#event-edit-modal .cancel-button").hide();
        btnNoRepeat.click();
        btnHallPlace.click();
    }

    function input_remove_error() {
        var group = $(this).parents('.form-group');
        group.removeClass('has-error');
        group.find('.help-block').html('');
    }

    function formatOrEmpty(date) {
        if (date) {
            return moment(date).format(dateTimeFormat);
        } else {
            return '';
        }
    }

    function dateFormatOrEmpty(date) {
        if (date) {
            return moment(date).format(dateFormat);
        } else {
            return '';
        }
    }

    function createCalendar(events) {
        $('#calendar').fullCalendar({
            lang: dateLang,
            eventDurationEditable: false,
            eventStartEditable: false,
            header: {
                left: 'title, prev, next',
                // center: '',
                //right: 'today, buttonAdd'

              center: 'today,buttonAdd',
              right: 'month,agendaWeek,agendaDay'
            },
            timezone: 'Europe/Moscow',
            timeFormat: 'H:mm',
            // defaultDate: '2016-03-25',
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events: events,
            customButtons: {
                buttonAdd: {
                    text: textNewEvent,
                    click: function() {
                        if ($('#user_login').html() == 'AnonymousUser') {
                            window.location = '/ru/admin/login/?next=/ru/calendar/';
                        } else {
                            cleanupEventForm();
                            $('#event-edit-modal').modal('show');
                        }
                    }
                }
            },
            eventAfterRender: function (event, element, view) {
                if (event.place == libraryId) {
                    element.css('background-color', "#cfdcdc");
                    element.css('border-color', "#ffffff");
                } else if (event.place == hallId) {
                    element.css('background-color', "#e7e7e7");
                    element.css('border-color', "#ffffff");
                } else {
                    element.css('background-color', "#b0b0b0");
                    element.css('border-color', "#ffffff");
                }
            },
            eventRender: function(event, element) {
                element.qtip({
                    content: { text: event.description},
		            position: {
			            my: 'bottom left',
			            at: 'top center',
			            viewport: $('#calendar'),
			            adjust: {
				            mouse: false,
				            scroll: false
			            }
		            },
                    style: 'qtip-light'
                });
            },
            eventClick: function(event, jsEvent, view) {
                if ($('#user_login').html() == 'AnonymousUser') {
                  return False;
                }
                cleanupEventForm();
                $('#event-edit-modal input[name=current_day]').val(event.start.format(dateFormat));
                $('#event-edit-modal input[name=id]').val(event.id);
                $('#event-edit-modal input[name=created_by]').val(event.created_by);
                $('#event-edit-modal input[name=title]').val(event.title);
                $('#event-edit-modal textarea[name=description]').val(event.description);
                $('#event-edit-modal input[name=start_date]').val(formatOrEmpty(event.source_start));
                $('#event-edit-modal input[name=end_date]').val(formatOrEmpty(event.source_end));
                $('#event-edit-modal input[name=end_repeat]').val(dateFormatOrEmpty(event.end_repeat));
                $('#event-edit-modal input[name=repeat]').val(event.repeat);
                $('#event-edit-modal .cancel-day').html(event.start.format(dateFormat));
                $('#event-edit-modal .cancel-button').show();
                if (event.repeat == "WEEKLY") {
                    btnWeekRepeat.addClass('active');
                    btnNoRepeat.removeClass('active');
                    $('#end-repeat-row').show();
                } else {
                    btnWeekRepeat.removeClass('active');
                    btnNoRepeat.addClass('active');
                    $('#end-repeat-row').hide();
                }
                if (event.place == libraryId) {
                    btnLibraryPlace.click();
                } else if (event.place == hallId) {
                    btnHallPlace.click();
                } else {
                    btnInternalPlace.click();
                }
                $('#event-edit-modal').modal('show');
            }
        });
    }



    btnHallPlace.click(function() {
        btnInternalPlace.removeClass('active');
        btnLibraryPlace.removeClass('active');
        btnHallPlace.addClass('active');
        $('#event-edit-modal input[name=categories]').val(hallId);
    });
    btnLibraryPlace.click(function() {
        btnHallPlace.removeClass('active');
        btnInternalPlace.removeClass('active');
        btnLibraryPlace.addClass('active');
        $('#event-edit-modal input[name=categories]').val(libraryId);
    });
    btnInternalPlace.click(function() {
        btnHallPlace.removeClass('active');
        btnLibraryPlace.removeClass('active');
        btnInternalPlace.addClass('active');
        $('#event-edit-modal input[name=categories]').val(internalId);
    });

    btnNoRepeat.click(function() {
        btnNoRepeat.addClass('active');
        btnWeekRepeat.removeClass('active');
        $('#end-repeat-row').hide();
        $('#event-edit-modal input[name=repeat]').val('NEVER');
    });
    btnWeekRepeat.click(function() {
        btnNoRepeat.removeClass('active');
        btnWeekRepeat.addClass('active');
        $('#end-repeat-row').show();
        $('#event-edit-modal input[name=repeat]').val('WEEKLY');
    });

    $('#start-datetime').datetimepicker({
        locale: dateLang,
        sideBySide: true,
    }).on('dp.change', function(e){
        var start_date = $('#event-edit-modal input[name=start_date]');
        var end_date = $('#event-edit-modal input[name=end_date]');
        //end_date.val(start_date.val());
        //if (!end_date.val()) {
        var date = moment(start_date.val(), dateTimeFormat);
        date.add(2, 'hour');
        end_date.val(date.format(dateTimeFormat));
        //}
        return false;
    });

    $('#end-datetime').datetimepicker({
        locale: dateLang,
        sideBySide: true,
    });

    $('#end-repeat-datetime').datetimepicker({
        locale: dateLang,
        sideBySide: true,
        format: dateFormat
    });

    $("#event-edit-modal input").focus(input_remove_error);
    $("#event-edit-modal input").change(input_remove_error);

    $("#event-edit-modal .cancel-button").click(function() {
        $('#send-email-modal div[role=alert]').hide();
        $('#email-subject').val(
            'Событие "' + $('#event-edit-modal input[name=title]').val() +
                '" не состоится ' + $('#event-edit-modal input[name=current_day]').val().split(' ')[0]);
        $('#email-message').summernote('code', 'Здравствуйте!<br /><br />Событие отменяется.');
        $('#send-email-modal input[name=event-id]').val($('#event-edit-modal input[name=id]').val());
        $('#send-email-modal input[name=current_day]').val($('#event-edit-modal input[name=current_day]').val());

        $("#send-email-modal .just-cancel-button").show();
        $("#send-email-modal .cancel-and-send-button").show();
        $("#send-email-modal .send-button").hide();

        $("#event-edit-modal").modal('hide');
        $("#send-email-modal").modal('show');
    });

    function showSendOnChange() {
        var title = $('#event-edit-modal input[name=title]').val();
        var when = $('#event-edit-modal input[name=start_date]').val();
        var descr = $('#event-edit-modal textarea[name=description]').val();
        $('#send-email-modal div[role=alert]').hide();
        $('#email-subject').val(
            'Событие "' + title +
                '" состоится ' + when);
        $('#email-message').summernote(
            'code',
            'Здравствуйте!<br /><br />' +
            'Событие "' + title + '" состоится ' + when + '. <br />' +
            descr
        );
        $('#send-email-modal input[name=event-id]').val($('#event-edit-modal input[name=id]').val());

        $("#send-email-modal .just-cancel-button").hide();
        $("#send-email-modal .cancel-and-send-button").hide();
        $("#send-email-modal .send-button").show();
        $("#event-edit-modal").modal('hide');
        $("#send-email-modal").modal('show');
    }

    $("#event-edit-modal .save-button").click(function() {
        var form = $("#event-edit-modal form");
        var id = $('#event-edit-modal input[name=id]').val();
        if (id) {
            var url = event_url + id + '/';
            var method = 'PUT';
        } else {
            var url = event_url;
            var method = 'POST';
        }

        $.ajax({
            url: url,
            type: method,
            dataType: 'json',
            data: form.serialize(),
            success: function(data) {
                var formData = new FormData();
                var inputImage = form.find('input[type=file]')

                if (inputImage[0].length > 0) {
                    formData.append('image', inputImage[0].files[0]);
                    formData.append('event_id', data.id);

                    $.ajax({
                        url: events_img_url,
                        type: 'POST',
                        data: formData,
                        cache: false,
                        processData: false,
                        contentType: false,
                        method: 'POST'
                    });
                }

                showSendOnChange();
                // $('#event-edit-modal').modal('hide');
                refillCalendar();
            },
            error: function(data) {
                for (var key in data.responseJSON) {
                    var group = $('#event-edit-modal *[name=' + key + ']').parents('.form-group');
                    group.addClass('has-error');
                    group.find('.help-block').html(data.responseJSON[key][0]);
                }
            }
        });
    });

    createCalendar([]);
    refillCalendar();
});
