// Ventana y lógica del juego
(function () {
    /**
     * Ventana del juego
     * @param {*} width Ancho de la ventana
     * @param {*} height Alto de la ventana
     */
    self.Board = function (width, height) {
        this.width = width;
        this.height = height;
        this.playing = false;
        this.game_over = false;
        this.paddles = [];
        this.ball = null;
        this.playing = false;
    }

    self.Board.prototype = {
        get elements() {
            let elements = this.paddles.map(function (paddle) { return paddle; });
            elements.push(this.ball);
            return elements
        }
    }
})();

(function () {
    /**
     * Vista de la ventana del juego
     * @param {*} canvas Elemento que dibuja los gráficos
     * @param {*} board Ventana del juego
     */
    self.BoardView = function (canvas, board) {
        this.canvas = canvas;
        this.canvas.width = board.width;
        this.canvas.height = board.height;
        this.board = board;
        this.ctx = canvas.getContext("2d")
    }

    self.BoardView.prototype = {
        /**
         * Dibuja todos los elementos en la ventana
         */
        draw: function () {
            for (let index = this.board.elements.length - 1; index >= 0; index--) {
                let elm = this.board.elements[index];

                draw(this.ctx, elm);
            };
        },
        /**
         * Refresca lo que se muestra en la ventana
         */
        clean: function () {
            this.ctx.clearRect(0, 0, this.board.width, this.board.height);
        },
        /**
         * Lógica del juego
         */
        play: function () {
            if (this.board.playing) {
                this.clean();
                this.draw();
                this.check_collisions();
                this.board.ball.move();
            }
        },
        check_collisions: function () {
            for (let index = this.board.paddles.length - 1; index >= 0; index--) {
                let paddle = this.board.paddles[index];
                if (hit(paddle, this.board.ball.collider)) {
                    this.board.ball.collision(paddle)
                }
            };
        }
    }

    /**
     * Dibuja un elemento recibido como parámetro en la ventana
     * @param {*} ctx Contexto del canvas
     * @param {*} element Elemento a dibujar
     */
    function draw(ctx, element) {
        switch (element.kind) {
            case "rectangle":
                ctx.fillRect(element.x, element.y, element.width, element.height);
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(element.x, element.y, element.radius, 0, 7);
                ctx.fill();
                ctx.closePath();
                break;
        }
    }

    /**
     * Comprueba que dos elementos tienen una colisión
     * @param {*} elemento_1 
     * @param {*} elemento_2 
     * @returns Boolean
     */
    function hit(elemento_1, elemento_2) {
        let hit = false;

        if (elemento_2.x + elemento_2.width >= elemento_1.x && elemento_2.x < elemento_1.x + elemento_1.width) {
            if (elemento_2.y + elemento_2.height >= elemento_1.y && elemento_2.y < elemento_1.y + elemento_1.height)
                hit = true;
        }

        if (elemento_2.x <= elemento_1.x && elemento_2.x + elemento_2.width >= elemento_1.x + elemento_1.width) {
            if (elemento_2.y <= elemento_1.y && elemento_2.y + elemento_2.height >= elemento_1.y + elemento_1.height) {
                hit = true;
            }
        }

        if (elemento_1.x <= elemento_2.x && elemento_1.x + elemento_1.width >= elemento_2.x + elemento_2.width) {
            if (elemento_1.y <= elemento_2.y && elemento_1.y + elemento_1.height >= elemento_2.y + elemento_2.height) {
                hit = true;
            }
        }
        return hit;
    }
})();

