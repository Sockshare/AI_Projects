document.addEventListener('DOMContentLoaded', () => {
    // Alias Matter.js modules
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Bodies = Matter.Bodies;

    // Create a Matter.js engine
    var engine = Engine.create();

    // Get the canvas element
    var canvas = document.getElementById('cityCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    // Set canvas dimensions (Matter.js will use these via the renderer)
    canvas.width = 800;
    canvas.height = 600;

    // Day/night cycle variables
    let timeOfDay = 0; // 0 (day) to 1 (night)
    const cycleSpeed = 0.0005;

    // Weather variables
    let currentWeather = 'rainy'; // 'normal' or 'rainy'
    let raindrops = [];
    const maxRaindrops = 200; // Max number of raindrops on screen

    // Create a Matter.js renderer
    var render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false, // Show solid shapes
            background: 'transparent' // Set background to transparent
        }
    });

    function updateDayNightCycle() {
        timeOfDay += cycleSpeed;
        timeOfDay %= 1; // Keep it between 0 and 1

        if (timeOfDay < 0.5) { // Day time
            canvas.style.backgroundColor = 'skyblue';
        } else { // Night time
            canvas.style.backgroundColor = 'darkblue';
        }
    }

    // Create a few simple physics bodies
    var ground = Bodies.rectangle(400, 590, 810, 60, { isStatic: true }); // x, y, width, height, options
    var boxA = Bodies.rectangle(400, 200, 80, 80); // Example body, can be removed or kept
    var circleA = Bodies.circle(450, 50, 40); // Example body, can be removed or kept

    // Car creation function
    function createCar(x, y, width, height) {
        return Bodies.rectangle(x, y, width, height, { 
            restitution: 0.1, 
            friction: 0.01,
            // Optional: Add a label for easier identification
            // label: 'car' 
        });
    }

    // Create cars
    var car1 = createCar(200, 550, 80, 30);
    var car2 = createCar(500, 550, 80, 30);

    // Person creation function
    function createPerson(x, y, radius) {
        return Bodies.circle(x, y, radius, { 
            restitution: 0.1, 
            friction: 0.02, // Higher friction for "walking"
            // label: 'person' // Optional
        });
    }

    // Create people
    var person1 = createPerson(300, 545, 15); // y = ground_top (560) - radius (15) = 545
    var person2 = createPerson(600, 545, 15);

    // Tree creation function
    function createTree(x, y, width, height) {
        // y position is the base of the trunk, so the center is y - height / 2
        return Bodies.rectangle(x, y - height / 2, width, height, { 
            isStatic: true, 
            label: "tree",
            render: { fillStyle: '#5C3317' } // Brown color for trees
        });
    }

    // Create trees
    // Ground's top surface is at y = 590 (center) - 30 (half height) = 560
    var tree1 = createTree(100, 560, 20, 100); // x, y_base_of_trunk, width, height
    var tree2 = createTree(700, 560, 20, 100);

    // Add all bodies to the world (including cars, people, and trees)
    World.add(engine.world, [ground, boxA, circleA, car1, car2, person1, person2, tree1, tree2]);

    // Car movement function
    function updateCarMovement() {
        // Move car1 to the left
        Matter.Body.setVelocity(car1, { x: -2, y: car1.velocity.y });

        // Move car2 to the right
        Matter.Body.setVelocity(car2, { x: 2, y: car2.velocity.y });

        // Simple boundary check to reset cars (optional for now, can be improved)
        // If car1 goes off screen left, reset to right
        if (car1.position.x < -car1.bounds.min.x + car1.bounds.max.x) { // A bit before fully off-screen
             Matter.Body.setPosition(car1, { x: canvas.width + (car1.bounds.max.x - car1.bounds.min.x)/2, y: 550 });
             Matter.Body.setVelocity(car1, { x: -2, y: 0}); // Reset velocity
        }
        // If car2 goes off screen right, reset to left
        if (car2.position.x > canvas.width + car2.bounds.min.x - car2.bounds.max.x ) { // A bit before fully off-screen
             Matter.Body.setPosition(car2, { x: -(car2.bounds.max.x - car2.bounds.min.x)/2, y: 550 });
             Matter.Body.setVelocity(car2, { x: 2, y: 0}); // Reset velocity
        }
    }

    // Run the engine
    Engine.run(engine);

    // Run the renderer
    Render.run(render);

    // Register the day/night cycle update
    Matter.Events.on(engine, 'beforeUpdate', updateDayNightCycle);
    // Register car movement update
    Matter.Events.on(engine, 'beforeUpdate', updateCarMovement);

    // People movement function
    function updatePeopleMovement() {
        // Move person1 to the left
        Matter.Body.setVelocity(person1, { x: -0.5, y: person1.velocity.y });

        // Move person2 to the right
        Matter.Body.setVelocity(person2, { x: 0.5, y: person2.velocity.y });

        // Simple boundary check for person1
        if (person1.position.x < -person1.circleRadius) { // Off-screen left
            Matter.Body.setPosition(person1, { x: canvas.width + person1.circleRadius, y: 545 });
            Matter.Body.setVelocity(person1, { x: -0.5, y: 0 });
        }

        // Simple boundary check for person2
        if (person2.position.x > canvas.width + person2.circleRadius) { // Off-screen right
            Matter.Body.setPosition(person2, { x: -person2.circleRadius, y: 545 });
            Matter.Body.setVelocity(person2, { x: 0.5, y: 0 });
        }
    }

    // Register people movement update
    Matter.Events.on(engine, 'beforeUpdate', updatePeopleMovement);

    // --- Rain Effect ---
    function createRaindrop() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height, // Start off-screen from top
            length: Math.random() * 10 + 5,
            speed: Math.random() * 5 + 2
        };
    }

    function updateAndDrawRain(context) {
        if (currentWeather === 'rainy') {
            // Add new raindrops
            const newDropsCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 new drops
            for (let i = 0; i < newDropsCount && raindrops.length < maxRaindrops; i++) {
                raindrops.push(createRaindrop());
            }

            context.strokeStyle = 'rgba(0,0,255,0.5)';
            context.lineWidth = 2;

            for (let i = raindrops.length - 1; i >= 0; i--) {
                let drop = raindrops[i];
                drop.y += drop.speed;

                // Draw the raindrop
                context.beginPath();
                context.moveTo(drop.x, drop.y);
                context.lineTo(drop.x, drop.y + drop.length);
                context.stroke();

                // If raindrop goes below canvas, reset it or remove it
                if (drop.y > canvas.height) {
                    // Reset raindrop to come from top again
                    drop.y = Math.random() * -50; // Start slightly off-screen
                    drop.x = Math.random() * canvas.width;
                    // Alternatively, remove and add a new one:
                    // raindrops.splice(i, 1);
                    // if (raindrops.length < maxRaindrops) raindrops.push(createRaindrop());
                }
            }
        } else {
            raindrops = []; // Clear raindrops if not rainy
        }
    }

    // Register rain effect to draw after Matter.js rendering
    Matter.Events.on(render, 'afterRender', function() {
        updateAndDrawRain(render.context);
    });
});
