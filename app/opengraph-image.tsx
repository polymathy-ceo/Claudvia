import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Claudvia — Built Beyond Limits.";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#0b0c0e",
          color: "#f5f5f5",
          padding: "88px",
          fontFamily: "Arial",
          border: "1px solid #303236"
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: "8px",
            color: "#c5c7ca"
          }}
        >
          CLAUDVIA
        </div>

        <div
          style={{
            display: "flex",
            width: 76,
            height: 2,
            backgroundColor: "#e5e5e5",
            marginTop: 48,
            marginBottom: 42
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-3px",
            lineHeight: 1.1
          }}
        >
          Built Beyond Limits.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 25,
            color: "#a9aaad",
            marginTop: 30
          }}
        >
          Software · Digital Products · Developer Tools
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 88,
            bottom: 55,
            fontSize: 16,
            letterSpacing: "2px",
            color: "#77797d"
          }}
        >
          CLAUDVIA.VERCEL.APP
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
