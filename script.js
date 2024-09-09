/* eslint-disable no-undef */
$(document).ready(function () {
  const words = ["HELLO", "WORLD", "JQUERY", "CODE"];
  const gridSize = 10;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let isDragging = false;
  let selectedCells = [];
  let selectedWord = "";

  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      $("#grid").append(`<div class="cell" data-index="${i}"></div>`);
    }

    words.forEach((word) => {
      let randomRow = Math.floor(Math.random() * gridSize);
      let startCol = Math.floor(Math.random() * (gridSize - word.length));
      for (let i = 0; i < word.length; i++) {
        const index = randomRow * gridSize + startCol + i;
        $(`.cell[data-index="${index}"]`).text(word[i]);
        $(`.cell[data-index="${index}"]`).attr("data-word", word);
      }
    });

    $(".cell").each(function () {
      if ($(this).text() === "") {
        const randomLetter =
          alphabet[Math.floor(Math.random() * alphabet.length)];
        $(this).text(randomLetter);
      }
    });
  }

  function getTouchCell(event) {
    const touch =
      event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if ($(element).hasClass("cell")) {
      return $(element);
    }
    return null;
  }

  function cellSelection() {
    $(".cell").on("mousedown touchstart", function (e) {
      e.preventDefault(); // Prevent default behavior
      isDragging = true;
      selectedCells = [];
      selectedWord = "";

      const index = $(this).data("index");
      const letter = $(this).text();
      $(this).addClass("marked");
      selectedCells.push(index);
      selectedWord += letter;
    });

    $(".cell").on("mousemove", function (e) {
      e.preventDefault(); // Prevent default behavior
      if (isDragging) {
        const index = $(this).data("index");
        const letter = $(this).text();
        if (!selectedCells.includes(index)) {
          $(this).addClass("marked");
          selectedCells.push(index);
          selectedWord += letter;
        }
      }
    });

    // Handle touch move separately
    $(".cell").on("touchmove", function (e) {
      e.preventDefault(); // Prevent scrolling
      if (isDragging) {
        const $cell = getTouchCell(e); // Get the cell the user is touching
        if ($cell) {
          const index = $cell.data("index");
          const letter = $cell.text();
          if (!selectedCells.includes(index)) {
            $cell.addClass("marked");
            selectedCells.push(index);
            selectedWord += letter;
          }
        }
      }
    });

    $(document).on("mouseup touchend", function () {
      isDragging = false;

      if (words.includes(selectedWord)) {
        selectedCells.forEach((index) => {
          $(`.cell[data-index="${index}"]`)
            .removeClass("marked")
            .addClass("correct");
        });
      } else {
        selectedCells.forEach((index) => {
          $(`.cell[data-index="${index}"]`)
            .removeClass("marked")
            .addClass("incorrect");
        });
        setTimeout(() => {
          selectedCells.forEach((index) => {
            $(`.cell[data-index="${index}"]`).removeClass("incorrect");
          });
        }, 200);
      }
    });
  }

  createGrid();
  cellSelection();
});
