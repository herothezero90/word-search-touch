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

  // Create the grid
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

    $(".cell").each(function () {
      if ($(this).text() === "") {
        const randomLetter =
          alphabet[Math.floor(Math.random() * alphabet.length)];
        $(this).text(randomLetter);
      }
    });
  }

  // Apply rounded corners
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

  // Cross out found word
  function crossOutWord(word) {
    $("#words li").each(function () {
      if ($(this).text() === word) {
        $(this).addClass("crossed");
      }
    });
  }

  // Detect the direction (horizontal or vertical)
  function detectDirection() {
    if (selectedCells.length < 2) return;
    const firstIndex = selectedCells[0];
    const secondIndex = selectedCells[1];

    const firstRow = Math.floor(firstIndex / gridSize);
    const secondRow = Math.floor(secondIndex / gridSize);
    const firstCol = firstIndex % gridSize;
    const secondCol = secondIndex % gridSize;

    if (firstRow === secondRow) {
      isHorizontal = true; // Lock to horizontal
    } else if (firstCol === secondCol) {
      isHorizontal = false; // Lock to vertical
    } else {
      // Invalid direction (diagonal or mixed)
      return false;
    }

    directionLocked = true; // Lock the direction
    return true;
  }

  // Check if movement is valid in the locked direction
  function isValidDirection(index) {
    const firstIndex = selectedCells[0];
    const firstRow = Math.floor(firstIndex / gridSize);
    const firstCol = firstIndex % gridSize;
    const currentRow = Math.floor(index / gridSize);
    const currentCol = index % gridSize;

    if (isHorizontal) {
      return firstRow === currentRow; // Must be in the same row
    } else {
      return firstCol === currentCol; // Must be in the same column
    }
  }

  // Disable selected cells
  function disableSelectedCells() {
    selectedCells.forEach((index) => {
      const $cell = $(`.cell[data-index="${index}"]`);
      $cell.addClass("disabled").off();
    });
  }

  // Mouse down or touch start
  function cellSelection() {
    $(".cell").on("mousedown touchstart", function (e) {
      e.preventDefault();

      if ($(this).hasClass("correct") || $(this).hasClass("disabled")) {
        return;
      }

      isDragging = true;
      selectedCells = [];
      selectedWord = "";
      directionLocked = false; // Reset direction for each new selection

      const index = $(this).data("index");
      const letter = $(this).text();
      $(this).addClass("marked");
      selectedCells.push(index);
      selectedWord += letter;

      applyRoundedCorners();
    });

    // Mouse move or touch move (dragging)
    $(".cell").on("mousemove touchmove", function (e) {
      if (!isDragging) return; // Only work if dragging
      e.preventDefault();

      const index = $(this).data("index");

      if ($(this).hasClass("correct") || $(this).hasClass("disabled")) {
        return; // Prevent marking disabled cells
      }

      const letter = $(this).text();
      if (!selectedCells.includes(index)) {
        if (selectedCells.length === 1 && !directionLocked) {
          if (!detectDirection()) return; // Detect the direction after two cells
        }

        // Only allow movement in the locked direction
        if (directionLocked && !isValidDirection(index)) {
          return; // Block if movement is invalid
        }

        $(this).addClass("marked");
        selectedCells.push(index);
        selectedWord += letter;

        applyRoundedCorners();
      }
    });

    // Mouse up or touch end (finalize the selection)
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
    });
  }

  createGrid();
  cellSelection();
});
