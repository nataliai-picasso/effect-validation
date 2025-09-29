# Effect React TypeScript App

A modern React TypeScript application built with Vite, featuring a split-screen layout with an input field on the left and an output field on the right, both taking 100% height.

## Features

- Split-screen layout with input and output sections
- 100% height utilization for both sections
- Real-time mirroring of input to output
- Responsive design that stacks vertically on mobile devices
- Clean, modern UI with monospace font for better readability

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
effect/
├── src/
│   ├── App.tsx            # Main React TypeScript component
│   ├── App.scss           # SCSS styles for the application
│   └── index.tsx          # TypeScript entry point
├── index.html             # HTML template (Vite entry point)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md             # This file
```

## Usage

- Type in the left input field
- See the output mirrored in real-time on the right side
- The layout is fully responsive and will stack vertically on smaller screens

## Customization

You can easily modify the behavior by editing the `handleInputChange` function in `src/App.tsx` to process the input differently before displaying it in the output section. The project is fully typed with TypeScript for better development experience and type safety, and uses Vite for lightning-fast development and optimized builds.
