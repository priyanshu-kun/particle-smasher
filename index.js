/**
 * Check list for game components
 * 
 * [*] Create a player
 * [*] Shoot projectiles
 * [*] Create enemies
 * [*] Detect collision on enemy / projectile hit
 * [*] Detect collision on enemy / player hit
 * TODO - [] Remove off screen projectiles 
 * TODO - [] Colorize game
 * TODO - [] Shrink enemies on hit 
 * TODO - [] create partile explosion on hit 
 * TODO - [] Add score 
 * TODO - [] Add game over UI
 * TODO - [] Add restart button
 * TODO - [] Add start game button 
 */



const canvas = document.querySelector("canvas")
console.log(canvas)
const ctx = canvas.getContext("2d")

// if we create an id to a html element so we can use it as a variable in javascript
canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x,y,radius,color) {
        this.x = x
        this.y = y 
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

// basically these are the small circles that instantiates with player on screen
class Projectiles {
    constructor(x,y,radius,color,velocity) {
        this.x = x 
        this.y = y 
        this.radius = radius
        this.color = color 
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
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


class Enemy {
    constructor(x,y,radius,color,velocity) {
        this.x = x 
        this.y = y 
        this.radius = radius
        this.color = color 
        this.velocity = velocity
    }
    draw() {
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
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


const x = canvas.width/2
const y = canvas.height/2

const player = new Player(x,y,30,"red")

const projectiles = []
const enemies = []


function spawnEnemies() {
    setInterval(() => {
        // randomize enemy shapes
        const radius = Math.random() * (30 - 6) + 6
        let x
        let y ;
        if(Math.random() < 0.5) {
             x = Math.random() < 0.5 ? 0 - radius :canvas.width + radius
         y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = "orange"
        const angle = Math.atan2(canvas.height/2 - y,canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    }, 1000);

}

let animationId = undefined


function animate() {
    animationId = requestAnimationFrame(animate)
    ctx.clearRect(0,0,canvas.width,canvas.height)
    player.draw()
    projectiles.forEach((projectile,p_idx) => {
        projectile.update()

        // remove projectiles from screen when the hit on edge 
        if(projectile.x + projectile.radius < 0 || 
           projectile.x - projectile.radius > canvas.width || 
           projectile.y + projectile.radius < 0 || 
           projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(p_idx,1)
            }, 0);
        }
    })
    enemies.forEach((enemy,e_idx) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y)
        // if this true then we end the game
        if(dist - enemy.radius - (player.radius-2) < 1) {
            cancelAnimationFrame(animationId)
         }
        projectiles.forEach((projectile,p_idx) => {
            // here we are get distance between two points ex: here is projectile and enemy and remove them in arrays in short we perform here colision detection
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y)
            if(dist - enemy.radius - projectile.radius < 1) {
               setTimeout(() => {
                enemies.splice(e_idx,1)
                projectiles.splice(p_idx,1)
               }, 0);
            }
        })
    })
}


addEventListener("click",(e) => {
    // atan2 create a right angle triangle towards the center to the mouse pointer
    console.log(projectiles)
    const angle = Math.atan2(e.clientY - canvas.height/2,e.clientX - canvas.width/2)
    console.log(angle)
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    projectiles.push(new Projectiles(canvas.width/2,canvas.height/2,5,"blue",velocity))
})

animate()
spawnEnemies()