// Elementos del juego
(function () {
    /**
     * Elemento paleta del juego
     * @param {*} x Ubicación de la paleta en el eje x
     * @param {*} y Ubicación de la paleta en el eje y
     * @param {*} width Ancho de la paleta
     * @param {*} height Alto de la paleta
     * @param {*} board Ventana del juego
     */
    self.Paddle = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.kind = "rectangle";
        this.board.paddles.push(this);
        this.speed = 10;
    }

    self.Paddle.prototype = {
        /**
         * Desplaza la paleta hacia arriba
         */
        down: function () {
            this.y += this.speed;
        },
        /**
         * Desplaza la paleta hacia abajo
         */
        up: function () {
            this.y -= this.speed;
        },
        toString: function () {
            return "x: " + this.x + " y: " + this.y;
        }
    }
})();

(function () {
    /**
     * Elemento bola del juego
     * @param {*} x Ubicación de la bola en el eje x
     * @param {*} y Ubicación de la bola en el eje y
     * @param {*} radius Radio de la bola
     * @param {*} board Ventana de juego
     */
    self.Ball = function (x, y, radius, board) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.collider = new Collider(this);
        this.speed_y = 0;
        this.speed_x = 3;
        this.speed = this.speed_x + this.speed_y;
        this.board = board;
        board.ball = this;
        this.kind = "circle";
        this.direction = -1;
        this.bounceAngle = 0;
        this.maxBounceAngle = Math.PI / 12;
    }

    self.Ball.prototype = {
        move: function () {
            this.x += this.speed_x * this.direction;
            this.y += this.speed_y * this.direction;
        },
        collision: function (paddle) {
            let relativeIntersectY = (paddle.y + (paddle.height / 2)) - this.y;
            let normalizedIntersectY = relativeIntersectY / (paddle.height / 2);
            this.bounceAngle = normalizedIntersectY * this.maxBounceAngle;
            this.speed_y = this.speed * -Math.sin(this.bounceAngle);
            this.speed_x = this.speed * Math.cos(this.bounceAngle);
            if (this.x > (this.board.width / 2)) {
                this.direction = -1;
            } else {
                this.direction = 1;
            }
        }
    }

    self.Collider = function(ball) {
        this.ball = ball;
    }
    
    self.Collider.prototype = {
        get width() {
            return this.ball.radius * 2.1
        },
        get height() {
            return this.ball.radius * 2.1
        },
        get x() {
            return this.ball.x - this.ball.radius
        },
        get y() {
            return this.ball.y - this.ball.radius
        }
    }

})();

// Inicialización de variables
window.addEventListener("load", main);
var board;
var canvas;
var board_view;
var paddle_1;
var paddle_2;

function main() {
    board = new Board(800, 600);
    canvas = document.getElementById("canvas");
    board_view = new BoardView(canvas, board);

    let paddle_height = 100;
    let paddle_width = 20;
    let paddle_x = board.width - paddle_width * 2;
    let paddle_y = board.height / 2 - paddle_height / 2;
    paddle_1 = new Paddle(paddle_width, paddle_y, paddle_width, paddle_height, board);
    paddle_2 = new Paddle(paddle_x, paddle_y, paddle_width, paddle_height, board);

    let ball_radius = 10;
    var ball = new Ball(board.width / 2 - ball_radius, board.height / 2 - ball_radius, ball_radius, board)

    board_view.draw();
    controller();
}

// Captura de teclas presionadas    
document.addEventListener("keydown", function (ev) {
    if (ev.keyCode === 32) {
        ev.preventDefault();
        board.playing = !board.playing;
    } else if (board.playing) {
        if (ev.keyCode === 87) {
            ev.preventDefault();
            paddle_1.up();
        } else if (ev.keyCode === 83) {
            ev.preventDefault();
            paddle_1.down();
            ev.preventDefault();
        } else if (ev.keyCode === 38) {
            ev.preventDefault();
            paddle_2.up();
        } else if (ev.keyCode === 40) {
            ev.preventDefault();
            paddle_2.down();
        }
    }
});

// Actualización de la ventana del juego
window.requestAnimationFrame(controller);
function controller() {
    if (board_view != undefined)
        board_view.play();
    window.requestAnimationFrame(controller);
}