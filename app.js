class GameObject {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.dead = false
        this.type = ""
        this.width = 5
        this.height = 5
        this.img = undefined
    }
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height)
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.width = 5
        this.height = 5
        this.type = "Hero"
        this.speed = 5
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y)
        this.width = 5
        this.height = 5
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

function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path
    img.onload = () => {
      resolve(img)
    }
  })
}

function createEnemies(ctx, canvas, enemyImg) {
    const ENEMY_TOTAL = 5;
    const ENEMY_SPACING = 98;
    const FORMATION_WIDTH = ENEMY_TOTAL * ENEMY_SPACING;
    const START_X = (canvas.width - FORMATION_WIDTH) / 2;
    const STOP_X = START_X + FORMATION_WIDTH;

    for (let x = START_X; x < STOP_X; x += ENEMY_SPACING) {
        for (let y = 0; y < 50 * 5; y += 50) {
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

window.onload = async () => {
  const canvas = document.getElementById('canvas')
  const ctx = canvas.getContext('2d')
    const playerImg = await loadTexture("player.png")
    const enemyImg = await loadTexture("enemyShip.png")

  ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(playerImg, canvas.width / 2 - 45, canvas.height - canvas.height / 4)
  // TODO uncomment the next line when you add enemies to screen
  createEnemies(ctx, canvas, enemyImg);
}
