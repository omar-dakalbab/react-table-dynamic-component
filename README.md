# TableComponent

## Overview

TableComponent is a reusable and customizable React component for displaying, filtering, sorting, paginating, and exporting tabular data. It supports resizable columns and filtering both globally and per column.

## Features

- **Global Search**: Search across all columns.
- **Column Filters**: Individual filters for each column.
- **Sorting**: Clickable headers for ascending/descending sorting.
- **Pagination**: Navigate between pages with custom page sizes.
- **Resizable Columns**: Adjust column width dynamically.
- **CSV Export**: Export table data to a CSV file.

## Installation

```sh
npm install
```

## Usage

```jsx
import React from "react";
import TableComponent from "./TableComponent";

const data = [
  ["John Doe", "john@example.com", "New York"],
  ["Jane Smith", "jane@example.com", "Los Angeles"],
  ["Bob Johnson", "bob@example.com", "Chicago"],
];

const headers = ["Name", "Email", "City"];

function App() {
  return (
    <div>
      <TableComponent data={data} headers={headers} />
    </div>
  );
}

export default App;
```

## Props

| Prop Name         | Type    | Default         | Description                                |
| ----------------- | ------- | --------------- | ------------------------------------------ |
| `data`            | `Array` | `[]`            | Array of rows, where each row is an array. |
| `headers`         | `Array` | `[]`            | Array of column headers.                   |
| `pageSizeOptions` | `Array` | `[10, 50, 200]` | Options for number of rows per page.       |

## Styling

The component uses `style.css` for basic styling. You can customize it further based on your design needs.

## License

This project is open-source and free to use.
