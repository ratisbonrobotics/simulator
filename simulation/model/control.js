// TODO

/*
When designing a control system for a drone that assists the user in flying without a predefined trajectory, you can approach it differently compared to the case where you have a known trajectory. Here are some ideas and pointers to consider:

1. Attitude Stabilization:
   - Focus on maintaining the drone's stability and orientation rather than following a specific trajectory.
   - Implement a control system that keeps the drone level and prevents it from tilting excessively.
   - Use sensors such as an IMU (Inertial Measurement Unit) to measure the drone's orientation and angular rates.
   - Apply PID or other control algorithms to adjust the motor speeds and maintain a stable attitude.

2. User Input Mapping:
   - Map the user's input commands (e.g., forward, backward, left, right) to desired angles or rates of change in the drone's orientation.
   - For example, when the user presses "forward," set a desired pitch angle or pitch rate that causes the drone to tilt forward and move in that direction.
   - Similarly, map the other input commands to corresponding desired angles or rates.

3. Smooth Input Changes:
   - To handle quick changes in user input and prevent abrupt movements, you can apply smoothing techniques.
   - Implement a low-pass filter or a rate limiter to smooth the input commands and prevent sudden jumps in the desired angles or rates.
   - This helps to avoid sharp transitions and allows the control system to adapt gradually to changes in user input.

4. Velocity Control:
   - In addition to attitude control, you can incorporate velocity control to regulate the drone's speed based on user input.
   - Estimate the drone's velocity using techniques like optical flow or sensor fusion with accelerometer and GPS data.
   - Adjust the desired velocity based on user input and use a separate control loop to regulate the velocity while maintaining stability.

5. Robustness and Safety:
   - Implement safety features and constraints to prevent the drone from performing unsafe maneuvers or exceeding its operational limits.
   - Set limits on the maximum tilt angles, velocities, and accelerations to ensure the drone operates within safe boundaries.
   - Include failsafe mechanisms to handle unexpected situations or loss of control.

6. Testing and Tuning:
   - Conduct extensive testing and tuning of the control system to ensure it performs well under various conditions and user inputs.
   - Test the responsiveness, stability, and smoothness of the drone's behavior when the user changes directions quickly or provides rapid input changes.
   - Fine-tune the control parameters, such as PID gains or filter coefficients, to achieve the desired performance and user experience.

Remember, the key is to focus on maintaining the drone's stability and orientation while responding to user input in a smooth and controlled manner. By combining attitude stabilization, user input mapping, smoothing techniques, and safety constraints, you can create a control system that assists the user in flying the drone without relying on a predefined trajectory.

It's important to validate the control system through simulations and real-world testing to ensure it performs well under various scenarios and handles quick direction changes gracefully.
*/