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
        this.bars = [];
        this.ball = null;
    }

    self.Board.prototype = {
        get elements() {
            var elements = this.bars;
            elements.push(this.ball);
            return elements
        }
    }
})();

(function () {
    /**
     * Elemento barra del juego
     * @param {*} x Ubicación de la barra en el eje x
     * @param {*} y Ubicación de la barra en el eje y
     * @param {*} width Ancho de la barra
     * @param {*} height Alto de la barra
     * @param {*} board Ventana del juego
     */
    self.Bar = function (x, y, width, height, board) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.board = board;
        this.kind = "rectangle";
        this.board.bars.push(this);
    }

    self.Bar.prototype = {
        /**
         * Desplaza la barra hacia arriba
         */
        down: function () {

        },
        /**
         * Desplaza la barra hacia abajo
         */
        up: function () {

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
        }
    }

    /**
     * Dibuja un elemento recibido como parámetro en la ventana
     * @param {*} ctx Contexto del canvas
     * @param {*} element Elemento a dibujar
     */
    function draw(ctx, element) {
        if (element !== null && element.hasOwnProperty("kind")) {
            switch (element.kind) {
                case "rectangle":
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    break;
            }
        }
    }
})();

window.addEventListener("load", main);

function main() {
    var board = new Board(600, 600);

    let bar_height = 100;
    let bar_width = 40;
    let bar_y = board.height / 2 - bar_height;
    let bar_x = board.width - bar_width * 2;
    var bar1 = new Bar(bar_width, bar_y, bar_width, bar_height, board);
    var bar2 = new Bar(bar_x, bar_y, bar_width, bar_height, board);

    var canvas = document.getElementById("canvas");
    var board_view = new BoardView(canvas, board);
    board_view.draw();
} 