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
            elements.push(ball);
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
})();

window.addEventListener("load", main);

function main() {
    var board = new Board(600, 600);
    var canvas = document.getElementById("canvas");
    var boardView = new BoardView(canvas, board);
} 