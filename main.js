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
            for (var i = this.board.elements.length - 1; i >= 0; i--) {
                var elm = this.board.elements[i];
                
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
            this.clean();
            this.draw();
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
        this.speed_y = 0;
        this.speed_x = 3;
        this.board = board;
        board.ball = this;
        this.kind = "circle";
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

    paddle_1 = new Paddle(paddle_width * 2, paddle_y, paddle_width, paddle_height, board);
    paddle_2 = new Paddle(paddle_x, paddle_y, paddle_width, paddle_height, board);

    let ball_radius = 10;
    var ball = new Ball(board.width / 2 - ball_radius, board.height / 2 - ball_radius, ball_radius, board)

    controller();
}

// Captura de teclas presionadas    
document.addEventListener("keydown", function (ev) {
    ev.preventDefault();
    if (ev.keyCode === 87) {
        paddle_1.up();
    } else if (ev.keyCode === 83) {
        paddle_1.down();
    } else if (ev.keyCode === 38) {
        paddle_2.up();
    } else if (ev.keyCode === 40) {
        paddle_2.down();
    }
});

// Actualización de la ventana del juego
window.requestAnimationFrame(controller);
function controller() {
    if (board_view != undefined)
        board_view.play();
    window.requestAnimationFrame(controller);
}