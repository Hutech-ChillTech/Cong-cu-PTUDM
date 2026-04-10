import React from "react";
// import "../../styles/AdminStyle.css";

interface StatCardProps {
  title: string;
  value: number | string;
  color: "primary" | "success" | "danger" | "warning";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  return (
    <div className="col-md-3 mb-3">
      <div className={`card text-white bg-${color} shadow`}>
        <div className="card-body">
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
