var game;
var ballOnPaddle = true;
var lives = 3;
var score = 0;
var stageWidth = 800;
var livesText;
var ball;
var paddle;
var bricks;

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {
    // Do all the scaling
    if (!game.device.desktop) {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        game.scale.setScreenSize(true);
    } else {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }

    game.load.image('paddle', 'img/paddle.png');
    game.load.image('ball', 'img/ball.png');
    game.load.image('brick', 'img/brick.png');
    btnimg = game.load.image('refresh', 'img/output.png');
    game.load.audio('hits', 'js/hit.wav');
    game.load.audio('sad', 'js/cartoon015.mp3');
    game.load.audio('over', 'js/game_over.wav');

    btnimg.scale = 0.5;

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

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 6; x++) {
            brick = bricks.create(50 + (x * 120), 120 + (y * 52), 'brick');
            brick.body.bounce.set(1);
            brick.body.immovable = true;
        }
    }

    paddle = game.add.sprite(game.world.centerX, 580, 'paddle');

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    //create refresh button
    refreshbtn = game.add.button(380, 250, 'refresh', actionOnClick);

    //create the paddle
    paddle.body.collideWorldBounds = true;
    paddle.anchor.set(0.5, 0.5);
    paddle.body.immovable = true;

    //create the ball
    ball = game.add.sprite(game.world.centerX, paddle.y - 25, 'ball');
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.bounce.set(1);
    ball.anchor.set(0.5, 0.5);
    ball.checkWorldBounds = true;

    ball.body.collideWorldBounds = true;

    //We don't want to check for out of worldBound when the ball goes down the screen
    game.physics.arcade.checkCollision.down = false;

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(20, 20, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(720, 20, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);
    refreshbtn.anchor.setTo(0.5, 0.2);
    refreshbtn.visible = false;

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

    if (paddle.x > game.width || paddle.x < 5) {
        paddle.x = game.width - 2;
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
        introText.visible = false;
        refreshbtn.visible = false;
    }

}

function ballLost() {

    lives--;
    life = game.sound.play('sad');
    livesText.text = 'lives: ' + lives;

    if (lives === 0) {
        gameOver();
    } else {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
    }

}

function gameOver() {

    ball.body.velocity.setTo(0, 0);

    introText.text = 'Game Over!';
    introText.visible = true;
    life = game.sound.play('over');
    refreshbtn.visible = true;
    game.input.onDown.add(actionOnClick, this);
}

function actionOnClick() {
    refreshbtn.visible = true;
    introText.visible = false;
    document.location.reload();
}

function ballHitBrick(_ball, _brick) {

    _brick.kill();
    point = game.sound.play('hits');
    score += 10;

    scoreText.text = 'score: ' + score;

    //  Are there any bricks left?
    if (bricks.countLiving() == 0) {
        ball.body.velocity.setTo(0, 0);
        winAlert = game.add.text(game.world.centerX, game.world.centerY, 'Congratulations, You won!!', { font: "20px Arial", fill: "red", align: "centre" });
    }

}

function ballHitPaddle(_ball, _paddle) {

    var diff = 0;

    if (_ball.x < _paddle.x) {
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    } else if (ball.x > paddle.x) {
        diff = ball.x - paddle.x;
        _ball.body.velocity.x = (10 * diff);
    } else {
        _ball.body.velocity.x = 2 + Math.random() * 2;
    }
}
