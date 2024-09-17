/* eslint-disable no-undef */
$(document).ready(function () {
  const words = ["CHICKEN", "COW", "GOOSE", "PIG", "SHEEP"];
  const gridSize = 10;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let isDragging = false;
  let startIndex = null;
  let selectedCells = [];
  let selectedWord = "";
  let wordCount = 0;
  let direction = null;

  const age = 2;

  let validDirections = [];

  if (age === 1) {
    validDirections = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];
  } else if (age === 2 || age === 3) {
    validDirections = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
    ];
  }

  let z_index = 1;
  
  $("#words").html(words.map((item) => `<li>${item}</li>`).join(""));

  // GRID CREATION //
  function createGrid() {
    for (let i = 0; i < gridSize * gridSize; i++) {
      $("#grid").append(`<div class="cell" data-index="${i}"></div>`);
    }

    words.forEach((word) => {
      let placed = false;
      while (!placed) {
        const dirIndex = Math.floor(Math.random() * validDirections.length);
        const dir = validDirections[dirIndex];
        const startRow = Math.floor(Math.random() * gridSize);
        const startCol = Math.floor(Math.random() * gridSize);
        let canPlace = true;
        let positions = [];

        for (let i = 0; i < word.length; i++) {
          const row = startRow + dir.y * i;
          const col = startCol + dir.x * i;

          if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            canPlace = false;
            break;
          }

          const index = row * gridSize + col;
          if ($(`.cell[data-index="${index}"]`).text() !== "") {
            canPlace = false;
            break;
          }
          positions.push(index);
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const index = positions[i];
            $(`.cell[data-index="${index}"]`).text(word[i]);
            $(`.cell[data-index="${index}"]`).attr("data-word", word);
          }
          placed = true;
        }
      }
    });

    // POPULATE CELLS //
    $(".cell").each(function () {
      if ($(this).text() === "") {
        const randomLetter =
          alphabet[Math.floor(Math.random() * alphabet.length)];
        $(this).text(randomLetter);
      }
    });
  }

  // CROSS OUT FOUND WORD //
  function crossOutWord(word) {
    $("#words li").each(function () {
      if ($(this).text() === word) {
        $(this).addClass("crossed");
      }
    });
  }

  // DISABLE SELECTED CELLS //
  function disableSelectedCells() {
    selectedCells.forEach((index) => {
      const $cell = $(`.cell[data-index="${index}"]`);
      $cell.addClass("disabled").off();
    });
  }

  // GET CLIENT COORDINATES (MOUSE OR TOUCH) //
  function getClientCoordinates(e) {
    let clientX, clientY;
    if (e.type.includes("touch")) {
      const touch =
        e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return { clientX, clientY };
  }

  // PREVENT RIGHT-CLICK //
  $("#grid").on("contextmenu", function (e) {
    e.preventDefault();
  });

  // CELL SELECTION //
  function cellSelection() {
    $(".cell").on("mousedown touchstart", function (e) {
      e.preventDefault();
      
      if ($(this).hasClass("correct") || $(this).hasClass("disabled")) {
        return;
      }

      isDragging = true;
      selectedCells = [];
      selectedWord = "";
      direction = null;

      startIndex = $(this).data("index");
      const letter = $(this).text();

      selectedCells.push(startIndex);
      selectedWord += letter;

      $(".cell").removeClass("marked");
      $(this).addClass("marked");
    });

    // MOUSE MOVE  TOUCH MOVE //
    $(document).on("mousemove touchmove", function (e) {
      if (!isDragging) return;
      e.preventDefault();
      
      const { clientX, clientY } = getClientCoordinates(e);
      const element = document.elementFromPoint(clientX, clientY);

      if (!$(element).hasClass("cell")) return;

      const $cell = $(element);
      const currentIndex = $cell.data("index");

      if (currentIndex === startIndex) return;

      const result = getCellsInLine(startIndex, currentIndex);

      if (!result) return;

      // REMOVE MARK
      $(".cell").removeClass("marked");

      selectedCells = result.path;
      direction = result.direction;
      
      selectedWord = selectedCells
        .map((index) => $(`.cell[data-index="${index}"]`).text())
        .join("");

      // MARK
      selectedCells.forEach((index) => {
        $(`.cell[data-index="${index}"]`).addClass("marked");
      });
    });

    // MOUSE UP / TOUCH END //
    $(document).on("mouseup touchend", function (e) {
      
      if (!isDragging) return;
      isDragging = false;

      if (!direction) {
        resetSelection();
        return;
      }
      
      const isAllowedDirection = validDirections.some(
        (dir) =>
          (dir.x === direction.x && dir.y === direction.y) ||
          (dir.x === -direction.x && dir.y === -direction.y)
      );

      if (!isAllowedDirection) {
        selectedCells.forEach((index) => {
          $(`.cell[data-index="${index}"]`)
            .removeClass("marked")
            .addClass("invalid-direction");
        });
        setTimeout(() => {
          $(".cell").removeClass("invalid-direction");
        }, 200);
        resetSelection();
        return;
      }
      // REVERSE WORD //
      const reversedWord = selectedWord.split("").reverse().join("");

      if (words.includes(selectedWord) || words.includes(reversedWord)) {
        wordCount++;
        const colorClass = `correct-${(wordCount % 10) + 1}`;
        selectedCells.sort((a, b) => a - b);
        selectedCells.forEach((value, index) => {
          const cell = $(`.cell[data-index="${value}"]`);
          cell.removeClass("marked incorrect");
          
          
          let angle = 0;
          let width = 'w-100';
          let additional_class = '';

          if (index === 0) {
            // FIRST ELEMENT
            additional_class = 'border_left';
          } else if (index === selectedCells.length -1) {
            // LAST ELEMENT
            additional_class = 'border_right';
          }

          if (direction.x === 0 && (direction.y === 1 || direction.y === -1)) { // VERTICAL
            angle = '90';
          } else if ((direction.x === 1 && direction.y === 1) || (direction.x === -1 && direction.y === -1)) { // DIAGONAL LEFT
            angle = '45';
            width = 'w_diagonal';
          } else if ((direction.x === 1 && direction.y === -1) || (direction.x === -1 && direction.y === 1)) { // DIAGONAL RIGHT
            angle = '135';
            width = 'w_diagonal';
          }

          const marker_element = `<div class="marker_element ${colorClass} ${width} ${additional_class}" style="transform: rotate(${angle}deg); z-index: ${z_index}"></div>`
          cell.append(marker_element);
          z_index +=1;
         
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

      resetSelection();
    });
  }

  // RESET SELECTION //
  function resetSelection() {
    selectedCells = [];
    selectedWord = "";
    direction = null;
    startIndex = null;
    $(".cell").removeClass("marked");
  }

  // GET CELLS IN LINE //
  function getCellsInLine(startIndex, endIndex) {
    const startRow = Math.floor(startIndex / gridSize);
    const startCol = startIndex % gridSize;
    const endRow = Math.floor(endIndex / gridSize);
    const endCol = endIndex % gridSize;

    const deltaRow = endRow - startRow;
    const deltaCol = endCol - startCol;

    const gcd = Math.abs(greatestCommonDivisor(deltaRow, deltaCol));
    const stepRow = deltaRow / gcd || 0;
    const stepCol = deltaCol / gcd || 0;

    const length = gcd + 1;
    let path = [];
    for (let i = 0; i < length; i++) {
      const row = startRow + stepRow * i;
      const col = startCol + stepCol * i;

      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return null;
      }

      const index = row * gridSize + col;
      path.push(index);
    }

    return {
      path: path,
      direction: { x: stepCol, y: stepRow },
    };
  }

  function greatestCommonDivisor(a, b) {
    if (b === 0) return Math.abs(a);
    return greatestCommonDivisor(b, a % b);
  }

  createGrid();
  cellSelection();

});
