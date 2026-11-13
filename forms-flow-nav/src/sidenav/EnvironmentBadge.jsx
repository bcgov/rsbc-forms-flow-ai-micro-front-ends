import React from "react";
import { ENVIRONMENT_NAME } from "../constants/constants";
import "./EnvironmentBadge.scss";

const EnvironmentBadge = () => {
  const getEnvironmentClass = (envName) => {
    const env = envName?.toLowerCase().trim();
    switch (env) {
      case "development":
        return "badge-development";
      case "test":
        return "badge-test";
      case "training":
        return "badge-training";
      case "production":
        return "badge-production";
      default:
        return "badge-default";
    }
  };

  // Production environment badge should not be visible
  if (ENVIRONMENT_NAME?.toLowerCase().trim() === "production") {
    return null;
  }

  return (
    <div className={`environment-badge ${getEnvironmentClass(ENVIRONMENT_NAME)}`}>
      {ENVIRONMENT_NAME}
    </div>
  );
};

export default EnvironmentBadge;
