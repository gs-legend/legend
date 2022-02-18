import React, { ReactNode } from "react";
import { useTrackProgress } from "core/services/TrackProgress";
import "./GlobalLoader.less";

const GlobalLoader = ({ children }: { children: ReactNode }) => {
  const isInProgress = useTrackProgress();

  const loader = function () {
    return isInProgress ? (
      <>
        <div className="loader-container"> </div>
        <div className="loader-content">
          <div className="loader">
            <div className="container">
              <i className="layer"></i>
              <i className="layer"></i>
              <i className="layer"></i>
            </div>
            <div className="bounce"></div>
          </div>
        </div>
      </>
    ) : (
      <></>
    );
  };
  return (
    <>
      {loader()}
      {children}
    </>
  );
};

export default GlobalLoader;
