
var state = {
    'tanks': [],
    'sinks': [],
    'o2_volume': 0,
    'total_flow': 0,
    'minutes_left': 0,
};

function get_value(selector) {
    let v = $(selector).val();
    return parseFloat(v);
}

function get_tanks() {
    var tanks = [];
    $(".tanks .card").each(function() {
        tanks.push({
            pressure: parseFloat($('.pressure', this).val()),
            volume: parseFloat($('.volume', this).val()),
        });
    });
    return tanks;
}

function get_sinks() {
    var sinks = [];
    $(".sinks .card").each(function() {
        if ($(this).hasClass("respi")) {
            sinks.push({
                type: 'respi',
                breath_volume: parseFloat($('.breath-volume', this).val()),
                freq: parseFloat($('.freq', this).val()),
                fio2: parseFloat($('.fio2', this).val()),
            });
        } else {
            sinks.push({
                type: 'passive',
                flow: parseFloat($('.flow', this).val()),
            });
        }
    });
    return sinks;
}

function error(msg) {
    var err = $('<p class="alert alert-danger" role="alert"/>');
    err.text(msg);
    $(".error p").remove();
    $(".error").append(err);
    $("div.results").addClass("hidden");
}


function recalculate() {
    var tanks = get_tanks();
    var sinks = get_sinks();
    if (tanks.length == 0) {
        error("Dodaj butle");
        return;
    }
    if (sinks.length == 0) {
        error("Dodaj terapię");
        return;
    }
    state.tanks = tanks;
    state.sinks = sinks;

    /* volume */
    state.o2_volume = 0;
    for (i in tanks) {
        state.o2_volume += tanks[i].volume * tanks[i].pressure;
    }
    if (state.o2_volume == NaN) {
        error("Błędne dane w formularzu butli");
    }

    /* flow */
    state.total_flow = 0;
    for (i in sinks) {
        var sink = sinks[i];
        if (sink.type == "respi") {
            const per_minute = sink.freq * sink.breath_volume;
            state.total_flow += sink.fio2 * per_minute;
        } else {
            state.total_flow += sink.flow;
        }
    }

    if (state.total_flow == NaN) {
        error("Błędne dane w formularzu terapii");
    }

    state.minutes_left = state.o2_volume / state.total_flow;

    $(".error p").remove();
    $("div.results").removeClass("hidden");
    $('.time_left').text(state.minutes_left + " minut");

    $('.ox_left').text(state.o2_volume + " l");
    $('.ox_usage').text(state.total_flow + " l/min");

}

function remover() {
    $(this).parents('.card').remove();
}

function new_tank() {
    var tank = $(".tmpls div.tank").clone();
    $(".tanks").append(tank);
    $("input.remove", tank).click(remover);
}

function new_passive() {
    var output = $(".tmpls div.passive").clone();
    $(".sinks").append(output);
    $("input.remove", output).click(remover);
}

function new_respi() {
    var output = $(".tmpls div.respi").clone();
    $(".sinks").append(output);
    $("input.remove", output).click(remover);
}

function update_clocks() {
}

function init() {
    $('#new-tank').click(new_tank);
    $('#new-passive').click(new_passive);
    $('#new-respi').click(new_respi);

    $('input.calculate').click(recalculate);
    $('input').change(recalculate);


    /* Start with one tank */
    new_tank();

    setTimeout(update_clocks, 1000);
}

$(document).ready(init);
