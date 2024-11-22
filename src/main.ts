import kaplay from "kaplay";

const k = kaplay({
    canvas: document.getElementById("canvas") as HTMLCanvasElement,
    width: 800,
    height: 600,
    debug: true
});

k.setBackground(k.Color.fromHex("#fff275"));
k.debug.inspect = true;

k.setGravity(2000);

k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("cat", "sprites/cat.png");

// floor
k.add([
    k.rect(k.width(), 100),
    k.pos(0, k.height() - 40),
    k.color(k.WHITE),
    k.body({
        isStatic: true
    }),
    k.area()
]);

k.add([
    k.rect(200, 40),
    k.pos(k.width() - 200, k.height() - 200),
    k.color(k.WHITE),
    k.body({
        isStatic: true
    }),
    k.area()
])

// platforms
k.add([
    "one-way-collision",
    k.pos(40, k.height() - 40),
    k.rect(200, 40),
    k.color(k.RED),
    k.anchor("botleft"),
    k.body({
        isStatic: true
    }),
    k.area()
]);
k.add([
    "one-way-collision",
    k.pos(200, k.height() - 40),
    k.rect(200, 100),
    k.color(k.RED),
    k.anchor("botleft"),
    k.body({
        isStatic: true
    }),
    k.area()
]);

const player = k.add([
    k.pos(k.center()),
    k.rect(16 * 4, 12 * 4),
    k.opacity(0),
    k.body(),
    k.area(),
    k.offscreen(),
    k.anchor("bot")
]);

const playerSprite = player.add([
    k.sprite("cat"),
    k.pos(0, 11 * 4),
    k.scale(4),
    k.anchor("bot"),
])

player.onExitScreen(() => {
    player.pos = k.center();
});

player.onKeyPress((key) => {
    if (player.isGrounded() && key === "up") {
        player.jump();
    }
});

player.onBeforePhysicsResolve((col) => {
    if (!col.target.is("one-way-collision")) {
        return;
    }

    const OWC_THRESHOLD = 10;

    const playerY = player.pos.y;
    const platformY = col.target.pos.y - col.target.height + OWC_THRESHOLD; // botleft anchored
    
    if (playerY > platformY) {
        col.preventResolution();
    }
});

let playerMovementX = 0;

player.onUpdate(() => {
    let targetMovementX = 0;
    if (k.isKeyDown("left")) {
        targetMovementX = 10 * -1;
        playerSprite.flipX = false;
    }
    if (k.isKeyDown("right")) {
        targetMovementX = 10;
        playerSprite.flipX = true;
    }
    playerMovementX = k.lerp(playerMovementX, targetMovementX, k.dt() * 4);
    player.pos.x += playerMovementX;

    player.collisionIgnore = k.isKeyDown("down") ? ['one-way-collision'] : []
});
