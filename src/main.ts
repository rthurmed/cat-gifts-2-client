import kaplay from "kaplay";
import { levelData } from "./data";

const GAME_SCALE = 4;

const k = kaplay({
    canvas: document.getElementById("canvas") as HTMLCanvasElement,
    debug: true
});

k.setBackground(k.Color.fromHex("#fff275"));
k.debug.inspect = true;

k.setGravity(2000);

k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("cat", "sprites/cat.png");
k.loadSprite("house", "sprites/house.png");

const house = k.add([
    k.sprite("house"),
    k.scale(GAME_SCALE)
]);

for (let i = 0; i < levelData.solids.length; i++) {
    const { x, y, width, height } = levelData.solids[i];
    k.add([
        k.rect(width * GAME_SCALE, height * GAME_SCALE),
        k.pos(x * GAME_SCALE, y * GAME_SCALE),
        k.color(k.WHITE),
        k.opacity(0),
        k.body({
            isStatic: true
        }),
        k.area()
    ]);
}

for (let i = 0; i < levelData.platforms.length; i++) {
    const { x, y, width, height } = levelData.platforms[i];
    k.add([
        "one-way-collision",
        k.rect(width * GAME_SCALE, height * GAME_SCALE),
        k.pos(x * GAME_SCALE, y * GAME_SCALE),
        k.color(k.GREEN),
        k.opacity(0),
        k.body({
            isStatic: true
        }),
        k.area()
    ]);
}

const player = k.add([
    k.pos(k.center()),
    k.rect(16 * GAME_SCALE, 12 * GAME_SCALE),
    k.opacity(0),
    k.body(),
    k.area(),
    k.offscreen(),
    k.anchor("bot")
]);

const playerSprite = player.add([
    k.sprite("cat"),
    k.pos(0, 11 * GAME_SCALE),
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
    const platformY = col.target.pos.y + OWC_THRESHOLD; // topleft anchored
    // const platformY = col.target.pos.y - col.target.height + OWC_THRESHOLD; // botleft anchored
    
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

    player.collisionIgnore = k.isKeyDown("down") ? ['one-way-collision'] : [];

    k.camPos(k.camPos().lerp(player.pos, k.dt() * 4));
});
