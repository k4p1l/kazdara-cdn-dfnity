import React from "react";

const formatTimestamp = (nanoseconds) => {
  // Ensure nanoseconds is converted to a Number if it's a BigInt
  const numericNanoseconds =
    typeof nanoseconds === "bigint" ? Number(nanoseconds) : nanoseconds;

  // Convert nanoseconds to milliseconds
  const milliseconds = numericNanoseconds / 1_000_000;

  // Create a Date object
  const date = new Date(milliseconds);

  // Format the date using toLocaleString()
  return date.toLocaleString();
};

const FormatDate = ({ uploadDateNanoseconds }) => {
  return (
    <div>
      <p>{formatTimestamp(uploadDateNanoseconds)}</p>
    </div>
  );
};

export default FormatDate;
