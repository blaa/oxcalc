
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

function parse_num(value) {
    value = value.replace(",", ".");
    return parseFloat(value);
}

function get_tanks() {
    var tanks = [];
    $(".tanks .card").each(function() {
        tanks.push({
            pressure: parse_num($('.pressure', this).val()),
            volume: parse_num($('.volume', this).val()),
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
                breath_volume: parse_num($('.breath-volume', this).val()),
                freq: parse_num($('.freq', this).val()),
                fio2: parse_num($('.fio2', this).val()),
            });
        } else {
            sinks.push({
                type: 'passive',
                flow: parse_num($('.flow', this).val()),
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
    if (isNaN(state.o2_volume)) {
        error("Błędne dane w formularzu butli");
        return;
    }
    state.o2_volume = state.o2_volume.toFixed(2);

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

    if (isNaN(state.total_flow)) {
        error("Błędne dane w formularzu terapii");
        return;
    }

    state.total_flow = state.total_flow.toFixed(2);

    state.minutes_left = (state.o2_volume / state.total_flow).toFixed(1);

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
