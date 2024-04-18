// ----------------------------------- CONTROL PARAMETERS -----------------------------------

// ----------------------------------- CONTROL LOOP -----------------------------------
setInterval(function () {
    omega_1 = omega_stable;
    omega_2 = omega_stable;
    omega_3 = omega_stable;
    omega_4 = omega_stable;

    if (attachedToDrone && keys["w"]) {
        omega_1 -= 0.01;
        omega_2 -= 0.01;
        omega_3 += 0.01;
        omega_4 += 0.01;
    } else if (attachedToDrone && keys["s"]) {
        omega_1 += 0.01;
        omega_2 += 0.01;
        omega_3 -= 0.01;
        omega_4 -= 0.01;
    }

    if (attachedToDrone && keys["a"]) {
        omega_1 += 0.01;
        omega_2 -= 0.01;
        omega_3 -= 0.01;
        omega_4 += 0.01;
    } else if (attachedToDrone && keys["d"]) {
        omega_1 -= 0.01;
        omega_2 += 0.01;
        omega_3 += 0.01;
        omega_4 -= 0.01;
    }

    if (attachedToDrone && keys["q"]) {
        omega_1 += 0.1;
        omega_2 -= 0.1;
        omega_3 += 0.1;
        omega_4 -= 0.1;
    } else if (attachedToDrone && keys["e"]) {
        omega_1 -= 0.1;
        omega_2 += 0.1;
        omega_3 -= 0.1;
        omega_4 += 0.1;
    }

}, dt * 10);