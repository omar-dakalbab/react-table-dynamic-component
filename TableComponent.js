import React, { useEffect, useRef, useState, useMemo } from "react";
import "./style.css";

const TableComponent = ({ pageSizeOptions = [10, 50, 200], data, headers }) => {
  if (!data || !headers)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>
          Please provide `data` and `headers` to the TableComponent component.
          Read me for more information.
        </h2>
      </div>
    );

  const tableRef = useRef(null);

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState(() => {
    const initial = {};
    headers.forEach((header) => {
      initial[header] = "";
    });
    return initial;
  });

  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (globalFilter) {
      const lowerGlobal = globalFilter.toLowerCase();
      filtered = filtered.filter((row) =>
        row.some((cell) => String(cell).toLowerCase().includes(lowerGlobal))
      );
    }
    filtered = filtered.filter((row) => {
      return row.every((cell, index) => {
        const filterValue = columnFilters[headers[index]];
        if (!filterValue) return true;
        return String(cell).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
    return filtered;
  }, [data, globalFilter, columnFilters, headers]);

  const sortedData = useMemo(() => {
    if (!sortConfig.column) return filteredData;
    const columnIndex = headers.indexOf(sortConfig.column);
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[columnIndex];
      const bValue = b[columnIndex];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig, headers]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const columns = table.querySelectorAll("th.resizable");
    let currentColumn;
    let startX;
    let startWidth;

    const handleMouseDown = (e) => {
      currentColumn = e.target.parentElement;
      startX = e.pageX;
      startWidth = currentColumn.offsetWidth;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
      if (!currentColumn) return;
      const newWidth = startWidth + (e.pageX - startX);
      currentColumn.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    columns.forEach((col) => {
      const resizer = document.createElement("div");
      resizer.className = "resizer";
      col.appendChild(resizer);
      resizer.addEventListener("mousedown", handleMouseDown);
    });

    return () => {
      columns.forEach((col) => {
        const resizer = col.querySelector(".resizer");
        if (resizer) {
          resizer.removeEventListener("mousedown", handleMouseDown);
        }
      });
    };
  }, [headers]);

  const handleSort = (header) => {
    let direction = "asc";
    if (sortConfig.column === header && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ column: header, direction });
  };

  const handleColumnFilterChange = (header, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [header]: value,
    }));
    setCurrentPage(1);
  };

  const handleGlobalFilterChange = (e) => {
    setGlobalFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setGlobalFilter("");
    const cleared = {};
    headers.forEach((header) => (cleared[header] = ""));
    setColumnFilters(cleared);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const exportCSV = () => {
    const csvRows = [];
    csvRows.push(headers.join(","));
    sortedData.forEach((row) => {
      csvRows.push(row.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "table_data.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="table-wrapper">
      <div className="table-controls">
        <input
          type="text"
          placeholder="Global Search..."
          value={globalFilter}
          onChange={handleGlobalFilterChange}
          className="global-filter"
        />
        <button onClick={clearFilters} className="btn-clear">
          Clear Filters
        </button>
        <button onClick={exportCSV} className="btn-export">
          Export CSV
        </button>
      </div>

      <div className="table-container">
        <table ref={tableRef}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(header)}
                  className={`resizable header-sort ${
                    sortConfig.column === header ? sortConfig.direction : ""
                  }`}
                >
                  {header}
                  <span className="sort-indicator">
                    {sortConfig.column === header
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="filter-row">
              {headers.map((header, index) => (
                <th key={index}>
                  <input
                    type="text"
                    placeholder={`Filter ${header}`}
                    value={columnFilters[header]}
                    onChange={(e) =>
                      handleColumnFilterChange(header, e.target.value)
                    }
                    className="column-filter"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length}>No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {pageSizeOptions.map((size, index) => (
              <option key={index} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default TableComponent;
