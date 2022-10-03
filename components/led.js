// LED Module
const gpio = require('rpi-gpio');

led_pin = 22;
led_delay = 100;
led_count = 0;
led_max = 3;

module.exports = {
    wakeword: async () => {
        led_delay = 100;
        led_count = 0;
        led_max   = 3;
        gpio.setup(led_pin, gpio.DIR_OUT, on);
    },
    listen: async () => {
        gpio.write(led_pin, 1, null);
    },
    off: async () => {
        led_delay = 0;
        led_count = 0;
        led_max   = 0;
        gpio.write(led_pin, 0, null);
    },
}

function on() {
    if (led_count >= led_max) {
        return;
    }

    setTimeout(function() {
        gpio.write(led_pin, 1, off);
        led_count += 1;
    }, led_delay);
}

function off() {
    setTimeout(function() {
        gpio.write(led_pin, 0, on);
    }, led_delay);
}
