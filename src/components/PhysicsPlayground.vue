<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import Matter from "matter-js";

const container = ref(null);
let engine, render, runner, mouseConstraint;

const initPhysics = () => {
  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, World } = Matter;

  // Create Engine
  engine = Engine.create();
  const world = engine.world;
  world.gravity.y = 0.8; // Standard gravity

  // Create Renderer
  render = Render.create({
    element: container.value,
    engine: engine,
    options: {
      width: container.value.clientWidth,
      height: 400,
      wireframes: false,
      background: "transparent",
      pixelRatio: window.devicePixelRatio,
    },
  });

  Render.run(render);

  // Create Runner
  runner = Runner.create();
  Runner.run(runner, engine);

  // Bounds (Ground & Walls)
  const wallStyle = { fillStyle: "transparent", strokeStyle: "transparent" };
  const ground = Bodies.rectangle(
    render.options.width / 2, 
    render.options.height + 30, 
    render.options.width, 
    60, 
    { isStatic: true, render: wallStyle }
  );
  const leftWall = Bodies.rectangle(-30, render.options.height / 2, 60, render.options.height, { isStatic: true, render: wallStyle });
  const rightWall = Bodies.rectangle(render.options.width + 30, render.options.height / 2, 60, render.options.height, { isStatic: true, render: wallStyle });

  Composite.add(world, [ground, leftWall, rightWall]);

  // Spawn Brand Icons (Pucks)
  const brands = [
    { label: "PS", color: "#ffffff", textColor: "#000000" },
    { label: "XBOX", color: "#107c10", textColor: "#ffffff" },
    { label: "STEAM", color: "#171a21", textColor: "#ffffff" },
    { label: "GAMES", color: "#ffffff", textColor: "#000000" },
    { label: "COIN", color: "#ffecb2", textColor: "#000000" },
    { label: "DIGIMAX", color: "#ffffff", textColor: "#000000" }
  ];

  for (let i = 0; i < 12; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const x = Math.random() * render.options.width;
    const y = -100 - Math.random() * 500;
    const radius = 30 + Math.random() * 20;

    const body = Bodies.circle(x, y, radius, {
      restitution: 0.6,
      friction: 0.1,
      render: {
        fillStyle: brand.color,
        lineWidth: 2,
        strokeStyle: "rgba(255,255,255,0.1)"
      }
    });
    
    // Attach label (simple trick: custom property for afterRender)
    body.labelName = brand.label;
    body.labelColor = brand.textColor;
    
    Composite.add(world, body);
  }

  // Mouse Interactivity
  const mouse = Mouse.create(render.canvas);
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });

  Composite.add(world, mouseConstraint);

  // Handle Text Rendering on Canvas
  Matter.Events.on(render, 'afterRender', () => {
    const context = render.context;
    context.font = "bold 12px Sora, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";

    const bodies = Composite.allBodies(world);
    for (let body of bodies) {
      if (body.labelName) {
        context.fillStyle = body.labelColor;
        context.fillText(body.labelName, body.position.x, body.position.y);
      }
    }
  });

  // Resize Listener
  window.addEventListener("resize", handleResize);
};

const handleResize = () => {
  if (!render) return;
  render.canvas.width = container.value.clientWidth;
  render.options.width = container.value.clientWidth;
};

onMounted(() => {
  setTimeout(initPhysics, 500); // Small delay to ensure layout is ready
});

onUnmounted(() => {
  if (runner) Matter.Runner.stop(runner);
  if (render) {
    Matter.Render.stop(render);
    render.canvas.remove();
    render.context = null;
    render.textures = {};
  }
  if (engine) Matter.Engine.clear(engine);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="physics-playground-wrapper">
    <div ref="container" class="physics-container"></div>
    <div class="physics-overlay">
      <p class="physics-hint">Məhsulları / Markaları sürüşdürün ve oynayın</p>
    </div>
  </div>
</template>

<style scoped>
.physics-playground-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: var(--section-bg-2);
  border-bottom: 1px solid var(--line);
}

.physics-container {
  width: 100%;
  height: 100%;
}

.physics-overlay {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  z-index: 10;
}

.physics-hint {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
  opacity: 0.6;
}
</style>
