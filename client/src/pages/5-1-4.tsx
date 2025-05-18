import React from 'react';

interface ButtonProps {
  label: string;
  link: string;
}

const LinkButton: React.FC<ButtonProps> = ({ label, link }) => {
  return (
    <a 
      href={link}
      className="inline-block px-6 py-3 mx-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
    > 
      {label}
    </a>
  );
};

const CenteredButtons: React.FC = () => {
  const buttons: ButtonProps[] = [
    { label: '우리 몸의 구조와 기능 - 뼈와 근육 생김새 관찰', link: '/5-1-4-1' },
    { label: '우리 몸의 구조와 기능 - 근육과 뼈 움직임 보기', link: '/5-1-4-2' },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center space-x-4">
        {buttons.map((button, index) => (
          <LinkButton key={index} label={button.label} link={button.link} />
        ))}
      </div>
    </div>
  );
};

export default CenteredButtons;