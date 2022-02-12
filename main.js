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
        this.limits = [];
        this.ball = null;
    }

    self.Board.prototype = {
        get elements() {
            let pad = this.paddles.map(function (paddle) { return paddle; })
            let lim = this.limits.map(function (limit) { return limit; });
            let elements = pad.concat(lim);
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
                    this.board.ball.collision_paddle(paddle);
                }
            };
            for (let index = this.board.limits.length - 1; index >= 0; index--) {
                let limit = this.board.limits[index];
                if (hit(limit, this.board.ball.collider)) {
                    this.board.ball.collision_limit(limit);
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
                ctx.fillStyle = element.color;
                ctx.globalAlpha = element.opacity;
                ctx.fillRect(element.x, element.y, element.width, element.height);
                ctx.fillStyle = "#000000";
                ctx.globalAlpha = 1;
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
     * @param {*} element_1 
     * @param {*} element_2 
     * @returns Boolean
     */
    function hit(element_1, element_2) {
        let hit = false;

        if (element_2.x + element_2.width >= element_1.x && element_2.x < element_1.x + element_1.width) {
            if (element_2.y + element_2.height >= element_1.y && element_2.y < element_1.y + element_1.height) {
                hit = true;
            }

        }

        if (element_2.x <= element_1.x && element_2.x + element_2.width >= element_1.x + element_1.width) {
            if (element_2.y <= element_1.y && element_2.y + element_2.height >= element_1.y + element_1.height) {
                hit = true;
            }
        }

        if (element_1.x <= element_2.x && element_1.x + element_1.width >= element_2.x + element_2.width) {
            if (element_1.y <= element_2.y && element_1.y + element_1.height >= element_2.y + element_2.height) {
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
    self.Paddle = function (x, y, width, height, board, color = "#000000", opacity = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.color = color;
        this.opacity = opacity;
        this.kind = "rectangle";
        this.board.paddles.push(this);
        this.speed = 50;
    }

    self.Paddle.prototype = {
        /**
         * Desplaza la paleta hacia arriba
         */
        down: function () {
            if (this.y + this.height + this.speed < this.board.limits[1].y ) {
                this.y += this.speed;
            } else {
                this.y = this.board.limits[1].y - this.height;
            }
        },
        /**
         * Desplaza la paleta hacia abajo
         */
        up: function () {
            if (this.y - this.speed > this.board.limits[0].y + this.board.limits[0].height) {
                this.y -= this.speed;
            } else {
                this.y = this.board.limits[0].y + this.board.limits[0].height;
            }
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
        this.speed_x = 5;
        this.speed_y = 0;
        this.speed = this.speed_x + this.speed_y;
        this.direction_x = this.determinate_direction(this.speed_x);
        this.direction_y = this.determinate_direction(this.speed_y);
        this.bounceAngle = 0;
        this.maxBounceAngle = Math.PI / 12;
        this.board = board;
        board.ball = this;
        this.kind = "circle";
    }

    self.Ball.prototype = {
        move: function () {
            this.x += this.speed_x * this.direction_x;
            this.y += this.speed_y * this.direction_y;

        },
        collision_paddle: function (paddle) {
            let relativeIntersectY = (paddle.y + (paddle.height / 2)) - this.y;
            let normalizedIntersectY = relativeIntersectY / (paddle.height / 2);
            this.bounceAngle = normalizedIntersectY * this.maxBounceAngle;
            this.speed_y = this.speed * -Math.sin(this.bounceAngle);
            this.direction_y = this.determinate_direction(this.speed_y);
            this.speed_y = Math.abs(this.speed_y);
            this.speed_x = this.speed * Math.cos(this.bounceAngle);

            if (this.x > (this.board.width / 2)) {
                this.direction_x = -1;
            } else {
                this.direction_x = 1;
            }
        },
        collision_limit: function (limit) {
            if (this.y < (this.board.height / 2)) {
                this.direction_y = 1;
            } else {
                this.direction_y = -1;
            }
        },
        determinate_direction: function (speed) {
            if (speed == 0) return 0;
            else if (speed > 0) return 1;
            else if (speed < 0) return -1;
        }
    }

    self.Collider = function (ball) {
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

(function () {
    /**
     * Elemento limite del juego
     * @param {*} x Ubicación del limite en el eje x
     * @param {*} y Ubicación del limite en el eje y
     * @param {*} width Ancho del limite
     * @param {*} height Alto del limite
     * @param {*} board Ventana del juego
     */
    self.Limit = function (x, y, width, height, board, color = "#ffffff", opacity = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.color = color;
        this.opacity = opacity;
        this.kind = "rectangle";
        this.board.limits.push(this);
    }
})();

// Inicialización de variables
window.addEventListener("load", main);
var board;
var canvas;
var board_view;
var paddle_1;
var paddle_2;
var upper_limit;
var lower_limit;

function main() {
    board = new Board(800, 600);
    canvas = document.getElementById("canvas");
    board_view = new BoardView(canvas, board);

    let paddle_height = 100;
    let paddle_width = 20;
    let paddle_x = board.width - paddle_width * 2;
    let paddle_y = board.height / 2 - paddle_height / 2;
    paddle_1 = new Paddle(paddle_width, paddle_y, paddle_width, paddle_height, board, "#D92217");
    paddle_2 = new Paddle(paddle_x, paddle_y, paddle_width, paddle_height, board, "#171DD9");

    let limit_height = 2;
    upper_limit = new Limit(0, 0, board.width, limit_height, board, "#000000", 0);
    lower_limit = new Limit(0, board.height - limit_height, board.width, limit_height, board, "#000000", 0);

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