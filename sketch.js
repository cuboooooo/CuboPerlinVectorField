// https://sighack.com/post/getting-creative-with-perlin-noise-fields 

let arrowsMap = []
let gCtx;
let balls = [];

let w = 550 // width of canvas
let arrowsResolution = 30; // dimensions of arrowsMap
let ballsResolution = 100; // sqrt of balls to spawn
let ballWidth = 1; // size of balls
let nvisResolution = 100; // size of noise visulaization
let noiseFreq = 0.025 // lower = smoother

let screenFadeFactor = 0.005 // how much the global fade is (0 is off)
let ballFadeFactor = 10  // opacity of the balls. (255 is off)

let sim = true;
let arrows = false;
let noiseVis = false;

let spacetime = 0; // this is so that we can change the field again. its set to frameCount

let dragForce = 0.1;
let fieldForce = 10;
let timeScale = 5;

// it always seems to tend to the left, and im not sure why.
// i think because the average value would be between 0 (down) and 360 (up) which would average left maybe ??? im not sure.
// so im adding a random twist function to bump all the values by so that they all trend somewhere new each time.

let twist = 360 * Math.random()


function fillField(){
  spacetime = frameCount
  arrowsMap = []
  for(let i = 0; i < arrowsResolution; i++){
    arrowsMap.push([])
    for(let j = 0; j < arrowsResolution; j++){
       let c = 360 * noise(j*noiseFreq, i*noiseFreq, spacetime*timeScale);
       arrowsMap[i].push(c);
    }
  }
}

function fillBalls(){
  let spacing = width/ballsResolution
  let length = spacing/4
  for (let i = 0; i < ballsResolution; i++){
    for (let j = 0; j < ballsResolution; j++){
      balls.push({"pos": {"x":i*spacing, "y":j*spacing}, "vel":{"x": 0, "y": 0}}) 
    }
  }
}

function setup() {
  arrowsMap = []
  balls = [];
  twist = 360 * Math.random()
  createCanvas(w, w);
  dots = createGraphics(w,w)
  
  angleMode(DEGREES)
  
  // create arrowsMap
  
  fillField()
  fillBalls()
  background(10);
}

function draw() {
  image(dots,0,0,w,w)

  if (arrows){
    drawArrows()
  }
  
  if (noiseVis){
    drawNoiseVis()
  }
  
  if (sim) {  
    // draw balls
    drawBalls()

    // update balls
    updateBalls()
  }
  
  
  
  // prints a translucent square over the graphics object every frame to fade it, COULD iterate thru every pixel and fade that, but this is easier.
  dots.fill(10,255*screenFadeFactor)
  dots.square(0,0,w) 
  
}

function drawArrows(){
  let spacing = width/arrowsResolution
  let length = spacing/4
  for (let i = 0; i < arrowsResolution; i++) {
    for (let j = 0; j < arrowsResolution; j++ ) {
      push()
      fill(100)
      stroke(200)
      let x = i*spacing+spacing/2
      let y = j*spacing+spacing/2
      let r = 360 * noise(x*noiseFreq, y*noiseFreq, spacetime*timeScale)
      translate(i*spacing+spacing/2, j*spacing+spacing/2)
      angleMode(DEGREES)
      rotate(r - 90 + twist)
      line(0, -length, 0, length)
      triangle(-length/3, length/2, length/3, length/2, 0,length)
      pop()
      
    }
  }
}

function drawBalls(){
  for (let i = 0; i < balls.length; i++) {
      
      dots.push()
      let tx = balls[i].pos.x
      let ty = balls[i].pos.y
      dots.noStroke()
      dots.fill(0,255,255,ballFadeFactor)
      dots.circle(tx,ty,ballWidth)
      dots.pop()
      
  }
}

function drawNoiseVis() {
  let spacing = width/nvisResolution
  let r = spacing
  for (let i = 0; i < nvisResolution; i++) {
    for (let j = 0; j < nvisResolution; j++ ) {
      push()
      let x = i*spacing+spacing/2
      let y = j*spacing+spacing/2
      let c = 255 * noise(x*noiseFreq, y*noiseFreq, spacetime*timeScale)
      translate(i*spacing+spacing/2, j*spacing+spacing/2)
      fill(c)
      noStroke()
      circle(x,y,r)
      pop()
      
    }
  }
}

function updateBalls() {
  for (let i = 0; i < balls.length; i++) {
      let ball = balls[i]
      
      let bx = ball.pos.x
      let by = ball.pos.y
      let r = 360 * noise(bx*noiseFreq, by*noiseFreq, spacetime*timeScale) + twist
      // angle of force in degrees.
      let dtime = deltaTime/1000 * timeScale
            
      // apply force to velocity
      
      angleMode(DEGREES)
      let Fx = fieldForce * cos(r)
      let Fy = fieldForce * sin(r)
      
      ball.vel.x += Fx * dtime
      ball.vel.y += Fy * dtime
      
      // apply drag to velocity
      
      ball.vel.x *= (1-dragForce)
      ball.vel.y *= (1-dragForce)
      
      // apply velocity to position
      
      ball.pos.x += ball.vel.x * dtime
      ball.pos.y += ball.vel.y * dtime
      
      // delete ball if outside of bounds
      
    if (ball.pos.x > width || 
        ball.pos.x < 0 ||
       ball.pos.y > height ||
       ball.pos.y < 0){
      balls.splice(i,1)
    }
    }
}

function keyPressed(){
  switch(key){
    case "r":
      setup()
      break
  }
}