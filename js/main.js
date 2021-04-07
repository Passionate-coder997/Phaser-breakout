var game;
var ballOnPaddle = true;
var lives = 3;
var score = 0;
var stageWidth = 800;
var livesText;
var ball;
var paddle;
var bricks;
var width = screen.width;
var height = screen.height;

var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    // Do all the scaling
    if (!game.device.desktop) {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.setScreenSize(true);
    } else {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize(true);
    }
    
    game.load.image('ball', 'img/ball.png');
    game.load.image('brick', 'img/brick.png');
    game.load.image('paddle', 'img/paddle.png');

}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    //create bricks group
    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    //create all bricks
    var brick;

    for (var y = 0; y < width; y++) {
        for (var x = 0; x < 8; x++) {
            brick = bricks.create(80 + (x * 89), 100 + (y * 52), 'brick');
            brick.body.bounce.set(1);
            brick.body.immovable = true;
        }
    }

    paddle = game.add.sprite(game.word.y - 100, 'paddle');
    paddle.anchor.setTo(0.5, 0.5);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    //create the paddle
    paddle.body.collideWorldBounds = true;
    paddle.anchor.set(0.5, 0.5);
    paddle.body.immovable = true;

    //create the ball
    ball = game.add.sprite(paddle.centerX, paddle.y - 19, 'ball');
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.bounce.set(1);
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    ball.body.collideWorldBounds = true;

    //We don't want to check for out of worldBound when the ball goes down the screen
    game.physics.arcade.checkCollision.down = false;

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(width-32, height-30, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(width-768, height-30, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);
}

function update() {
    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    // s.tilePosition.x += (game.input.speed.x / 2);

    paddle.x = game.input.x;

    if (paddle.x < 24) {
        paddle.x = 24;
    } else if (paddle.x > game.width - 24) {
        paddle.x = game.width - 24;
    }

    if (ballOnPaddle) {
        ball.body.x = paddle.x;
    } else {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }

}

function releaseBall() {

    if (ballOnPaddle) {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost() {

    lives--;
    livesText.text = 'lives: ' + lives;

    if (lives === 0) {
        gameOver();
    } else {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);

        //ball.animations.stop();
    }

}

function gameOver() {

    ball.body.velocity.setTo(0, 0);

    introText.text = 'Game Over!';
    introText.visible = true;

}

function ballHitBrick(_ball, _brick) {

    _brick.kill();

    score += 10;

    scoreText.text = 'score: ' + score;

    //  Are they any bricks left?
    if (bricks.countLiving() == 0) {
        //  New level starts
        score += 1000;
        scoreText.text = 'score: ' + score;
        //introText.text = '- Next Level -';

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        //ball.animations.stop();

        //  And bring the bricks back from the dead :)
        bricks.callAll('revive');
    }

}

function ballHitPaddle(_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x) {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    } else if (_ball.x > _paddle.x) {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x - _paddle.x;
        _ball.body.velocity.x = (10 * diff);
    } else {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }
}
