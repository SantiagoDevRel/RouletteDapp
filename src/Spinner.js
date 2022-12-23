import { useState, CSSProperties } from "react";
import {CircleLoader} from "react-spinners/";

export default function Spinner({color}) {
  let [loading, setLoading] = useState(true);

  return (
    <div className="sweet-loading">
      <center>
      <CircleLoader
        color={color}
        speedMultiplier={1}
        loading={loading}
      />
      </center>
    </div>
  );
}