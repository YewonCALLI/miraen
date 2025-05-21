type Props = {
  mode: "real" | "thermal";
  toggleMode: () => void;
};

const ModeToggle: React.FC<Props> = ({ mode, toggleMode }) => {
  return (
    <button onClick={toggleMode} style={{ marginBottom: 10 }}>
      모드 전환: {mode === "real" ? "실사" : "열화상"}
    </button>
  );
};

export default ModeToggle;
