import { useControls } from 'leva';

interface Props {
  onChange: (level: number) => void;
}

export default function UI({ onChange }: Props) {
  useControls({
    Sieve_Level: {
      value: 1,
      min: 0,
      max: 2,
      step: 1,
      onChange: (v: number) => onChange(v),
    },
  });

  return null;
}
