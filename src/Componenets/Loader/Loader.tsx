import "./Loader.scss";
export default function Loader() {
  return (
    <>
      <div className="loader-container">
        <div className="loader" id="loader"></div>
      </div>
      <div className="dark-screen" id="dark-screen"></div>
    </>
  );
}
