type Props = {
  temperature: number;
  heatUp: () => void;
};

const HeatControl: React.FC<Props> = ({ temperature, heatUp }) => {
  return (
    <div>
      <div>현재 온도: {temperature}℃</div>
      <button onClick={heatUp}>가열하기</button>
    </div>
  );
};

export default HeatControl;
