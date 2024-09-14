/* eslint-disable no-undef */
$(document).ready(function () {
  const words = ["CHICKEN", "COW", "GOOSE", "PIG", "SHEEP"];
  const gridSize = 10;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let isDragging = false;
  let selectedCells = [];
  let selectedWord = "";
  let wordCount = 0;
  let isHorizontal = null; // Lock direction (horizontal or vertical)
  let directionLocked = false; // Flag to lock direction

  $("#words").html(words.map((item) => `<li>${item}</li>`).join(""));

  //    GRID    //
  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      $("#grid").append(`<div class="cell" data-index="${i}"></div>`);
    }

    words.forEach((word) => {
      let placed = false;
      while (!placed) {
        let isHorizontal = Math.random() > 0.5;
        if (isHorizontal) {
          let randomRow = Math.floor(Math.random() * gridSize);
          let startCol = Math.floor(Math.random() * (gridSize - word.length));
          let canPlace = true;

          for (let i = 0; i < word.length; i++) {
            const index = randomRow * gridSize + startCol + i;
            if ($(`.cell[data-index="${index}"]`).text() !== "") {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const index = randomRow * gridSize + startCol + i;
              $(`.cell[data-index="${index}"]`).text(word[i]);
              $(`.cell[data-index="${index}"]`).attr("data-word", word);
            }
            placed = true;
          }
        } else {
          let randomCol = Math.floor(Math.random() * gridSize);
          let startRow = Math.floor(Math.random() * (gridSize - word.length));
          let canPlace = true;

          for (let i = 0; i < word.length; i++) {
            const index = (startRow + i) * gridSize + randomCol;
            if ($(`.cell[data-index="${index}"]`).text() !== "") {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const index = (startRow + i) * gridSize + randomCol;
              $(`.cell[data-index="${index}"]`).text(word[i]);
              $(`.cell[data-index="${index}"]`).attr("data-word", word);
            }
            placed = true;
          }
        }
      }
    });
    //    LETTERS   //
    $(".cell").each(function () {
      if ($(this).text() === "") {
        const randomLetter =
          alphabet[Math.floor(Math.random() * alphabet.length)];
        $(this).text(randomLetter);
      }
    });
  }
  //       CORNERS //
  function applyRoundedCorners() {
    selectedCells.forEach((index) => {
      $(`.cell[data-index="${index}"]`).removeClass(
        "rounded-left rounded-right rounded-top rounded-bottom"
      );
    });

    if (selectedCells.length > 0) {
      if (isHorizontal) {
        $(`.cell[data-index="${selectedCells[0]}"]`).addClass("rounded-left");
        $(
          `.cell[data-index="${selectedCells[selectedCells.length - 1]}"]`
        ).addClass("rounded-right");
      } else {
        $(`.cell[data-index="${selectedCells[0]}"]`).addClass("rounded-top");
        $(
          `.cell[data-index="${selectedCells[selectedCells.length - 1]}"]`
        ).addClass("rounded-bottom");
      }
    }
  }
  //    CROSS OUT   //
  function crossOutWord(word) {
    $("#words li").each(function () {
      if ($(this).text() === word) {
        $(this).addClass("crossed");
      }
    });
  }
  //    DIRECTION //
  function detectDirection() {
    if (selectedCells.length < 2) return true;
    const firstIndex = selectedCells[0];
    const secondIndex = selectedCells[1];

    const firstRow = Math.floor(firstIndex / gridSize);
    const secondRow = Math.floor(secondIndex / gridSize);
    const firstCol = firstIndex % gridSize;
    const secondCol = secondIndex % gridSize;

    if (firstRow === secondRow) {
      isHorizontal = true;
    } else if (firstCol === secondCol) {
      isHorizontal = false;
    } else {
      return false;
    }

    directionLocked = true;
    return true;
  }

  function isValidDirection(index) {
    const firstIndex = selectedCells[0];
    const firstRow = Math.floor(firstIndex / gridSize);
    const firstCol = firstIndex % gridSize;
    const currentRow = Math.floor(index / gridSize);
    const currentCol = index % gridSize;

    if (isHorizontal) {
      return firstRow === currentRow;
    } else {
      return firstCol === currentCol;
    }
  }

  // DISABLE SELECTED
  function disableSelectedCells() {
    selectedCells.forEach((index) => {
      const $cell = $(`.cell[data-index="${index}"]`);
      $cell.addClass("disabled").off();
    });
  }

  //   RIGHT CLICK PREVENT //
  $("#grid").on("contextmenu", function (e) {
    e.preventDefault();
  });

  //    MOUSE AND TOUCH EVENTS //
  // function getTouchCell(event) {
  //   const touch =
  //     event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
  //   const element = document.elementFromPoint(touch.clientX, touch.clientY);
  //   if ($(element).hasClass("cell")) {
  //     return $(element);
  //   }
  //   return null;
  // }

  //    MOUSE DOWN //
  function cellSelection() {
    $(".cell").on("mousedown touchstart", function (e) {
      e.preventDefault();

      if ($(this).hasClass("correct") || $(this).hasClass("disabled")) {
        return;
      }

      isDragging = true;
      selectedCells = [];
      selectedWord = "";
      directionLocked = false;
      isHorizontal = null;

      const index = $(this).data("index");
      const letter = $(this).text();
      $(this).addClass("marked");
      selectedCells.push(index);
      selectedWord += letter;

      applyRoundedCorners();
    });

    //    MOUSE MOVE    //
    $(document).on("mousemove touchmove", function (e) {
      if (!isDragging) return;
      e.preventDefault();

      let clientX, clientY;
      if (e.type === "touchmove") {
        const touch =
          e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const element = document.elementFromPoint(clientX, clientY);

      if (!$(element).hasClass("cell")) {
        return;
      }

      const $cell = $(element);
      const index = $cell.data("index");

      if ($cell.hasClass("correct") || $cell.hasClass("disabled")) {
        return;
      }

      const letter = $cell.text();
      if (!selectedCells.includes(index)) {
        if (selectedCells.length === 1 && !directionLocked) {
          selectedCells.push(index);
          selectedWord += letter;

          if (!detectDirection()) {
            isDragging = false;
            $cell.removeClass("marked");
            return;
          }
        } else {
          if (directionLocked && !isValidDirection(index)) {
            return;
          }
          selectedCells.push(index);
          selectedWord += letter;
        }

        $cell.addClass("marked");
        applyRoundedCorners();
      }
    });

    //    MOUSE UP   -     TOUCH END //
    $(document).on("mouseup touchend", function () {
      isDragging = false;

      if (words.includes(selectedWord)) {
        wordCount++;
        const colorClass = `correct-${(wordCount % 10) + 1}`;

        selectedCells.forEach((index, i) => {
          const cell = $(`.cell[data-index="${index}"]`);
          cell.removeClass("marked incorrect").addClass(colorClass);

          if (isHorizontal) {
            if (i === 0) cell.addClass("rounded-left");
            if (i === selectedCells.length - 1) cell.addClass("rounded-right");
          } else {
            if (i === 0) cell.addClass("rounded-top");
            if (i === selectedCells.length - 1) cell.addClass("rounded-bottom");
          }
        });
        crossOutWord(selectedWord);
        disableSelectedCells();
      } else {
        selectedCells.forEach((index) => {
          $(`.cell[data-index="${index}"]`)
            .removeClass("marked")
            .addClass("incorrect");
        });
        setTimeout(() => {
          $(".cell").removeClass("incorrect");
        }, 200);
      }

      selectedCells = [];
      selectedWord = "";
      isHorizontal = null; // Reset direction
      directionLocked = false;
      $(".cell").removeClass("marked");
    });
  }

  createGrid();
  cellSelection();
});
