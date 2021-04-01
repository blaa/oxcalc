"use strict";

var state = {
    'tanks': [],
    'sinks': [],
    'o2_volume': 0,
    'total_flow': 0,
    'minutes_left': 0,
    'time': null,
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
    for (var i in tanks) {
        state.o2_volume += tanks[i].volume * tanks[i].pressure;
    }
    if (isNaN(state.o2_volume)) {
        error("Błędne dane w formularzu butli");
        return;
    }
    state.o2_volume = state.o2_volume.toFixed(2);

    /* flow */
    state.total_flow = 0;
    for (var i in sinks) {
        var sink = sinks[i];
        if (sink.type == "respi") {
            const per_minute = sink.freq * (sink.breath_volume / 1000.0);
            state.total_flow += sink.fio2 * per_minute;
            if (sink.fio2 < 0.21 || sink.fio2 > 1) {
                error("Wartość FiO2 " + sink.fio2 + " poza zakresem 0.21 - 1");
                return;
            }
        } else {
            state.total_flow += sink.flow;
        }
    }

    if (isNaN(state.total_flow)) {
        error("Błędne dane w formularzu terapii");
        return;
    }

    state.total_flow = state.total_flow.toFixed(2);
    state.minutes_left = (state.o2_volume / state.total_flow);
    state.time = new Date();

    $(".error p").remove();
    $("div.results").removeClass("hidden");
    $('.ox_left').text(state.o2_volume + " l");
    var ox_usage = state.total_flow + " l/min";
    if (sinks.length > 1) {
        ox_usage = ox_usage + " (liczba terapii: " + sinks.length + ")";
    }
    $('.ox_usage').text(ox_usage);

    var etl = new Date(state.time.getTime() + state.minutes_left * 60 * 1000);
    $(".time_empty").text(etl.toLocaleString());
    $(".time_input").text(state.time.toLocaleString());

    const hours_left = parseInt(state.minutes_left / 60);
    const minutes = (state.minutes_left - hours_left * 60).toFixed(0);
    var msg = "";
    if (hours_left) {
        msg = hours_left + "h ";
    }
    msg += minutes + "m";

    $(".results span.result").text(msg);
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

function format_time(d) {
    function lp(v) {
        return ("00" + v).slice(-2);
    }
    return d.getDate() + "." + (d.getMonth()+1) + " " +
        lp(d.getHours()) + ":" + lp(d.getMinutes());
}

function update_clocks() {
    if (state.time == null)
        return;
    var now = new Date();
    var millis_since = state.time.getTime();
    var elapsed_minutes = (now.getTime() - millis_since) / 1000 / 60;

    var time_left_s = (state.minutes_left*60 - elapsed_minutes*60);
    var time_left_m = parseInt(time_left_s / 60);
    time_left_s = parseInt(time_left_s - time_left_m * 60);
    $(".time_left").text(time_left_m + "m " + time_left_s + "s");
}

function init() {
    $('#new-tank').click(new_tank);
    $('#new-passive').click(new_passive);
    $('#new-respi').click(new_respi);

    $('input.calculate').click(recalculate);
    $('input').change(recalculate);

    /* Start with one tank */
    new_tank();

    setInterval(update_clocks, 500);
}

$(document).ready(init);
