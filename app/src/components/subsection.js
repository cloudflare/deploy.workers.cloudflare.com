import React from "react";

export default ({ active, children, title }) => {
  const classes = `flex items-center justify-content mb-2`;
  return (
    <div className={`mt-6 ${active ? "" : "mb-8"}`}>
      <div className={classes}>
        <div
          className={`w-4 h-4 ${
            active ? "bg-blue-4" : "bg-gray-3"
          } rounded-full -ml-12`}
        />
        <div className="ml-8">
          <span className="text-gray-1">{title}</span>
        </div>
      </div>
      <div className="text-gray-3">{active ? children : null}</div>
    </div>
  );
};
