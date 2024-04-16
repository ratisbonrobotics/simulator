
setInterval(function () {

    if (!attachedToDrone) {
        // --- DEMO MOVEMENT ---
        /*
        omega_1 = omega_stable + 0.081 * Math.sin(time + 0.001) + time * 0.0005;
        omega_2 = omega_stable + 0.1 * Math.cos(time) + time * 0.0005;
        omega_3 = omega_stable + 0.081 * Math.sin(time) + time * 0.0005;
        omega_4 = omega_stable + 0.1 * Math.cos(time) + time * 0.0005;
        */
        omega_1 = omega_stable;
        omega_2 = omega_stable;
        omega_3 = omega_stable;
        omega_4 = omega_stable;
    } else {
        if (keys["w"]) {
            omega_1 = omega_stable - 0.0001;
            omega_2 = omega_stable - 0.0001;
            omega_3 = omega_stable + 0.0001;
            omega_4 = omega_stable + 0.0001;
        }
        if (keys["s"]) {
            omega_1 = omega_stable + 0.0001;
            omega_2 = omega_stable + 0.0001;
            omega_3 = omega_stable - 0.0001;
            omega_4 = omega_stable - 0.0001;
        }
        if (keys["a"]) {
            omega_1 = omega_stable + 0.001;
            omega_2 = omega_stable - 0.001;
            omega_3 = omega_stable + 0.001;
            omega_4 = omega_stable - 0.001;
        }
        if (keys["d"]) {
            omega_1 = omega_stable - 0.001;
            omega_2 = omega_stable + 0.001;
            omega_3 = omega_stable - 0.001;
            omega_4 = omega_stable + 0.001;
        }
        if (keys["q"]) {
            omega_1 = omega_stable + 0.001;
            omega_2 = omega_stable + 0.001;
            omega_3 = omega_stable + 0.001;
            omega_4 = omega_stable + 0.001;
        }
        if (keys["e"]) {
            omega_1 = omega_stable - 0.001;
            omega_2 = omega_stable - 0.001;
            omega_3 = omega_stable - 0.001;
            omega_4 = omega_stable - 0.001;
        }
        if (keys["x"]) {
            omega_1 = omega_stable;
            omega_2 = omega_stable;
            omega_3 = omega_stable;
            omega_4 = omega_stable;
        }
    }

}, dt * 10);
