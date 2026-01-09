
---

## JavaScript Overview

- `Card` class represents a single card with:
  - `face` (emoji)  
  - `id` (unique identifier)  
  - `revealed` (boolean)  
  - `matched` (boolean)  

- Core functions:
  - `shuffleArray(arr)` – Randomizes array elements.
  - `buildDeck(rows, cols)` – Creates a shuffled deck of emoji cards.
  - `createCardElement(card)` – Generates the DOM element for a card.
  - `renderBoard(rows, cols)` – Builds the game grid.
  - `onCardClick(card, el)` – Handles card flipping and matching logic.
  - `updateStats()` – Updates moves and matched pairs display.
  - `startTimer()` / `stopTimer()` – Handles the game timer.

- **Event listeners**:
  - Restart button: resets the board.
  - Shuffle button: reshuffles cards.
  - Grid select dropdown: changes the board layout.

---

## Customization

- Add more emojis by updating the `EMOJIS` array in `main.js`.
- Adjust card sizes via CSS `--card-size` variable.
- Change flip animations by editing `.card-inner` in `style.css`.

---

## License

This project is **MIT licensed** – free to use, modify, and share.

---

## Screenshots

*(Add screenshots of the game board here for better documentation.)*
