class GameObject {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.dead = false
        this.type = ""
        this.width = 90
        this.height = 90
        this.img = undefined
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.width = 99
        this.height = 75
        this.type = "Hero"
        this.speed = 5
        this.cooldown = 0
        this.life = 3
        this.points = 0
    }

    fire() {
        gameObjects.push(new Laser(this.x + 45, this.y - 10));
        this.cooldown = 500;

        let id = setInterval(() => {
            if (this.cooldown > 0) {
                this.cooldown -= 100;
            } else {
                clearInterval(id);
            }
        }, 200);
    }

    canFire() {
        return this.cooldown === 0;
    }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
        }
    }

    incrementPoints() {
        this.points += 100;
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.width = 45
        this.height = 45
        this.type = "Enemy"
        const id = setInterval(() => {
            if(this.y < canvas.height - this.height) {
                this.y+=5
            } else {
                console.log("Stopped at", this.y);
                clearInterval(id);
            }
        }, 300)
    }
}

class Laser extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.img = laserImg;

        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

function intersectRect(r1, r2) {
    return !(
        r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    );
}

const onKeyDown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 37:
        case 39:
        case 38:
        case 40:
        case 32:
            e.preventDefault();
            break;
        default:
            break;
    }
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", (evt) => {
    // if(evt.key === "ArrowUp") {
    //     eventEmitter.emit(Messages.KEY_EVENT_UP)
    // } else if (evt.key === "ArrowDown") {
    //     eventEmitter.emit(Messages.KEY_EVENT_DOWN)
    // } else if (evt.key === "ArrowLeft") {
    //     eventEmitter.emit(Messages.KEY_EVENT_LEFT)
    // } else if (evt.key === "ArrowRight") {
    //     eventEmitter.emit(Messages.KEY_EVENT_RIGHT)
    // } else
        if(evt.key === " ") {
        eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    }else if(evt.key === "Enter") {
            eventEmitter.emit(Messages.KEY_EVENT_ENTER);
        }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") keys.ArrowUp = true;
    if (e.key === "ArrowDown") keys.ArrowDown = true;
    if (e.key === "ArrowLeft") keys.ArrowLeft = true;
    if (e.key === "ArrowRight") keys.ArrowRight = true;
    //if (e.key === " ") keys.Space = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") keys.ArrowUp = false;
    if (e.key === "ArrowDown") keys.ArrowDown = false;
    if (e.key === "ArrowLeft") keys.ArrowLeft = false;
    if (e.key === "ArrowRight") keys.ArrowRight = false;
    //if (e.key === " ") keys.Space = false;
});

class EventEmitter {
    constructor(){
        this.listeners = {}
    }

    on(message, listener) {
        if(!this.listeners[message]) {
            this.listeners[message] = [];
        }
        this.listeners[message].push(listener);
    }

    emit(message, payload = null) {
        if(this.listeners[message]) {
            this.listeners[message].forEach(listener => {
                listener(message, payload);
            });
        }
    }

    // clear() {
    //     this.listeners = {};
    // }
}

const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
}

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
}

let heroImg,
    enemyImg,
    laserImg,
    lifeImg,
    canvas, ctx,
    gameObjects = [],
    hero,
    gameLoopId,
    eventEmitter = new EventEmitter();


function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}

function createEnemies() {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * 98;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;

    for (let x = START_X; x < STOP_X; x += 98) {
        for (let y = 0; y < 50 * 5; y += 50) {
            const enemy = new Enemy(x, y);
            enemy.img = enemyImg;
            gameObjects.push(enemy);
        }
    }
}

function createHero() {
    hero = new Hero(
        canvas.width / 2 - 45,
        canvas.height - canvas.height / 4
    );
    hero.img = heroImg;
    gameObjects.push(hero);
}

