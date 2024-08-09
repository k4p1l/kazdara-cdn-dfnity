import bg from "../public/bg.png";
import "./Home.css";

function Home() {
  return (
    <header>
      <h1>Kazdara CDN</h1>
      <img className="bg" src={bg} alt="background" />
    </header>
  );
}

export default Home;
