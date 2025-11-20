# Factorial 52: The Scale of Shuffles

This project visualizes the immense scale of 52 factorial (52!), the number of unique combinations in a deck of cards, by comparing it to other massive quantities in a linear scale model.

## Project Overview

The application uses React Three Fiber to create a 3D journey through magnitudes of scale. Different quantities are represented as planets arranged side-by-side, growing exponentially in size. The sheer size of the "Cards" planet demonstrates how 52! dwarfs other "astronomical" numbers, even the number of atoms in our galaxy.

### The Scale Hierarchy
The visualization guides you through eight planetary scales before revealing the Sun:

1.  **Humans on Earth** (~$8 \times 10^9$)
2.  **Ants on Earth** (~$2 \times 10^{16}$)
3.  **Seconds since Big Bang** (~$4 \times 10^{17}$)
4.  **Grains of Sand** (~$7.5 \times 10^{18}$)
5.  **Drops of Water in Oceans** (~$2.6 \times 10^{25}$)
6.  **Atoms on Earth** (~$10^{50}$)
7.  **Atoms in Milky Way** (~$10^{67}$)
8.  **Shuffle Combinations (!52)** (~$8 \times 10^{67}$)
9.  **The Sun** - A massive backdrop serving as the final visual reference.

## Implementation Summary

To bring this visualization to life, the following steps were taken:

1.  **Initialized Project**: Created a new modern web application using Vite + React.
2.  **Installed Dependencies**: Integrated `three` for 3D rendering, `@react-three/fiber` and `@react-three/drei` for React integration, and `zustand` for state management.
3.  **Implemented Code**:
    *   **Linear Side-by-Side Layout**: Planets are arranged in a line with increasing spacing to accommodate their size and labels.
    *   **Visual Scaling**: Used a compressed visual scale to make the planets viewable together while representing the hierarchy.
    *   **Particle Geometry**: Planets are rendered as clouds of small dots (instanced meshes) for a unique visual style.
    *   **Intro & Quiz**: Added an interactive intro screen with a 3D fanned deck of cards and a quiz to engage the user.
    *   **Camera Control**: Implemented a smooth camera controller that focuses on each planet before zooming out to show context.
4.  **Documentation**: Documented the setup, decisions, and structure in this README.

## Project Structure

Here is an overview of the project's file organization:

```text
factorial52/
├── node_modules/       # Installed project dependencies
├── public/             # Static assets (e.g., favicon)
│   └── vite.svg        # Vite logo
├── src/                # Source code for the application
│   ├── assets/         # Imported assets (card textures)
│   ├── App.css         # App-specific styles (unused in favor of index.css)
│   ├── App.jsx         # MAIN COMPONENT: Contains the 3D scene and logic
│   ├── index.css       # GLOBAL STYLES: Handles full-screen layout & UI overlay
│   └── main.jsx        # Entry point: Mounts the App component to the DOM
├── .gitignore          # Specifies files git should ignore
├── eslint.config.js    # Configuration for code linting
├── index.html          # HTML entry point that loads the React app
├── package.json        # Project metadata and dependency list
├── README.md           # Project documentation
└── vite.config.js      # Vite configuration file
```

### Key Files Explained
*   **`src/App.jsx`**: The core of the application. It defines the `Sun`, `PlanetSphere`, `Intro`, and `CameraController` components, and manages the state transition between stages.
*   **`src/index.css`**: Contains the CSS resets and styling for the UI overlay (quiz, title, buttons).

## How to Run Locally

1.  **Install Dependencies** (if not already done):
    ```bash
    npm install
    ```

2.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    The terminal will display a local URL (usually `http://localhost:5173/`). Open this link in your web browser to view the visualization.

## Usage

*   **Intro**: Answer the quiz question to unlock the start button.
*   **Navigation**: Use "Next Scale" and "Previous" to travel between planets.
*   **Observe the Numbers**: Note the full decimal representation of each number to appreciate the scale.
*   **Context**: As you move to larger planets, the camera zooms out to show the smaller preceding planets side-by-side.
