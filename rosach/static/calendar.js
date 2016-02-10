$(document).ready(function() {
    var url = '/ru/api/events/?format=json';
    var dateTimeFormat = 'DD.MM.YYYY h:mm:ss';
    var dateFormat = 'DD.MM.YYYY';
    var dateLang = 'ru';
    var btnNoRepeat = $('#event-edit-modal button[name=no-repeat]');
    var btnWeekRepeat = $('#event-edit-modal button[name=week-repeat]');


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

    $.get(url).then(function(data){
        var events = [];
        $.each(data, function(i, event) {
            var begin;
            var end;

            if (event.repeat == "WEEKDAY") {
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
                events.push(
                    {'id': event.id,
                     'title': event.title,

                     'start': current.format(),
                     'end': current_end.format(),

                     'source_start': event.start_date,
                     'source_end': event.end_date,

                     'repeat': event.repeat,
                     'endRepeat': event.end_repeat
                    }
                );

                current.add(7, 'day');
                current_end.add(7, 'day');
            }
        });

        $('#calendar').fullCalendar({
            lang: dateLang,
            eventDurationEditable: false,
            eventStartEditable: false,
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            timezone: 'Europe/Moscow',
            // defaultDate: '2016-03-25',
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events: events,
            eventClick: function(event, jsEvent, view) {

                $('#event-edit-modal').modal('show');
                $('#event-edit-modal input[name=title]').val(event.title);
                $('#event-edit-modal input[name=start-datetime]').val(formatOrEmpty(event.source_start));
                $('#event-edit-modal input[name=end-datetime]').val(formatOrEmpty(event.source_end));
                $('#event-edit-modal input[name=end-repeat-datetime]').val(dateFormatOrEmpty(event.endRepeat));
                if (event.repeat == "WEEKDAY") {
                    btnWeekRepeat.addClass('active');
                    $('#end-repeat-row').show();
                } else {
                    btnNoRepeat.addClass('active');
                    $('#end-repeat-row').hide();
                }
            }
        });

        btnNoRepeat.click(function() {
            btnNoRepeat.addClass('active');
            btnWeekRepeat.removeClass('active');
            $('#end-repeat-row').hide();
        });
        btnWeekRepeat.click(function() {
            btnNoRepeat.removeClass('active');
            btnWeekRepeat.addClass('active');
            $('#end-repeat-row').show();
        });

        $('#start-datetime').datetimepicker({
            locale: dateLang,
            sideBySide: true,
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

    });


});
