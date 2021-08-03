/**
 * Check list for game components
 * 
 * [*] Create a player
 * [*] Shoot projectiles
 * [*] Create enemies
 * [*] Detect collision on enemy / projectile hit
 * [*] Detect collision on enemy / player hit
 * [*] Remove off screen projectiles 
 * [*] Colorize game
 * [*] Shrink enemies on hit 
 * [*] create partile explosion on hit 
 * [*] Add score 
 * [*] Add start game button 
 * [*] Add game over UI
 * [*] Add restart button
 */



const canvas = document.querySelector("canvas")
console.log(canvas)
const ctx = canvas.getContext("2d")
const scoreEl = document.getElementById("score")
const button = document.getElementById("start-game")
const model = document.querySelector(".parent-div")
const displayFinalScore = document.getElementById("display-score")

// if we create an id to a html element so we can use it as a variable in javascript
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

// basically these are the small circles that instantiates with player on screen
class Projectiles {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
    // to update my classes properties
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}


class Enemy extends Projectiles {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
    }

}

const friction = 0.98

class Particle extends Enemy {
    constructor(x, y, radius, color, velocity) {
        super(x, y, radius, color, velocity)
        this.alpha = 1
    }
    draw() {
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }
    // to update my classes properties
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}


const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, "#fff")

let projectiles = []
let enemies = []
let particle = []

function resetGame() {
    player = new Player(x, y, 10, "#fff")
    score = 0
    scoreEl.innerHTML = score
    displayFinalScore.innerHTML = score
    projectiles = []
    enemies = []
    particle = []
    ctx.fillStyle = "#000"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    
}


function spawnEnemies() {
    setInterval(() => {
        // randomize enemy shapes
        const radius = Math.random() * (30 - 6) + 6
        let x
        let y;
        // this condition is for create enemys on every direction on screen
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.floor(Math.random() * 360)},50%,50%)`;
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000);

}

let animationId = undefined
let score = 0




function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particle.forEach((p, particle_idx) => {
        if (p.alpha <= 0) {
            particle.splice(particle_idx, 1)
        } else {
            p.update()
        }
    })
    projectiles.forEach((projectile, p_idx) => {
        projectile.update()

        // remove projectiles from screen when the hit on edge 
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(p_idx, 1)
            }, 0);
        }
    })
    enemies.forEach((enemy, e_idx) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        // if this true then we end the game
        if (dist - enemy.radius - (player.radius - 2) < 1) {
            displayFinalScore.innerHTML = score
            button.innerHTML = "Restart Game"
            model.style.display = "flex"
            cancelAnimationFrame(animationId)
        }
        projectiles.forEach((projectile, p_idx) => {
            // here we are get distance between two points eg: here is projectile and enemy and remove them in arrays in short we perform here colision detection
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // when projectiles get hit on enemy
            if (dist - enemy.radius - projectile.radius < 1) {

                // here we are just create partile explosion basically what we are doin is that we loop through enemy radius times 2 so we can create particle explosion according to the size of the enemy
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particle.push(new Particle(projectile.x, projectile.y, Math.floor(Math.random() * 3), enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 6),
                        y: (Math.random() - 0.5) * (Math.random() * 6)
                    }))
                }
                // here we are just reduce the size of enemy when they got a hit and transition them
                if (enemy.radius - 10 > 10) {
                    score += 10
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(p_idx, 1)
                }
                else {
                    score += 50
                    scoreEl.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(e_idx, 1)
                        projectiles.splice(p_idx, 1)
                    }, 0);
                }
            }
        })
    })
}


addEventListener("click", (e) => {
    // atan2 create a right angle triangle towards the center to the mouse pointer
    const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectiles(canvas.width / 2, canvas.height / 2, 5, "#fff", velocity))
})

button.addEventListener("click", (e) => {
    resetGame()
    animate()
    spawnEnemies()
    model.style.display = "none"
})
