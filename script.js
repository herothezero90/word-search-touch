/* eslint-disable no-undef */
$(document).ready(function () {
  const words = ["CHICKEN", "COW", "GOOSE", "PIG", "SHEEP"];
  const gridSize = 10;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let isDragging = false;
  let selectedCells = [];
  let selectedWord = "";
  let wordCount = 0;
  let isHorizontal = true;

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
    if (selectedCells.length < 2) return;
    const firstIndex = selectedCells[0];
    const secondIndex = selectedCells[1];

    const firstRow = Math.floor(firstIndex / gridSize);
    const secondRow = Math.floor(secondIndex / gridSize);

    isHorizontal = firstRow === secondRow;
  }

  //   RIGHT CLICK PREVENT //
  $("#grid").on("contextmenu", function (e) {
    e.preventDefault();
  });

  //    MOUSE AND TOUCH EVENTS //
  function getTouchCell(event) {
    const touch =
      event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if ($(element).hasClass("cell")) {
      return $(element);
    }
    return null;
  }
  //    MOUSE DOWN //
  function cellSelection() {
    $(".cell").on("mousedown touchstart", function (e) {
      e.preventDefault();

      if ($(this).hasClass("correct")) {
        return;
      }

      isDragging = true;
      selectedCells = [];
      selectedWord = "";

      const index = $(this).data("index");
      const letter = $(this).text();
      $(this).addClass("marked");
      selectedCells.push(index);
      selectedWord += letter;

      applyRoundedCorners();
    });

    //    MOUSE MOVE    //
    $(".cell").on("mousemove", function (e) {
      e.preventDefault();
      if (isDragging) {
        const index = $(this).data("index");

        if ($(this).hasClass("correct")) {
          return;
        }

        const letter = $(this).text();
        if (!selectedCells.includes(index)) {
          $(this).addClass("marked");
          selectedCells.push(index);
          selectedWord += letter;

          detectDirection();
          applyRoundedCorners();
        }
      }
    });
    //        TOUCH MOVE     //
    $(".cell").on("touchmove", function (e) {
      e.preventDefault();
      if (isDragging) {
        const $cell = getTouchCell(e);

        if ($cell && $cell.hasClass("correct")) {
          return;
        }

        if ($cell) {
          const index = $cell.data("index");
          const letter = $cell.text();
          if (!selectedCells.includes(index)) {
            $cell.addClass("marked");
            selectedCells.push(index);
            selectedWord += letter;

            detectDirection();
            applyRoundedCorners();
          }
        }
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
    });
  }

  createGrid();
  cellSelection();
});