function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const lasers = gameObjects.filter(go => go.type === "Laser");

    enemies.forEach(enemy => {
        const heroRect = hero.rectFromGameObject();
        if (!enemy.dead && intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    })

    // Test laser-enemy collisions
    lasers.forEach((laser) => {
        enemies.forEach((enemy) => {
            if (intersectRect(laser.rectFromGameObject(), enemy.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, {
                    first: laser,
                    second: enemy,
                });
            }
        });
    });

    // Remove destroyed objects
    gameObjects = gameObjects.filter(go => !go.dead);
}

function drawGameObjects(ctx) {
    gameObjects.forEach(go => go.draw(ctx));
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => {
        hero.y -= hero.speed
    })

    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => {
        hero.y += hero.speed
    })

    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
        hero.x -= hero.speed
    })

    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
        hero.x += hero.speed
    })

    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
        if (hero.canFire()) {
            hero.fire();
        }
    });


    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        second.dead = true;
        hero.incrementPoints();

        if (isEnemiesDead()) {
            eventEmitter.emit(Messages.GAME_END_WIN);
        }
    })

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.dead = true;
        if (isEnemiesDead()) {
            eventEmitter.emit(Messages.GAME_END_WIN);
        }

        hero.decrementLife();

        if (isHeroDead())  {
            eventEmitter.emit(Messages.GAME_END_LOSS);
            return; // loss before victory
        }

    });

    eventEmitter.on(Messages.GAME_END_WIN, () => {
        endGame(true);
    });

    eventEmitter.on(Messages.GAME_END_LOSS, () => {
        endGame(false);
    });

    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => {
        resetGame();
    });

}

function drawLife() {
    // TODO, 35, 27
    const START_POS = canvas.width - 180;
    for(let i=0; i < hero.life; i++ ) {
        ctx.drawImage(
            lifeImg,
            START_POS + (40*i),
            canvas.height - 40,
            35,
            27);
    }
}

function drawPoints() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";
    drawText("Points: " + hero.points, 10, canvas.height-20);
}

function drawText(message, x, y) {
    ctx.fillText(message, x, y);
}

function isHeroDead(){
    return hero.life <= 0
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function displayMessage(message, color = "red") {
    ctx.font = "30px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function endGame(win) {
    clearInterval(gameLoopId);

    // Set a delay to ensure any pending renders complete
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage(
                "Victory!!! Pew Pew... - Press [Enter] to start a new game Captain Pew Pew",
                "green"
            );
        } else {
            displayMessage(
                "You died !!! Press [Enter] to start a new game Captain Pew Pew"
            );
        }
    }, 200)
}

function resetGame() {
    clearInterval(gameLoopId);
    initGame();
    gameLoopId = setInterval(() => {

        if(keys.ArrowUp) hero.y -= hero.speed;
        if(keys.ArrowDown) hero.y += hero.speed;
        if(keys.ArrowLeft) hero.x -= hero.speed;
        if(keys.ArrowRight) hero.x += hero.speed;

        gameObjects.forEach(go => {
            if(go.type === 'Enemy') go.y += 1;
            if(go.type === 'Laser') {
                go.y -= 15;
                if(go.y < 0) go.dead = true;
            }
        });

        if(keys.Space && hero.canFire()) hero.fire();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateGameObjects();
        drawGameObjects(ctx);
        drawLife();
        drawPoints();
    }, 100);
}

window.onload = async () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    heroImg = await loadTexture("player.png")
    enemyImg = await loadTexture("enemyShip.png")
    laserImg = await loadTexture("laserRed.png")
    lifeImg = await loadTexture("life.png")


    initGame();
    gameLoopId = setInterval(() => {

        if (keys.ArrowUp) hero.y -= hero.speed;
        if (keys.ArrowDown) hero.y += hero.speed;
        if (keys.ArrowLeft) hero.x -= hero.speed;
        if (keys.ArrowRight) hero.x += hero.speed;

        if (keys.Space && hero.canFire()) {
            hero.fire();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateGameObjects();

        drawGameObjects(ctx);
        drawLife();
        drawPoints();
    }, 100);
}